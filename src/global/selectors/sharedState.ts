import type { GlobalState } from '../types';
import { INITIAL_SHARED_STATE } from '../initialState';

export function selectSharedState<T extends GlobalState>(
  global: T,
) {
  return global.sharedState || INITIAL_SHARED_STATE;
}

export function selectSharedSettings<T extends GlobalState>(
  global: T,
) {
  return selectSharedState(global)?.settings || INITIAL_SHARED_STATE.settings;
}

export function selectAnimationLevel<T extends GlobalState>(
  global: T,
) {
  return selectSharedSettings(global)?.animationLevel ?? INITIAL_SHARED_STATE.settings.animationLevel;
}
