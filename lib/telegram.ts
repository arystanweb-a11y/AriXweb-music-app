import type { TelegramUser } from "./types";

/** Initializes Telegram when available and safely falls back to a regular browser. */
export async function initTelegram(): Promise<TelegramUser | null> {
  if (typeof window === "undefined") return null;
  try {
    const { default: telegram } = await import("@twa-dev/sdk");
    if (!telegram?.initData) return null;
    telegram.ready();
    telegram.expand();
    const user = telegram.initDataUnsafe?.user;
    return user
      ? { id: user.id, username: user.username, first_name: user.first_name }
      : null;
  } catch {
    return null;
  }
}

export async function getTelegramTheme(): Promise<{ bgColor?: string; textColor?: string; secondaryBgColor?: string } | null> {
  if (typeof window === "undefined") return null;
  try {
    const { default: webApp } = await import("@twa-dev/sdk");
    if (!webApp?.initData) return null;
    return {
      bgColor: webApp.themeParams.bg_color,
      textColor: webApp.themeParams.text_color,
      secondaryBgColor: webApp.themeParams.secondary_bg_color,
    };
  } catch {
    return null;
  }
}
