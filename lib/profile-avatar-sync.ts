interface SynchronizeProfileAvatarOptions {
  avatar: string;
  updateLocalAvatar: (avatar: string) => void;
  refreshProfile: () => Promise<void>;
  closeDialog: () => void;
}

export async function synchronizeProfileAvatar({
  avatar,
  updateLocalAvatar,
  refreshProfile,
  closeDialog,
}: SynchronizeProfileAvatarOptions): Promise<void> {
  updateLocalAvatar(avatar);
  await refreshProfile();
  closeDialog();
}