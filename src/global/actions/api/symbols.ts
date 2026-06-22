import type {
  ApiError, ApiSticker, ApiStickerSet, ApiStickerSetInfo, ApiVideo,
} from '../../../api/types';
import { getIndexedDBKey, setIndexedDBKey } from '../../../clshgram/dbAdapter';

async function getLocalFavoriteStickers(): Promise<ApiSticker[]> {
  try {
    return (await getIndexedDBKey<ApiSticker[]>('clashgram_unlimited_favorite_stickers')) || [];
  } catch (e) {
    return [];
  }
}

async function saveLocalFavoriteStickers(stickers: ApiSticker[]) {
  try {
    await setIndexedDBKey<ApiSticker[]>('clashgram_unlimited_favorite_stickers', stickers);
  } catch (e) {
    console.error('Failed to save local favorite stickers:', e);
  }
}

async function getLocalSavedGifs(): Promise<ApiVideo[]> {
  try {
    return (await getIndexedDBKey<ApiVideo[]>('clashgram_unlimited_saved_gifs')) || [];
  } catch (e) {
    return [];
  }
}

async function saveLocalSavedGifs(gifs: ApiVideo[]) {
  try {
    await setIndexedDBKey<ApiVideo[]>('clashgram_unlimited_saved_gifs', gifs);
  } catch (e) {
    console.error('Failed to save local saved gifs:', e);
  }
}
import type { RequiredGlobalActions } from '../../index';
import type { ActionReturnType, GlobalState, TabArgs } from '../../types';

import { BIRTHDAY_NUMBERS_SET, DEBUG, RESTRICTED_EMOJI_SET } from '../../../config';
import { getCurrentTabId } from '../../../util/establishMultitabRole';
import { buildCollectionByKey } from '../../../util/iteratees';
import { oldTranslate } from '../../../util/oldLangProvider';
import * as langProvider from '../../../util/oldLangProvider';
import { pause, throttle } from '../../../util/schedulers';
import searchWords from '../../../util/searchWords';
import { callApi } from '../../../api/gramjs';
import {
  addActionHandler,
  getGlobal, setGlobal,
} from '../../index';
import {
  rebuildStickersForEmoji,
  replaceAnimatedEmojis,
  updateCustomEmojiForEmoji,
  updateCustomEmojiSets,
  updateGifSearch,
  updateRecentStatusCustomEmojis,
  updateStickerSearch,
  updateStickerSet,
  updateStickerSets,
  updateStickersForEmoji,
} from '../../reducers';
import { updateTabState } from '../../reducers/tabs';
import {
  selectIsCurrentUserFrozen, selectIsCurrentUserPremium, selectStickerSet, selectTabState,
} from '../../selectors';
import { selectCurrentLimit, selectPremiumLimit } from '../../selectors/limits';

const ADDED_SETS_THROTTLE = 200;
const ADDED_SETS_THROTTLE_CHUNK = 10;

const searchThrottled = throttle((cb) => cb(), 500, false);

addActionHandler('loadStickerSets', async (global, actions): Promise<void> => {
  try {
    const [addedStickers, addedCustomEmojis] = await Promise.all([
      callApi('fetchStickerSets', { hash: global.stickers.added.hash }),
      callApi('fetchCustomEmojiSets', { hash: global.customEmojis.added.hash }),
    ]);

    global = getGlobal();

    if (addedStickers) {
      global = updateStickerSets(
        global,
        'added',
        addedStickers.hash,
        addedStickers.sets,
      );
    } else if (!global.stickers.added.setIds) {
      global = {
        ...global,
        stickers: {
          ...global.stickers,
          added: {
            ...global.stickers.added,
            setIds: [],
          },
        },
      };
    }

    if (addedCustomEmojis) {
      global = updateCustomEmojiSets(
        global,
        addedCustomEmojis.hash,
        addedCustomEmojis.sets,
      );
    } else if (!global.customEmojis.added.setIds) {
      global = {
        ...global,
        customEmojis: {
          ...global.customEmojis,
          added: {
            ...global.customEmojis.added,
            setIds: [],
          },
        },
      };
    }

    setGlobal(global);

    actions.loadCustomEmojis({
      ids: global.recentCustomEmojis,
    });
  } catch (error) {
    if (DEBUG) {
      console.error('Failed to load sticker sets:', error);
    }
    global = getGlobal();
    let changed = false;
    if (!global.stickers.added.setIds) {
      global = {
        ...global,
        stickers: {
          ...global.stickers,
          added: {
            ...global.stickers.added,
            setIds: [],
          },
        },
      };
      changed = true;
    }
    if (!global.customEmojis.added.setIds) {
      global = {
        ...global,
        customEmojis: {
          ...global.customEmojis,
          added: {
            ...global.customEmojis.added,
            setIds: [],
          },
        },
      };
      changed = true;
    }
    if (changed) {
      setGlobal(global);
    }
  }
});

addActionHandler('loadAddedStickers', async (global, actions): Promise<void> => {
  const {
    added: {
      setIds: addedSetIds = [],
    },
    setsById: cached,
  } = global.stickers;
  const {
    added: {
      setIds: customEmojiSetIds = [],
    },
  } = global.customEmojis;
  const setIdsToLoad = [...addedSetIds, ...customEmojiSetIds];
  if (!setIdsToLoad.length) {
    return;
  }

  for (let i = 0; i < setIdsToLoad.length; i++) {
    const id = setIdsToLoad[i];
    if (cached[id]?.stickers) {
      continue; // Already loaded
    }
    actions.loadStickers({
      stickerSetInfo: { id, accessHash: cached[id].accessHash },
    });

    if (i % ADDED_SETS_THROTTLE_CHUNK === 0 && i > 0) {
      await pause(ADDED_SETS_THROTTLE);
    }
  }
});

addActionHandler('loadRecentStickers', (global): ActionReturnType => {
  const { hash } = global.stickers.recent || {};
  void loadRecentStickers(global, hash);
});

addActionHandler('loadFavoriteStickers', async (global): Promise<void> => {
  try {
    const { hash } = global.stickers.favorite || {};

    const favoriteStickers = await callApi('fetchFavoriteStickers', { hash });
    const localFavs = await getLocalFavoriteStickers();

    global = getGlobal();
    const currentStickers = global.stickers.favorite?.stickers || [];
    const apiStickers = favoriteStickers?.stickers || currentStickers;
    const mergedStickers = [...apiStickers];
    const apiStickersIds = new Set(apiStickers.map(s => s.id));
    
    localFavs.forEach(s => {
      if (!apiStickersIds.has(s.id)) {
        mergedStickers.push(s);
      }
    });

    global = {
      ...global,
      stickers: {
        ...global.stickers,
        favorite: {
          hash: favoriteStickers?.hash || global.stickers.favorite?.hash || '',
          stickers: mergedStickers,
        },
      },
    };
    setGlobal(global);
  } catch (error) {
    if (DEBUG) {
      console.error('Failed to load favorite stickers:', error);
    }
    try {
      const localFavs = await getLocalFavoriteStickers();
      global = getGlobal();
      const currentStickers = global.stickers.favorite?.stickers || [];
      const mergedStickers = [...currentStickers];
      const currentIds = new Set(currentStickers.map(s => s.id));
      localFavs.forEach(s => {
        if (!currentIds.has(s.id)) {
          mergedStickers.push(s);
        }
      });
      global = {
        ...global,
        stickers: {
          ...global.stickers,
          favorite: {
            ...global.stickers.favorite,
            stickers: mergedStickers,
          },
        },
      };
      setGlobal(global);
    } catch (e) {
      console.warn('Failed to recover local favorite stickers fallback:', e);
    }
  }
});

addActionHandler('loadPremiumStickers', async (global): Promise<void> => {
  try {
    const { hash } = global.stickers.premium || {};

    if (selectIsCurrentUserFrozen(global)) {
      return;
    }

    const result = await callApi('fetchStickersForEmoji', { emoji: '⭐️⭐️', hash });
    if (!result) {
      return;
    }

    global = getGlobal();

    global = {
      ...global,
      stickers: {
        ...global.stickers,
        premium: {
          hash: result.hash,
          stickers: result.stickers,
        },
      },
    };
    setGlobal(global);
  } catch (error) {
    if (DEBUG) {
      console.error('Failed to load premium stickers:', error);
    }
  }
});

addActionHandler('loadGreetingStickers', async (global): Promise<void> => {
  try {
    const { hash } = global.stickers.greeting || {};

    if (selectIsCurrentUserFrozen(global)) {
      return;
    }

    const greeting = await callApi('fetchStickersForEmoji', { emoji: '👋⭐️', hash });
    if (!greeting) {
      return;
    }

    global = getGlobal();

    global = {
      ...global,
      stickers: {
        ...global.stickers,
        greeting: {
          hash: greeting.hash,
          stickers: greeting.stickers.filter((sticker) => sticker.emoji === '👋'),
        },
      },
    };
    setGlobal(global);
  } catch (error) {
    if (DEBUG) {
      console.error('Failed to load greeting stickers:', error);
    }
  }
});

addActionHandler('loadFeaturedStickers', async (global): Promise<void> => {
  try {
    const { hash } = global.stickers.featured || {};
    const featuredStickers = await callApi('fetchFeaturedStickers', { hash });
    if (!featuredStickers) {
      return;
    }

    global = getGlobal();

    global = updateStickerSets(
      global,
      'featured',
      featuredStickers.hash,
      featuredStickers.sets,
    );
    setGlobal(global);
  } catch (error) {
    if (DEBUG) {
      console.error('Failed to load featured stickers:', error);
    }
  }
});

addActionHandler('loadDiceStickers', async (global): Promise<void> => {
  const emojis = global.appConfig.diceEmojies;
  const promises = emojis.map((emoji) => callApi('fetchDiceStickers', { emoji }));
  const results = await Promise.all(promises);

  global = getGlobal();
  results.forEach((result, index) => {
    if (!result) {
      return;
    }
    const emoji = emojis[index];
    const { set, stickers, packs } = result;
    global = updateStickerSet(global, set.id, { ...set, stickers, packs });
    global = {
      ...global,
      stickers: {
        ...global.stickers,
        diceSetIdByEmoji: {
          ...global.stickers.diceSetIdByEmoji,
          [emoji]: set.id,
        },
      },
    };
  });

  setGlobal(global);
});

addActionHandler('loadPremiumGifts', async (global): Promise<void> => {
  const stickerSet = await callApi('fetchPremiumGifts');
  if (!stickerSet) {
    return;
  }

  const { set, stickers } = stickerSet;

  global = getGlobal();
  global = {
    ...global,
    premiumGifts: { ...set, stickers },
  };
  setGlobal(global);
});

addActionHandler('loadTonGifts', async (global): Promise<void> => {
  const stickerSet = await callApi('fetchTonGifts');
  if (!stickerSet) {
    return;
  }

  const { set, stickers } = stickerSet;

  global = getGlobal();
  global = {
    ...global,
    tonGifts: { ...set, stickers },
  };
  setGlobal(global);
});

addActionHandler('loadDefaultTopicIcons', async (global): Promise<void> => {
  const stickerSet = await callApi('fetchDefaultTopicIcons');
  if (!stickerSet) {
    return;
  }
  global = getGlobal();

  const { set, stickers } = stickerSet;

  const fullSet = { ...set, stickers };

  global = updateStickerSet(global, fullSet.id, fullSet);
  global = {
    ...global,
    defaultTopicIconsId: fullSet.id,
  };
  setGlobal(global);
});

addActionHandler('loadDefaultStatusIcons', async (global): Promise<void> => {
  const stickerSet = await callApi('fetchDefaultStatusEmojis');
  if (!stickerSet) {
    return;
  }
  global = getGlobal();

  const { set, stickers } = stickerSet;
  const fullSet = { ...set, stickers };

  global = updateStickerSet(global, fullSet.id, fullSet);
  global = { ...global, defaultStatusIconsId: fullSet.id };
  setGlobal(global);
});

addActionHandler('loadUserCollectibleStatuses', async (global, actions): Promise<void> => {
  setGlobal(global);

  const { hash } = global.collectibleEmojiStatuses || {};

  const result = await callApi('fetchCollectibleEmojiStatuses', { hash });
  if (!result) {
    return;
  }

  global = getGlobal();

  global = {
    ...global,
    collectibleEmojiStatuses: {
      hash: result.hash,
      statuses: result.statuses,
    },
  };
  setGlobal(global);
  const documentIds = result.statuses.map(({ documentId }) => documentId);

  actions.loadCustomEmojis({ ids: documentIds });
});

addActionHandler('loadStickers', (global, actions, payload): ActionReturnType => {
  const { stickerSetInfo } = payload;
  const cachedSet = selectStickerSet(global, stickerSetInfo);
  if (cachedSet && cachedSet.count === cachedSet?.stickers?.length) return; // Already fully loaded
  void loadStickers(global, actions, stickerSetInfo);
});

addActionHandler('loadAnimatedEmojis', async (global): Promise<void> => {
  try {
    const [emojis, effects] = await Promise.all([
      callApi('fetchAnimatedEmojis'),
      callApi('fetchAnimatedEmojiEffects'),
    ]);
    if (!emojis || !effects) {
      return;
    }

    global = getGlobal();

    global = replaceAnimatedEmojis(global, { ...emojis.set, stickers: emojis.stickers });
    global = {
      ...global,
      animatedEmojiEffects: { ...effects.set, stickers: effects.stickers },
    };

    setGlobal(global);
  } catch (error) {
    if (DEBUG) {
      console.error('Failed to load animated emojis:', error);
    }
  }
});

addActionHandler('loadBirthdayNumbersStickers', async (global): Promise<void> => {
  const emojis = await callApi('fetchStickers', {
    stickerSetInfo: {
      shortName: BIRTHDAY_NUMBERS_SET,
    },
  });
  if (!emojis) {
    return;
  }

  global = getGlobal();

  global = {
    ...global,
    birthdayNumbers: { ...emojis.set, stickers: emojis.stickers },
  };

  setGlobal(global);
});

addActionHandler('loadRestrictedEmojiStickers', async (global): Promise<void> => {
  const emojis = await callApi('fetchStickers', {
    stickerSetInfo: {
      shortName: RESTRICTED_EMOJI_SET,
    },
  });
  if (!emojis) {
    return;
  }

  global = getGlobal();

  global = {
    ...global,
    restrictedEmoji: { ...emojis.set, stickers: emojis.stickers },
  };

  setGlobal(global);
});

addActionHandler('loadGenericEmojiEffects', async (global): Promise<void> => {
  const stickerSet = await callApi('fetchGenericEmojiEffects');
  if (!stickerSet) {
    return;
  }
  global = getGlobal();

  const { set, stickers } = stickerSet;

  global = {
    ...global,
    genericEmojiEffects: { ...set, stickers },
  };
  setGlobal(global);
});

addActionHandler('loadSavedGifs', async (global): Promise<void> => {
  try {
    const { hash } = global.gifs.saved;

    const savedGifs = await callApi('fetchSavedGifs', { hash });
    const localGifs = await getLocalSavedGifs();

    global = getGlobal();
    const currentGifs = global.gifs.saved?.gifs || [];
    const apiGifs = savedGifs?.gifs || currentGifs;
    const mergedGifs = [...apiGifs];
    const apiGifsIds = new Set(apiGifs.map(g => g.id));

    localGifs.forEach(g => {
      if (!apiGifsIds.has(g.id)) {
        mergedGifs.push(g);
      }
    });

    global = {
      ...global,
      gifs: {
        ...global.gifs,
        saved: {
          hash: savedGifs?.hash || global.gifs.saved?.hash || '',
          gifs: mergedGifs,
        },
      },
    };
    setGlobal(global);
  } catch (error) {
    if (DEBUG) {
      console.error('Failed to load saved gifs:', error);
    }
    try {
      const localGifs = await getLocalSavedGifs();
      global = getGlobal();
      const currentGifs = global.gifs.saved?.gifs || [];
      const mergedGifs = [...currentGifs];
      const currentIds = new Set(currentGifs.map(g => g.id));
      localGifs.forEach(g => {
        if (!currentIds.has(g.id)) {
          mergedGifs.push(g);
        }
      });
      global = {
        ...global,
        gifs: {
          ...global.gifs,
          saved: {
            ...global.gifs.saved,
            gifs: mergedGifs,
          },
        },
      };
      setGlobal(global);
    } catch (e) {
      console.warn('Failed to recover local saved gifs fallback:', e);
    }
  }
});

addActionHandler('saveGif', async (global, actions, payload): Promise<void> => {
  const {
    gif, shouldUnsave,
  } = payload;
  if (!gif) return;

  global = getGlobal();
  const currentGifs = global.gifs.saved.gifs || [];
  const gifs = currentGifs.filter(({ id }) => id !== gif.id);
  const newGifs = shouldUnsave ? gifs : [gif, ...gifs];

  global = {
    ...global,
    gifs: {
      ...global.gifs,
      saved: {
        ...global.gifs.saved,
        gifs: newGifs,
      },
    },
  };
  setGlobal(global);

  // Update local IndexedDB
  const localGifs = await getLocalSavedGifs();
  let updatedLocal: ApiVideo[];
  if (shouldUnsave) {
    updatedLocal = localGifs.filter(g => g.id !== gif.id);
  } else {
    updatedLocal = [gif, ...localGifs.filter(g => g.id !== gif.id)];
  }
  await saveLocalSavedGifs(updatedLocal);

  try {
    await callApi('saveGif', { gif, shouldUnsave });
  } catch (e) {
    // Ignore server limits
  }
});

addActionHandler('faveSticker', async (global, actions, payload): Promise<void> => {
  const { sticker } = payload;
  if (!sticker) return;

  global = getGlobal();
  const currentStickers = global.stickers.favorite.stickers || [];
  
  if (currentStickers.some(s => s.id === sticker.id)) {
    return;
  }

  const newStickers = [sticker, ...currentStickers];
  global = {
    ...global,
    stickers: {
      ...global.stickers,
      favorite: {
        ...global.stickers.favorite,
        stickers: newStickers,
      },
    },
  };
  setGlobal(global);

  const localFavs = await getLocalFavoriteStickers();
  if (!localFavs.some(s => s.id === sticker.id)) {
    await saveLocalFavoriteStickers([sticker, ...localFavs]);
  }

  try {
    await callApi('faveSticker', { sticker });
  } catch (e) {
    // Ignore server limits
  }
});

addActionHandler('unfaveSticker', async (global, actions, payload): Promise<void> => {
  const { sticker } = payload;
  if (!sticker) return;

  global = getGlobal();
  global = {
    ...global,
    stickers: {
      ...global.stickers,
      favorite: {
        ...global.stickers.favorite,
        stickers: global.stickers.favorite.stickers.filter(({ id }) => id !== sticker.id),
      },
    },
  };
  setGlobal(global);

  const localFavs = await getLocalFavoriteStickers();
  const updatedLocal = localFavs.filter(s => s.id !== sticker.id);
  await saveLocalFavoriteStickers(updatedLocal);

  try {
    await callApi('faveSticker', { sticker, unfave: true });
  } catch (e) {
    // Ignore server limits
  }
});

addActionHandler('removeRecentSticker', async (global, actions, payload): Promise<void> => {
  const { sticker } = payload;

  const result = await callApi('removeRecentSticker', { sticker });

  if (!result) return;

  global = getGlobal();
  loadRecentStickers(global);
});

addActionHandler('clearRecentStickers', async (global): Promise<void> => {
  const result = await callApi('clearRecentStickers');

  if (!result) return;

  global = getGlobal();
  global = {
    ...global,
    stickers: {
      ...global.stickers,
      recent: {
        stickers: [],
      },
    },
  };
  setGlobal(global);
});

addActionHandler('toggleStickerSet', (global, actions, payload): ActionReturnType => {
  const { stickerSetId } = payload;
  const stickerSet = selectStickerSet(global, stickerSetId);
  if (!stickerSet) {
    return;
  }

  const { accessHash, installedDate, isArchived } = stickerSet;
  const isInstalled = !isArchived && Boolean(installedDate);

  void callApi(!isInstalled ? 'installStickerSet' : 'uninstallStickerSet', { stickerSetId, accessHash });
});

addActionHandler('loadEmojiKeywords', async (global, actions, payload): Promise<void> => {
  const { language } = payload;

  let currentEmojiKeywords = global.emojiKeywords[language];
  if (currentEmojiKeywords?.isLoading) {
    return;
  }

  global = {
    ...global,
    emojiKeywords: {
      ...global.emojiKeywords,
      [language]: {
        ...currentEmojiKeywords,
        isLoading: true,
      },
    },
  };
  setGlobal(global);

  const emojiKeywords = await callApi('fetchEmojiKeywords', {
    language,
    fromVersion: currentEmojiKeywords ? currentEmojiKeywords.version : 0,
  });

  global = getGlobal();
  currentEmojiKeywords = global.emojiKeywords[language];

  if (!emojiKeywords) {
    global = {
      ...global,
      emojiKeywords: {
        ...global.emojiKeywords,
        [language]: {
          ...currentEmojiKeywords,
          isLoading: false,
        },
      },
    };
    setGlobal(global);

    return;
  }

  global = {
    ...global,
    emojiKeywords: {
      ...global.emojiKeywords,
      [language]: {
        isLoading: false,
        version: emojiKeywords.version,
        keywords: {
          ...(currentEmojiKeywords?.keywords),
          ...emojiKeywords.keywords,
        },
      },
    },
  };
  setGlobal(global);
});

async function loadRecentStickers<T extends GlobalState>(global: T, hash?: string) {
  try {
    const recentStickers = await callApi('fetchRecentStickers', { hash });
    if (!recentStickers) {
      return;
    }

    global = getGlobal();

    global = {
      ...global,
      stickers: {
        ...global.stickers,
        recent: recentStickers,
      },
    };
    setGlobal(global);
  } catch (error) {
    if (DEBUG) {
      console.error('Failed to load recent stickers:', error);
    }
  }
}

async function loadStickers<T extends GlobalState>(
  global: T,
  actions: RequiredGlobalActions,
  stickerSetInfo: ApiStickerSetInfo,
) {
  let stickerSet: { set: ApiStickerSet; stickers: ApiSticker[]; packs: Record<string, ApiSticker[]> } | undefined;
  try {
    stickerSet = await callApi(
      'fetchStickers',
      { stickerSetInfo },
    );
  } catch (error: unknown) {
    if ((error as ApiError).message === 'STICKERSET_INVALID') {
      Object.values(global.byTabId).forEach(({ id: tabId }) => {
        actions.showNotification({
          message: oldTranslate('StickerPack.ErrorNotFound'),
          tabId,
        });

        if ('shortName' in stickerSetInfo
          && selectTabState(global, tabId).openedStickerSetShortName === stickerSetInfo.shortName) {
          global = updateTabState(global, {
            openedStickerSetShortName: undefined,
          }, tabId);
          setGlobal(global);
        }
      });
      return;
    }
  }
  global = getGlobal();

  if (!stickerSet) {
    // TODO handle this case when sticker cache is implemented
    return;
  }

  const { set, stickers, packs } = stickerSet;

  global = updateStickerSet(global, set.id, { ...set, stickers, packs });

  const currentEmoji = global.stickers.forEmoji.emoji;
  if (currentEmoji && packs[currentEmoji]) {
    global = rebuildStickersForEmoji(global);
  }

  setGlobal(global);
}

addActionHandler('setStickerSearchQuery', (global, actions, payload): ActionReturnType => {
  const { query, tabId = getCurrentTabId() } = payload;

  if (query) {
    void searchThrottled(async () => {
      const result = await callApi('searchStickers', { query });
      if (!result) {
        return;
      }

      global = getGlobal();
      const { setsById, added } = global.stickers;

      const resultIds = result.sets.map(({ id }) => id);

      if (added.setIds) {
        added.setIds.forEach((id) => {
          if (!resultIds.includes(id)) {
            const { title } = setsById[id] || {};
            if (title && searchWords(title, query)) {
              resultIds.unshift(id);
            }
          }
        });
      }

      global = updateStickerSets(
        global,
        'search',
        result.hash,
        result.sets,
      );

      global = updateStickerSearch(global, result.hash, resultIds, tabId);
      setGlobal(global);
    });
  }
});

addActionHandler('setGifSearchQuery', (global, actions, payload): ActionReturnType => {
  const { query, tabId = getCurrentTabId() } = payload;

  if (typeof query === 'string') {
    void searchThrottled(() => {
      global = getGlobal();
      searchGifs(global, query, global.config?.gifSearchUsername, undefined, tabId);
    });
  }
});

addActionHandler('searchMoreGifs', (global, actions, payload): ActionReturnType => {
  const { tabId = getCurrentTabId() } = payload || {};
  const { query, offset } = selectTabState(global, tabId).gifSearch;

  if (typeof query === 'string') {
    void searchThrottled(() => {
      global = getGlobal();
      searchGifs(global, query, global.config?.gifSearchUsername, offset, tabId);
    });
  }
});

addActionHandler('loadStickersForEmoji', (global, actions, payload): ActionReturnType => {
  const { emoji } = payload;
  const { hash } = global.stickers.forEmoji;

  void searchThrottled(async () => {
    global = getGlobal();
    global = {
      ...global,
      stickers: {
        ...global.stickers,
        forEmoji: {
          ...global.stickers.forEmoji,
          emoji,
        },
      },
    };
    setGlobal(global);

    const result = await callApi('fetchStickersForEmoji', { emoji, hash });

    global = getGlobal();

    if (!result || global.stickers.forEmoji.emoji !== emoji) {
      return;
    }

    global = updateStickersForEmoji(global, emoji, result.stickers, result.hash);

    setGlobal(global);
  });
});

addActionHandler('clearStickersForEmoji', (global): ActionReturnType => {
  return {
    ...global,
    stickers: {
      ...global.stickers,
      forEmoji: {},
    },
  };
});

addActionHandler('loadCustomEmojiForEmoji', (global, actions, payload): ActionReturnType => {
  const { emoji } = payload;

  return updateCustomEmojiForEmoji(global, emoji);
});

addActionHandler('clearCustomEmojiForEmoji', (global): ActionReturnType => {
  return {
    ...global,
    customEmojis: {
      ...global.customEmojis,
      forEmoji: {},
    },
  };
});

addActionHandler('loadFeaturedEmojiStickers', async (global): Promise<void> => {
  const featuredStickers = await callApi('fetchFeaturedEmojiStickers', {});
  if (!featuredStickers) {
    return;
  }

  global = getGlobal();
  global = {
    ...global,
    customEmojis: {
      ...global.customEmojis,
      featuredIds: featuredStickers.sets.map(({ id }) => id),
      byId: {
        ...global.customEmojis.byId,
        ...buildCollectionByKey(featuredStickers.sets.flatMap((set) => set.stickers || []), 'id'),
      },
    },
    stickers: {
      ...global.stickers,
      setsById: {
        ...global.stickers.setsById,
        ...buildCollectionByKey(featuredStickers.sets, 'id'),
      },
    },
  };
  setGlobal(global);
});

addActionHandler('openStickerSet', async (global, actions, payload): Promise<void> => {
  const { stickerSetInfo, shouldIgnoreCache, tabId = getCurrentTabId() } = payload;
  if (shouldIgnoreCache || !selectStickerSet(global, stickerSetInfo)) {
    await loadStickers(global, actions, stickerSetInfo);
  }

  global = getGlobal();
  const set = selectStickerSet(global, stickerSetInfo);
  if (!set?.shortName) {
    return;
  }

  global = updateTabState(global, {
    openedStickerSetShortName: set.shortName,
  }, tabId);
  setGlobal(global);
});

addActionHandler('loadRecentEmojiStatuses', async (global): Promise<void> => {
  const result = await callApi('fetchRecentEmojiStatuses');
  if (!result) {
    return;
  }

  global = getGlobal();
  global = updateRecentStatusCustomEmojis(global, result.hash, result.emojiStatuses!);
  setGlobal(global);
});

async function searchGifs<T extends GlobalState>(global: T, query: string, botUsername?: string, offset?: string,
  ...[tabId = getCurrentTabId()]: TabArgs<T>) {
  const result = await callApi('searchGifs', { query, offset, username: botUsername });
  if (!result) {
    return;
  }

  global = getGlobal();
  global = updateGifSearch(global, !offset, result.gifs, result.nextOffset, tabId);
  setGlobal(global);
}
