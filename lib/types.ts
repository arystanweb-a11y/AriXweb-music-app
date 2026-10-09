export type Track = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: number;
  audioUrl: string;
  downloadUrl: string;
  isDownloaded: boolean;
  uploadedBy?: string;
};

export type TelegramUser = {
  id: number;
  username?: string;
  first_name?: string;
};
