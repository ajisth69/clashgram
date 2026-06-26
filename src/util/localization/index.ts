import type { TeactNode } from '../../lib/teact/teact';

import type {
  ApiLanguage,
  CachedLangData,
  LangPack,
  LangPackStringValue,
} from '../../api/types';
import type { TimeFormat } from '../../types';
import type { LangKey, LangVariable } from '../../types/language';
import {
  type AdvancedLangFnOptions,
  type AdvancedLangFnOptionsWithPlural,
  type AdvancedLangFnParameters,
  areAdvancedLangFnOptions,
  isDeletedLangString,
  isPluralLangString,
  type LangFn,
  type LangFnOptions,
  type LangFnOptionsWithPlural,
  type LangFnParameters,
  type LangFormatters,
  type RegularLangFnParameters,
} from './types';

import { DEBUG, FALLBACK_LANG_CODE, FORCE_FALLBACK_LANG, LANG_PACK } from '../../config';
import { callApi } from '../../api/gramjs';
import renderText, { type TextFilter } from '../../components/common/helpers/renderText';
import { IS_INTL_LIST_FORMAT_SUPPORTED } from '../browser/globalEnvironment';
import { MAIN_IDB_STORE } from '../browser/idb';
import { getBasicListFormat } from '../browser/intlListFormat';
import { notifyLangpackUpdate } from '../browser/multitab';
import { createCallbackManager } from '../callbacks';
import readFallbackStrings from '../data/readFallbackStrings';
import readStrings from '../data/readStrings';
import { initialEstablishmentPromise, isCurrentTabMaster } from '../establishMultitabRole';
import { omit, unique } from '../iteratees';
import { replaceInStringsWithTeact } from '../replaceWithTeact';
import { fastRaf } from '../schedulers';
import { resetDateFormatCache } from './dateFormat';

import Deferred from '../Deferred';
import LimitedMap from '../primitives/LimitedMap';

import initialStrings from '../../assets/localization/initialStrings';

const LANGPACK_STORE_PREFIX = 'langpack-';
const FORMATTERS_FALLBACK_LANG = FALLBACK_LANG_CODE;

const STRING_CACHE_LIMIT = 400;
const TRANSLATION_CACHE = new LimitedMap<string, string>(STRING_CACHE_LIMIT);

const CUSTOM_STRINGS_CACHE = new Map<string, Record<string, string>>();
const PLURAL_RULE_SELECT_CACHE = new Map<string, Intl.LDMLPluralRule>();

const localizationFiles = import.meta.glob('../../assets/localization/*.strings', { query: '?raw', import: 'default' });

export async function loadCustomStrings(langCode: string): Promise<Record<string, string>> {
  const cleanLangCode = langCode.replace('-raw', '');
  const cached = CUSTOM_STRINGS_CACHE.get(cleanLangCode);
  if (cached) return cached;

  try {
    const loader = localizationFiles[`../../assets/localization/${cleanLangCode}.strings`];
    if (!loader) return {};
    const content = await loader() as string;
    const parsed = readStrings(content);
    CUSTOM_STRINGS_CACHE.set(cleanLangCode, parsed);
    return parsed;
  } catch (e) {
    return {};
  }
}

function parseStringsToLangPack(rawStrings: Record<string, string>): Record<string, any> {
  const strings: Record<string, any> = {};

  for (const key in rawStrings) {
    if (Object.prototype.hasOwnProperty.call(rawStrings, key)) {
      const value = rawStrings[key];
      const [clearKey, pluralSuffix] = key.split('_');

      if (!pluralSuffix) {
        strings[clearKey] = value;
        continue;
      }

      const knownValue = (strings[clearKey] || {}) as any;
      knownValue[pluralSuffix] = value;
      strings[clearKey] = knownValue;
    }
  }

  return strings;
}

let language: ApiLanguage | undefined;
let formatters: LangFormatters | undefined;

let langPack: LangPack | undefined;
let fallbackLangPack: LangPack | undefined;
let currentTimeFormat: TimeFormat = '24h';

let translationFn = createTranslationFn();

const {
  addCallback,
  removeCallback,
  runCallbacks,
} = createCallbackManager();

let areCallbacksScheduled = false;
function scheduleCallbacks() {
  if (areCallbacksScheduled) return;
  areCallbacksScheduled = true;
  fastRaf(() => {
    runCallbacks();
    areCallbacksScheduled = false;
  });
}

const localizationReady = new Deferred<void>();

function loadCachedLangData(langCode: string) {
  return MAIN_IDB_STORE.get<CachedLangData>(`${LANGPACK_STORE_PREFIX}${langCode}`);
}

function cacheLangData(data: CachedLangData) {
  notifyLangpackUpdate(data.language.langCode);
  return MAIN_IDB_STORE.set(`${LANGPACK_STORE_PREFIX}${data.language.langCode}`, data);
}

let fallbackLoadPromise: Promise<CachedLangData> | undefined;
async function loadFallbackPack() {
  if (fallbackLangPack || fallbackLoadPromise) return;
  fallbackLoadPromise = readFallbackStrings();
  const fallbackData = await fallbackLoadPromise;
  fallbackLangPack = fallbackData.langPack;

  TRANSLATION_CACHE.clear();

  if (!language) {
    updateLanguage(fallbackData.language);
  } else {
    translationFn = createTranslationFn();
    scheduleCallbacks();
  }
}

async function fetchDifference() {
  if (!langPack || !language) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.warn('[Localization] Trying to fetch difference without loaded data');
    }
    return;
  }

  await initialEstablishmentPromise;
  if (!isCurrentTabMaster()) return;

  const result = await callApi('fetchLangDifference', {
    langPack: LANG_PACK,
    langCode: langPack.langCode,
    fromVersion: langPack.version,
  });
  if (!result) return;

  applyLangPackDifference(result.version, result.strings, result.keysToRemove);
}

export function applyLangPackDifference(
  version: number, strings: Record<string, LangPackStringValue>, keysToRemove: string[],
) {
  if (!langPack || !language || version === langPack.version) return;

  const newLangPack = {
    ...langPack,
    version,
    strings: {
      ...omit(langPack.strings, keysToRemove),
      ...strings,
    },
  };
  updateLangPack(newLangPack);

  cacheLangData({
    langPack: newLangPack,
    language,
  });
  scheduleCallbacks();
}

function updateLanguage(newLang: ApiLanguage) {
  language = newLang;

  createFormatters();

  translationFn = createTranslationFn();

  scheduleCallbacks();
}

function createFormatters() {
  PLURAL_RULE_SELECT_CACHE.clear();
  if (!language) return;
  const intlLocale = getIntlLocale();
  const listFormatFallback = getBasicListFormat();

  function createListFormat(lang: string, type: 'conjunction' | 'disjunction') {
    return IS_INTL_LIST_FORMAT_SUPPORTED ? new Intl.ListFormat(lang, { type }) : listFormatFallback;
  }

  try {
    formatters = {
      pluralRules: new Intl.PluralRules(intlLocale),
      region: new Intl.DisplayNames(intlLocale, { type: 'region' }),
      conjunction: createListFormat(intlLocale, 'conjunction'),
      disjunction: createListFormat(intlLocale, 'disjunction'),
      number: new Intl.NumberFormat(intlLocale),
      preciseNumber: new Intl.NumberFormat(intlLocale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 10,
      }),
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Failed to create formatters:', e);
    formatters = {
      pluralRules: new Intl.PluralRules(FORMATTERS_FALLBACK_LANG),
      region: new Intl.DisplayNames(FORMATTERS_FALLBACK_LANG, { type: 'region' }),
      conjunction: createListFormat(FORMATTERS_FALLBACK_LANG, 'conjunction'),
      disjunction: createListFormat(FORMATTERS_FALLBACK_LANG, 'disjunction'),
      number: new Intl.NumberFormat(FORMATTERS_FALLBACK_LANG),
      preciseNumber: new Intl.NumberFormat(FORMATTERS_FALLBACK_LANG, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 10,
      }),
    };
  }

  resetDateFormatCache();
}

function updateLangPack(newLangPack: LangPack) {
  langPack = newLangPack;

  TRANSLATION_CACHE.clear();

  scheduleCallbacks();
}

export async function initLocalization(langCode: string, canLoadFromServer?: boolean) {
  if (language) return;

  const cachedData = await loadCachedLangData(langCode);
  if (cachedData) {
    const customStrings = await loadCustomStrings(langCode);
    const rawCustomStrings = parseStringsToLangPack(customStrings);
    langPack = {
      ...cachedData.langPack,
      strings: {
        ...cachedData.langPack.strings,
        ...rawCustomStrings,
      },
    };
    language = cachedData.language;
    createFormatters();

    fetchDifference();
  } else if (canLoadFromServer) {
    await loadAndChangeLanguage(langCode);
  }

  // Always start loading fallback pack in the background. Some languages may not have every string translated.
  loadFallbackPack();

  translationFn = createTranslationFn();
  scheduleCallbacks();
  localizationReady.resolve();
}

export async function refreshFromCache(langCode: string) {
  if (isCurrentTabMaster()) return;

  const cachedData = await loadCachedLangData(langCode);
  if (cachedData) {
    const customStrings = await loadCustomStrings(langCode);
    const rawCustomStrings = parseStringsToLangPack(customStrings);
    updateLangPack({
      ...cachedData.langPack,
      strings: {
        ...cachedData.langPack.strings,
        ...rawCustomStrings,
      },
    });
    updateLanguage(cachedData.language);
  }
}

export async function loadAndChangeLanguage(langCode: string, shouldCheckCache?: boolean) {
  if (shouldCheckCache) { // Can be removed when old lang provider is phased out. Cache is checked in `initLocalization`.
    const cachedData = await loadCachedLangData(langCode);
    if (cachedData) {
      return changeLanguage(cachedData.language);
    }
  }

  await initialEstablishmentPromise;
  if (!isCurrentTabMaster()) return undefined;

  const remoteLanguage = await callApi('fetchLanguage', {
    langPack: LANG_PACK,
    langCode,
  });

  if (!remoteLanguage) {
    if (DEBUG) {
      // eslint-disable-next-line no-console
      console.warn('Failed to fetch language', langCode);
    }
    return undefined;
  }

  return changeLanguage(remoteLanguage);
}

export function requestLangPackDifference(langCode: string) {
  if (language?.langCode !== langCode) return;
  fetchDifference();
}

export async function changeLanguage(newLanguage: ApiLanguage) {
  if (langPack && language?.langCode === newLanguage.langCode) return;

  const cachedData = await loadCachedLangData(newLanguage.langCode);
  if (cachedData) {
    const customStrings = await loadCustomStrings(newLanguage.langCode);
    const rawCustomStrings = parseStringsToLangPack(customStrings);
    updateLangPack({
      ...cachedData.langPack,
      strings: {
        ...cachedData.langPack.strings,
        ...rawCustomStrings,
      },
    });
    updateLanguage(cachedData.language);

    fetchDifference();
  } else {
    await initialEstablishmentPromise;
    if (!isCurrentTabMaster()) return;
    const remoteLangPack = await callApi('fetchLangPack', {
      langPack: LANG_PACK,
      langCode: newLanguage.langCode,
    });
    if (!remoteLangPack) {
      // eslint-disable-next-line no-console
      console.warn('Failed to fetch lang pack');
      return;
    }

    const customStrings = await loadCustomStrings(newLanguage.langCode);
    const rawCustomStrings = parseStringsToLangPack(customStrings);
    updateLangPack({
      langCode: newLanguage.langCode,
      version: remoteLangPack.version,
      strings: {
        ...remoteLangPack.strings,
        ...rawCustomStrings,
      },
    });
    updateLanguage(newLanguage);

    cacheLangData({
      langPack: langPack!,
      language: newLanguage,
    });
  }

  document.documentElement.lang = newLanguage.baseLangCode || newLanguage.langCode;

  scheduleCallbacks();
}

function createTranslationFn(): LangFn {
  const fn: LangFn = ((
    key: LangKey,
    variables: Record<string, unknown> | undefined,
    options: LangFnOptions | AdvancedLangFnOptions | undefined,
  ) => {
    if (options && areAdvancedLangFnOptions(options)) {
      return processTranslationAdvanced(key, variables as Record<string, TeactNode>, options);
    }
    return processTranslation(key, variables as Record<string, string | number>, options);
  }) as LangFn;
  fn.rawCode = language?.langCode || FORMATTERS_FALLBACK_LANG;
  fn.isRtl = language?.isRtl;
  fn.code = language?.pluralCode || FORMATTERS_FALLBACK_LANG;
  fn.timeFormat = currentTimeFormat;
  fn.with = ({ key, variables, options }: LangFnParameters) => {
    if (options && areAdvancedLangFnOptions(options)) {
      return processTranslationAdvanced(key, variables as Record<string, TeactNode | undefined>, options);
    }
    return processTranslation(key, variables as Record<string, LangVariable>, options);
  };
  fn.withRegular = ({ key, variables, options }: RegularLangFnParameters) => {
    return processTranslation(key, variables, options);
  };
  fn.withAdvanced = ({ key, variables, options }: AdvancedLangFnParameters) => {
    return processTranslationAdvanced(key, variables, options);
  };
  fn.region = (code: string) => formatters?.region.of(code);
  fn.conjunction = (list: string[]) => formatters?.conjunction.format(list) || list.join(', ');
  fn.disjunction = (list: string[]) => formatters?.disjunction.format(list) || list.join(', ');
  fn.number = (value: number) => formatters?.number.format(value) || String(value);
  fn.preciseNumber = (value: number) => formatters?.preciseNumber.format(value) || String(value);
  fn.internalFormatters = formatters!;
  fn.languageInfo = language!;
  return fn;
}

export function getTranslationFn(): LangFn {
  return translationFn;
}

export function setTimeFormat(timeFormat: TimeFormat) {
  if (timeFormat === currentTimeFormat) {
    return;
  }

  currentTimeFormat = timeFormat;
  resetDateFormatCache();
  translationFn = createTranslationFn();
  scheduleCallbacks();
}

function getIntlLocale(languageInfo = language) {
  return languageInfo?.pluralCode || FORMATTERS_FALLBACK_LANG;
}

function buildFastCacheKey(
  langKey: string,
  variables?: Record<string, any>,
  options?: LangFnOptions | LangFnOptionsWithPlural,
): string {
  if (!variables && !options) {
    return langKey;
  }
  let key = langKey;
  if (variables) {
    for (const k in variables) {
      if (Object.prototype.hasOwnProperty.call(variables, k)) {
        const val = variables[k];
        if (val === undefined) continue;
        key += `\x00${k}:`;
        if (val !== null && typeof val === 'object') {
          if ('key' in val) {
            key += `r:${buildFastCacheKey(val.key, val.variables, val.options)}`;
          } else {
            key += 'o';
          }
        } else {
          key += val;
        }
      }
    }
  }
  if (options && 'pluralValue' in options && options.pluralValue !== undefined) {
    key += `\x00p:${options.pluralValue}`;
  }
  return key;
}

function getString(langKey: LangKey, count: number) {
  const shouldForceFallback = FORCE_FALLBACK_LANG && language?.langCode === FALLBACK_LANG_CODE;
  let langPackStringValue = !shouldForceFallback ? langPack?.strings[langKey] : undefined;

  if (!langPackStringValue && !fallbackLangPack) {
    loadFallbackPack();
  }

  langPackStringValue ||= fallbackLangPack?.strings[langKey];
  langPackStringValue ||= initialStrings[langKey];

  if (!langPackStringValue || isDeletedLangString(langPackStringValue)) return undefined;

  let pluralSuffix: Intl.LDMLPluralRule = 'other';
  if (formatters) {
    const locale = formatters.pluralRules.resolvedOptions().locale;
    const cacheKey = `${locale}-${count}`;
    let cached = PLURAL_RULE_SELECT_CACHE.get(cacheKey);
    if (!cached) {
      cached = formatters.pluralRules.select(count);
      PLURAL_RULE_SELECT_CACHE.set(cacheKey, cached);
    }
    pluralSuffix = cached;
  }

  const string = isPluralLangString(langPackStringValue)
    ? (langPackStringValue[pluralSuffix] || langPackStringValue.other)
    : langPackStringValue;

  return string;
}

function processTranslation(
  langKey: LangKey,
  variables?: Record<string, LangVariable | RegularLangFnParameters>,
  options?: LangFnOptions | LangFnOptionsWithPlural,
): string {
  const isCacheable = !options?.withNodes;
  const cacheKey = isCacheable ? buildFastCacheKey(langKey, variables, options) : undefined;
  if (cacheKey) {
    if (TRANSLATION_CACHE.has(cacheKey)) {
      return TRANSLATION_CACHE.get(cacheKey)!;
    }
  }

  const pluralValue = options && 'pluralValue' in options ? Number(options.pluralValue) : 0;
  const string = getString(langKey, pluralValue);

  if (!string) return langKey;

  let finalString = string;
  if (variables) {
    for (const key in variables) {
      if (Object.prototype.hasOwnProperty.call(variables, key)) {
        let value = variables[key];
        if (value === undefined) continue;
        if (value !== null && typeof value === 'object' && 'key' in value) { // Allow recursive variables in basic `lang.with`
          value = processTranslation(value.key, value.variables, value.options);
        }

        const valueAsString = Number.isFinite(value) ? formatters!.number.format(value as number) : String(value);
        finalString = finalString.replaceAll(`{${key}}`, valueAsString);
      }
    }
  }

  if (cacheKey) {
    TRANSLATION_CACHE.set(cacheKey, finalString);
  }

  return finalString;
}

function processTranslationAdvanced(
  langKey: LangKey,
  variables?: Record<string, TeactNode | undefined>,
  options?: AdvancedLangFnOptions | AdvancedLangFnOptionsWithPlural,
): TeactNode {
  const pluralValue = options && 'pluralValue' in options ? Number(options.pluralValue) : 0;
  const string = getString(langKey, pluralValue);
  if (!string) return langKey;

  let tempResult: TeactNode = string;
  if (options?.specialReplacement) {
    const specialReplacements = options.specialReplacement;
    for (const key in specialReplacements) {
      if (Object.prototype.hasOwnProperty.call(specialReplacements, key)) {
        tempResult = replaceInStringsWithTeact(tempResult, key, specialReplacements[key]);
      }
    }
  }

  const withRenderText = options?.withNodes;

  if (withRenderText) {
    const initialFilters: TextFilter[] = options.withMarkdown ? ['simple_markdown', 'emoji'] : ['emoji'];

    const filters = unique([...initialFilters, ...options.renderTextFilters || []]);

    const tempResultArray = Array.isArray(tempResult) ? tempResult : [tempResult];
    return tempResultArray.flatMap((curr: TeactNode) => {
      if (typeof curr !== 'string') {
        return curr;
      }

      return renderText(curr, filters, {
        markdownPostProcessor: (part: string) => {
          let result: TeactNode = part;
          if (variables) {
            for (const key in variables) {
              if (Object.prototype.hasOwnProperty.call(variables, key)) {
                const value = variables[key];
                if (value === undefined) continue;
                const preparedValue = Number.isFinite(value) ? formatters!.number.format(value as number) : value as TeactNode;
                result = replaceInStringsWithTeact(result, `{${key}}`, renderText(preparedValue));
              }
            }
          }
          return result;
        },
      });
    });
  }

  let finalResult = tempResult;
  if (variables) {
    for (const key in variables) {
      if (Object.prototype.hasOwnProperty.call(variables, key)) {
        const value = variables[key];
        if (value === undefined) continue;
        const preparedValue = Number.isFinite(value) ? formatters!.number.format(value as number) : value as TeactNode;
        finalResult = replaceInStringsWithTeact(finalResult, `{${key}}`, renderText(preparedValue));
      }
    }
  }

  return finalResult;
}

export const localizationReadyPromise = localizationReady.promise;

export {
  addCallback as addLocalizationCallback,
  removeCallback as removeLocalizationCallback,
};

export type {
  LangFn,
  LangFnParameters,
  RegularLangFnParameters,
  AdvancedLangFnParameters,
};
