"use client";

import { useEffect, useState } from "react";
import { getTelegramTheme, initTelegram } from "@/lib/telegram";
import { useMusic } from "@/components/music-context";
import { TrackRow } from "@/components/track-row";
import { Player } from "@/components/player";

type Tab = "search" | "library";

export default function Home() {
  const [tab, setTab] = useState<Tab>("search");
  const [query, setQuery] = useState("");
  const [userName, setUserName] = useState("");
  const { searchResults, search, isSearching, downloadedTracks } = useMusic();

  useEffect(() => {
    void initTelegram().then((user) => {
      if (user?.first_name) setUserName(user.first_name);
    });
    void getTelegramTheme().then((theme) => {
      if (!theme) return;
      const root = document.documentElement;
      if (theme.textColor) root.style.setProperty("--text", theme.textColor);
    });
  }, []);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void search(query);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true"><span /></div>
        <span className="brand-name">музыка</span>
        {userName && <span className="user-greeting">{userName}</span>}
      </header>

      <section className="content" aria-live="polite">
        {tab === "search" ? (
          <>
            <div className="heading-row"><div><p className="eyebrow">СЛУШАЙ СВОЁ</p><h1>Музыка</h1></div></div>
            <form className="search-form" onSubmit={handleSearch}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg>
              <input aria-label="Название песни или исполнитель" placeholder="Песня или исполнитель" value={query} onChange={(event) => setQuery(event.target.value)} />
              <button type="submit" disabled={isSearching} aria-label="Искать">
                {isSearching ? <span className="spinner" /> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>}
              </button>
            </form>
            <div className="section-label"><span>РЕЗУЛЬТАТЫ</span><span>{searchResults.length ? `${searchResults.length} трека` : ""}</span></div>
            {searchResults.length ? <div className="track-list">{searchResults.map((track) => <TrackRow key={track.id} track={track} />)}</div> : (
              <div className="empty-state"><div className="empty-icon">♫</div><p>{query.trim() ? "Ничего не найдено" : "Найди свою следующую любимую песню"}</p><span>{query.trim() ? "Попробуй другое название или исполнителя" : "Введи название или исполнителя"}</span></div>
            )}
          </>
        ) : (
          <>
            <div className="heading-row"><div><p className="eyebrow">ТВОЯ КОЛЛЕКЦИЯ</p><h1>Мои песни</h1></div><span className="library-count">{downloadedTracks.length.toString().padStart(2, "0")}</span></div>
            {downloadedTracks.length ? <div className="track-list library-list">{downloadedTracks.map((track) => <TrackRow key={track.id} track={track} inLibrary />)}</div> : (
              <div className="empty-state"><div className="empty-icon">♫</div><p>Здесь пока пусто</p><span>Скачанные песни появятся здесь</span><button className="text-link" onClick={() => setTab("search")}>Найти музыку <span>↗</span></button></div>
            )}
          </>
        )}
      </section>

      <Player />
      <nav className="bottom-nav" aria-label="Основная навигация">
        <button className={tab === "search" ? "nav-item active" : "nav-item"} onClick={() => setTab("search")} aria-current={tab === "search" ? "page" : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 4 4"/></svg><span>Поиск</span>
        </button>
        <button className={tab === "library" ? "nav-item active" : "nav-item"} onClick={() => setTab("library")} aria-current={tab === "library" ? "page" : undefined}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5V5.8a1.8 1.8 0 0 1 2.7-1.56L19 11.1a1.8 1.8 0 0 1 0 3.12L6.7 21.06A1.8 1.8 0 0 1 4 19.5Z"/></svg><span>Мои песни</span>
        </button>
      </nav>
    </main>
  );
}
