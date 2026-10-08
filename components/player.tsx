"use client";

import { useMusic } from "@/components/music-context";
import Image from "next/image";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}

export function Player() {
  const { currentTrack, isPlaying, progress, duration, togglePlayback, nextTrack, seek } = useMusic();
  return (
    <section className={currentTrack ? "player" : "player player-empty"} aria-label="Аудиоплеер">
      {currentTrack ? (
        <>
          <Image className="player-cover" src={currentTrack.cover} alt="" width={40} height={40} unoptimized />
          <div className="player-info"><span className="player-title">{currentTrack.title}</span><span className="player-artist">{currentTrack.artist}</span></div>
          <span className="time current-time">{formatTime(progress)}</span>
          <input className="progress" type="range" min="0" max={duration || currentTrack.duration || 1} step="1" value={Math.min(progress, duration || currentTrack.duration || 1)} onChange={(event) => seek(Number(event.target.value))} aria-label="Позиция воспроизведения" style={{ "--progress": `${duration ? (progress / duration) * 100 : 0}%` } as React.CSSProperties} />
          <span className="time total-time">{formatTime(duration || currentTrack.duration)}</span>
          <div className="player-controls">
            <button className="player-control" onClick={togglePlayback} aria-label={isPlaying ? "Пауза" : "Воспроизвести"}>
              {isPlaying ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7z"/></svg>}
            </button>
            <button className="player-next" onClick={nextTrack} aria-label="Следующая песня"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 11 7-11 7zM19 5v14"/></svg></button>
          </div>
        </>
      ) : <><span className="player-note">♫</span><span className="player-hint">Выбери песню, чтобы начать</span></>}
    </section>
  );
}
