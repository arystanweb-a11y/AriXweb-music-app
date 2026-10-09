import type { Locale } from "./appearance";

const messages = {
  ru: {
    search: "Поиск", library: "Мои песни", settings: "Настройки", music: "Музыка", myCollection: "ТВОЯ КОЛЛЕКЦИЯ", discover: "СЛУШАЙ СВОЁ",
    results: "РЕЗУЛЬТАТЫ", searchPlaceholder: "Песня или исполнитель", find: "Найти", emptySearch: "Найди свою следующую любимую песню", emptySearchHint: "Введи название или исполнителя", noResults: "Ничего не найдено", noResultsHint: "Попробуй другое название или исполнителя",
    emptyLibrary: "Здесь пока пусто", emptyLibraryHint: "Скачанные песни появятся здесь", findMusic: "Найти музыку", download: "Скачать", downloaded: "Скачано", play: "Воспроизвести", pause: "Пауза", listen: "Слушать", next: "Следующая песня", playerHint: "Выбери песню, чтобы начать", player: "Аудиоплеер", progress: "Позиция воспроизведения", addedBy: "добавил", addTrack: "Добавить свой трек", uploadBusy: "Загружаю…", uploadError: "Не удалось загрузить трек", uploadNeedsTelegram: "Для общего каталога открой приложение в Telegram.", uploadBackendMissing: "Настрой переменные Supabase и Telegram, затем выполни supabase/schema.sql.", uploadFormat: "Выбери аудиофайл до 50 МБ.",
    settingsTitle: "Настройки", settingsIntro: "Тема и шрифт сохраняются на этом устройстве.", appearance: "ТЕМА", fonts: "ШРИФТ", language: "ЯЗЫК", colors: "СВОИ ЦВЕТА", background: "Фон", surface: "Панели", textColor: "Текст", accent: "Акцент", solid: "Однотонная", uploadFont: "Загрузить шрифт", customFont: "Свой шрифт", fontHint: "TTF, OTF, WOFF или WOFF2", fontError: "Не удалось загрузить этот шрифт", fontRemove: "Убрать", russian: "Русский", english: "English", settingsSaved: "Сохранено на устройстве",
  },
  en: {
    search: "Search", library: "My songs", settings: "Settings", music: "Music", myCollection: "YOUR COLLECTION", discover: "LISTEN YOUR WAY",
    results: "RESULTS", searchPlaceholder: "Song or artist", find: "Search", emptySearch: "Find your next favorite song", emptySearchHint: "Enter a title or artist", noResults: "Nothing found", noResultsHint: "Try another title or artist",
    emptyLibrary: "Nothing here yet", emptyLibraryHint: "Downloaded songs will show up here", findMusic: "Find music", download: "Download", downloaded: "Downloaded", play: "Play", pause: "Pause", listen: "Listen", next: "Next song", playerHint: "Choose a song to start", player: "Audio player", progress: "Playback position", addedBy: "added by", addTrack: "Add a track", uploadBusy: "Uploading…", uploadError: "Could not upload the track", uploadNeedsTelegram: "Open the app in Telegram to use the shared catalog.", uploadBackendMissing: "Set the Supabase and Telegram environment variables, then run supabase/schema.sql.", uploadFormat: "Choose an audio file up to 50 MB.",
    settingsTitle: "Settings", settingsIntro: "Your theme and font stay on this device.", appearance: "THEME", fonts: "FONT", language: "LANGUAGE", colors: "CUSTOM COLORS", background: "Background", surface: "Panels", textColor: "Text", accent: "Accent", solid: "Solid color", uploadFont: "Upload a font", customFont: "Custom font", fontHint: "TTF, OTF, WOFF, or WOFF2", fontError: "Could not load this font", fontRemove: "Remove", russian: "Русский", english: "English", settingsSaved: "Saved on this device",
  },
} as const;

export type MessageKey = keyof (typeof messages)["ru"];

export function translate(locale: Locale, key: MessageKey): string {
  return messages[locale][key] ?? messages.ru[key];
}
