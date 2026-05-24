export const secureBrowserStorage = async (): Promise<boolean> => {
  if (navigator.storage && navigator.storage.persist) {
    const alreadyPersistent = await navigator.storage.persisted();
    if (alreadyPersistent) return true;
    return await navigator.storage.persist();
  }
  return false;
};
