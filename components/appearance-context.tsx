"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { defaultAppearance, fontCatalog, themePresets } from "@/lib/appearance";
import type { AppearanceSettings, CustomFont, FontId, Locale, ThemeId } from "@/lib/appearance";
import { deleteFontFile, readFontFile, saveFontFile } from "@/lib/font-storage";
import { translate } from "@/lib/translations";
import type { MessageKey } from "@/lib/translations";

type AppearanceContextValue = {
  settings: AppearanceSettings;
  customFonts: CustomFont[];
  t: (key: MessageKey) => string;
  setLocale: (locale: Locale) => void;
  setTheme: (themeId: ThemeId) => void;
  setColor: (key: "backgroundColor" | "surfaceColor" | "textColor" | "accentColor", value: string) => void;
  setFont: (fontId: FontId | "custom", customFontId?: string) => void;
  addCustomFont: (file: File) => Promise<void>;
  removeCustomFont: (id: string) => Promise<void>;
};

const SETTINGS_KEY = "arixweb.appearance.v1";
const FONTS_KEY = "arixweb.custom-fonts.v1";
const AppearanceContext = createContext<AppearanceContextValue | null>(null);

function applyFont(family: string) {
  document.documentElement.style.setProperty("--interface-font", `"${family}", sans-serif`);
}

function contrastFor(hex: string): string {
  const value = hex.replace("#", "");
  if (!/^[\da-f]{6}$/i.test(value)) return "#07130f";
  const channels = [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16) / 255);
  const luminance = channels.map((channel) => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4)
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  return luminance > .52 ? "#101318" : "#ffffff";
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppearanceSettings>(defaultAppearance);
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) setSettings({ ...defaultAppearance, ...(JSON.parse(saved) as Partial<AppearanceSettings>) });
      const savedFonts = localStorage.getItem(FONTS_KEY);
      if (savedFonts) setCustomFonts(JSON.parse(savedFonts) as CustomFont[]);
    } catch { /* Fall back to defaults when saved settings are unavailable. */ }
    finally { setStorageReady(true); }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      localStorage.setItem(FONTS_KEY, JSON.stringify(customFonts));
    } catch { /* The current appearance still works for this session. */ }
  }, [settings, customFonts, storageReady]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = settings.locale;
    const theme = themePresets.find((preset) => preset.id === settings.themeId) ?? themePresets[0];
    root.style.colorScheme = theme.colorScheme;
    root.style.setProperty("--page", settings.backgroundColor || theme.page);
    root.style.setProperty("--surface", settings.surfaceColor || theme.surface);
    root.style.setProperty("--text", settings.textColor || theme.text);
    root.style.setProperty("--muted", theme.muted);
    root.style.setProperty("--line", theme.line);
    const accent = settings.accentColor || theme.accent;
    root.style.setProperty("--accent", accent);
    root.style.setProperty("--accent-contrast", settings.accentColor ? contrastFor(accent) : theme.accentContrast);
    root.style.setProperty("--success", theme.success);
    root.style.setProperty("--background-image", settings.backgroundColor ? `linear-gradient(${settings.backgroundColor}, ${settings.backgroundColor})` : theme.background);
    root.style.setProperty("--aurora-image", settings.backgroundColor ? "none" : theme.aurora);

    let objectUrl: string | null = null;
    let cancelled = false;
    const customFont = customFonts.find((font) => font.id === settings.customFontId);
    if (settings.fontId === "custom" && customFont) {
      void readFontFile(customFont.id).then(async (file) => {
        if (!file || cancelled) return;
        objectUrl = URL.createObjectURL(file);
        const face = new FontFace(customFont.name, `url(${objectUrl})`);
        await face.load();
        if (cancelled) return;
        document.fonts.add(face);
        applyFont(customFont.name);
      }).catch(() => applyFont(fontCatalog[0].family));
    } else {
      const font = fontCatalog.find((item) => item.id === settings.fontId) ?? fontCatalog[0];
      applyFont(font.family);
    }
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [settings, customFonts]);

  const setLocale = useCallback((locale: Locale) => setSettings((current) => ({ ...current, locale })), []);
  const setTheme = useCallback((themeId: ThemeId) => setSettings((current) => ({ ...current, themeId, backgroundColor: "", surfaceColor: "", textColor: "", accentColor: "" })), []);
  const setColor = useCallback((key: "backgroundColor" | "surfaceColor" | "textColor" | "accentColor", value: string) => setSettings((current) => ({ ...current, [key]: value })), []);
  const setFont = useCallback((fontId: FontId | "custom", customFontId?: string) => setSettings((current) => ({ ...current, fontId, customFontId: fontId === "custom" ? customFontId ?? current.customFontId : null })), []);

  const addCustomFont = useCallback(async (file: File) => {
    if (file.size > 15 * 1024 * 1024) throw new Error("FONT_TOO_LARGE");
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["ttf", "otf", "woff", "woff2"].includes(ext)) throw new Error("FONT_FORMAT");
    const id = crypto.randomUUID();
    const name = `UserFont-${id.slice(0, 8)}`;
    await saveFontFile(id, file);
    const blobUrl = URL.createObjectURL(file);
    try {
      const face = new FontFace(name, `url(${blobUrl})`);
      await face.load();
      document.fonts.add(face);
    } finally { URL.revokeObjectURL(blobUrl); }
    setCustomFonts((current) => [...current, { id, name }]);
    setSettings((current) => ({ ...current, fontId: "custom", customFontId: id }));
  }, []);

  const removeCustomFont = useCallback(async (id: string) => {
    await deleteFontFile(id);
    setCustomFonts((current) => current.filter((font) => font.id !== id));
    setSettings((current) => current.customFontId === id ? { ...current, fontId: fontCatalog[0].id, customFontId: null } : current);
  }, []);

  const value = useMemo<AppearanceContextValue>(() => ({
    settings, customFonts, t: (key) => translate(settings.locale, key), setLocale, setTheme, setColor, setFont, addCustomFont, removeCustomFont,
  }), [settings, customFonts, setLocale, setTheme, setColor, setFont, addCustomFont, removeCustomFont]);

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const context = useContext(AppearanceContext);
  if (!context) throw new Error("useAppearance must be used within AppearanceProvider");
  return context;
}
