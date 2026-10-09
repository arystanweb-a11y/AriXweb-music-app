"use client";

import { useEffect, useRef, useState } from "react";
import { initTelegram } from "@/lib/telegram";
import { useMusic } from "@/components/music-context";
import { TrackRow } from "@/components/track-row";
import { Player } from "@/components/player";
import { SettingsPanel } from "@/components/settings-panel";
import { useAppearance } from "@/components/appearance-context";

type Tab = "search" | "library" | "settings";

export default function Home() {
  const [tab, setTab] = useState<Tab>("search");
  const [query, setQuery] = useState("");
  const [userName, setUserName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { searchResults, search, isSearching, downloadedTracks, uploadTrack, uploadingTrack } = useMusic();
  const { t } = useAppearance();

  useEffect(() => {
    void search("");
    // Load the shared catalog once when the Mini App opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void initTelegram().then((user) => {
      if (user?.first_name) setUserName(user.first_name);
    });
  }, []);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void search(query);
  }

  async function handleMusicUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    setUploadError("");
    const hasAudioExtension = /\.(mp3|m4a|mp4|aac|ogg|oga|opus|wav|flac|webm)$/i.test(file.name);
    if (file.size > 50 * 1024 * 1024 || (!file.type.startsWith("audio/") && !hasAudioExtension)) {
      setUploadError(t("uploadFormat"));
      return;
    }
    try { await uploadTrack(file); }
    catch (error) {
      const code = error instanceof Error ? error.message : "";
      setUploadError(code === "TELEGRAM_REQUIRED" || code === "TELEGRAM_AUTH_REQUIRED" ? t("uploadNeedsTelegram") : code.includes("SUPABASE") || code.includes("STORAGE_NOT_CONFIGURED") || code === "TELEGRAM_NOT_CONFIGURED" ? t("uploadBackendMissing") : t("uploadError"));
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <h1 className="brand-title">AriXweb</h1>
        {userName && <span className="user-greeting">{userName}</span>}
      </header>

      <section className="content" aria-live="polite">
        {tab === "search" ? (
          <>
            <div className="heading-row"><div><p className="eyebrow">{t("discover")}</p><h1>{t("music")}</h1></div></div>
            <form className="search-form" onSubmit={handleSearch}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg>
              <input aria-label={t("searchPlaceholder")} placeholder={t("searchPlaceholder")} value={query} onChange={(event) => setQuery(event.target.value)} />
              <button type="submit" disabled={isSearching} aria-label={t("find")}>
                {isSearching ? <span className="spinner" /> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>}
              </button>
            </form>
            <div className="section-label"><span>{t("results")}</span><div className="results-actions"><span>{searchResults.length ? searchResults.length : ""}</span><button className="add-track-button" onClick={() => fileRef.current?.click()} disabled={uploadingTrack}>{uploadingTrack ? t("uploadBusy") : <><span>＋</span>{t("addTrack")}</>}</button></div></div>
            <input ref={fileRef} className="visually-hidden" type="file" accept="audio/*,.mp3,.m4a,.mp4,.aac,.ogg,.oga,.opus,.wav,.flac,.webm" onChange={handleMusicUpload} />
            {uploadError && <p className="upload-error" role="alert">{uploadError}</p>}
            {searchResults.length ? <div className="track-list">{searchResults.map((track) => <TrackRow key={track.id} track={track} />)}</div> : (
              <div className="empty-state"><div className="empty-icon">♫</div><p>{query.trim() ? t("noResults") : t("emptySearch")}</p><span>{query.trim() ? t("noResultsHint") : t("emptySearchHint")}</span></div>
            )}
          </>
        ) : tab === "library" ? (
          <>
            <div className="heading-row"><div><p className="eyebrow">{t("myCollection")}</p><h1>{t("library")}</h1></div><span className="library-count">{downloadedTracks.length.toString().padStart(2, "0")}</span></div>
            {downloadedTracks.length ? <div className="track-list library-list">{downloadedTracks.map((track) => <TrackRow key={track.id} track={track} inLibrary />)}</div> : (
              <div className="empty-state"><div className="empty-icon">♫</div><p>{t("emptyLibrary")}</p><span>{t("emptyLibraryHint")}</span><button className="text-link" onClick={() => setTab("search")}>{t("findMusic")} <span>↗</span></button></div>
            )}
          </>
        ) : <SettingsPanel />}
      </section>

      <Player />
      <nav className="bottom-nav" aria-label={t("settingsTitle")}>
        <button className={tab === "search" ? "nav-item active" : "nav-item"} onClick={() => setTab("search")} aria-current={tab === "search" ? "page" : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg><span>{t("search")}</span>
        </button>
        <button className={tab === "library" ? "nav-item active" : "nav-item"} onClick={() => setTab("library")} aria-current={tab === "library" ? "page" : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5V5.8a1.8 1.8 0 0 1 2.7-1.56L19 11.1a1.8 1.8 0 0 1 0 3.12L6.7 21.06A1.8 1.8 0 0 1 4 19.5Z"/></svg><span>{t("library")}</span>
        </button>
        <button className={tab === "settings" ? "nav-item active" : "nav-item"} onClick={() => setTab("settings")} aria-current={tab === "settings" ? "page" : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 0 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z"/></svg><span>{t("settings")}</span>
        </button>
      </nav>
    </main>
  );
}
