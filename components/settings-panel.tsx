"use client";

import { useRef, useState } from "react";
import { fontCatalog, themePresets } from "@/lib/appearance";
import { useAppearance } from "@/components/appearance-context";

const colorControls = [
  { key: "backgroundColor", label: "background" },
  { key: "surfaceColor", label: "surface" },
  { key: "textColor", label: "textColor" },
  { key: "accentColor", label: "accent" },
] as const;

export function SettingsPanel() {
  const { settings, customFonts, t, setLocale, setTheme, setColor, setFont, addCustomFont, removeCustomFont } = useAppearance();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fontError, setFontError] = useState(false);

  async function handleFontUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    setFontError(false);
    try { await addCustomFont(file); }
    catch { setFontError(true); }
  }

  return (
    <div className="settings-view">
      <div className="heading-row settings-heading"><div><p className="eyebrow">ARIXWEB</p><h1>{t("settingsTitle")}</h1></div></div>
      <p className="settings-intro">{t("settingsIntro")}</p>

      <section className="settings-section" aria-labelledby="theme-heading">
        <h2 id="theme-heading" className="section-label settings-label">{t("appearance")}</h2>
        <div className="theme-grid">
          {themePresets.map((theme) => (
            <button key={theme.id} className={`theme-option ${settings.themeId === theme.id ? "selected" : ""}`} onClick={() => setTheme(theme.id)} aria-pressed={settings.themeId === theme.id}>
              <span className="theme-swatch" style={{ background: theme.background, "--swatch-accent": theme.accent } as React.CSSProperties}><i /></span>
              <span className="theme-name">{settings.locale === "ru" ? theme.label : theme.labelEn}</span>
              {settings.themeId === theme.id && <span className="theme-check" aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
        <div className="settings-subsection">
          <h3 className="settings-subtitle">{t("colors")}</h3>
          <div className="color-grid">
            {colorControls.map(({ key, label }) => {
              const baseTheme = themePresets.find((theme) => theme.id === settings.themeId) ?? themePresets[0];
              const fallback = key === "backgroundColor" ? baseTheme.page : key === "surfaceColor" ? baseTheme.colorScheme === "light" ? "#ffffff" : "#172033" : key === "textColor" ? baseTheme.text : baseTheme.accent;
              return <label className="color-control" key={key}><span>{t(label as "background" | "surface" | "textColor" | "accent")}</span><input type="color" value={settings[key] || fallback} onChange={(event) => setColor(key, event.target.value)} aria-label={t(label as "background" | "surface" | "textColor" | "accent")} /></label>;
            })}
          </div>
        </div>
      </section>

      <section className="settings-section" aria-labelledby="font-heading">
        <h2 id="font-heading" className="section-label settings-label">{t("fonts")}</h2>
        <div className="font-grid">
          {fontCatalog.map((font) => (
            <button key={font.id} className={`font-option ${settings.fontId === font.id ? "selected" : ""}`} onClick={() => setFont(font.id)} aria-pressed={settings.fontId === font.id} style={{ fontFamily: `"${font.family}", sans-serif` }}>{font.label}</button>
          ))}
          {customFonts.map((font) => (
            <div key={font.id} className="font-custom-wrap">
              <button className={`font-option ${settings.customFontId === font.id ? "selected" : ""}`} onClick={() => setFont("custom", font.id)} aria-pressed={settings.customFontId === font.id}>{font.name}</button>
              <button className="font-remove" onClick={() => void removeCustomFont(font.id)} aria-label={`${t("fontRemove")} ${font.name}`}>×</button>
            </div>
          ))}
        </div>
        <input ref={fileRef} className="visually-hidden" type="file" accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2" onChange={handleFontUpload} />
        <button className="upload-font-button" onClick={() => fileRef.current?.click()}><span aria-hidden="true">＋</span>{t("uploadFont")}</button>
        <p className="settings-help">{t("fontHint")}</p>
        {fontError && <p className="settings-error" role="alert">{t("fontError")}</p>}
      </section>

      <section className="settings-section language-section" aria-labelledby="language-heading">
        <h2 id="language-heading" className="section-label settings-label">{t("language")}</h2>
        <div className="language-switch" role="group" aria-label={t("language")}>
          <button className={settings.locale === "ru" ? "selected" : ""} onClick={() => setLocale("ru")} aria-pressed={settings.locale === "ru"}>{t("russian")}</button>
          <button className={settings.locale === "en" ? "selected" : ""} onClick={() => setLocale("en")} aria-pressed={settings.locale === "en"}>{t("english")}</button>
        </div>
      </section>
    </div>
  );
}
