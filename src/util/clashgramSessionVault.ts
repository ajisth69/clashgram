const unlockedChatIds = new Set<string>();
const unlockedFolderIds = new Set<string>();

export function getUnlockedChatIds(): Set<string> {
  return unlockedChatIds;
}

export function getUnlockedFolderIds(): Set<string> {
  return unlockedFolderIds;
}
