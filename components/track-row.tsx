"use client";

import type { Track } from "@/lib/types";
import { useMusic } from "@/components/music-context";
import Image from "next/image";

export function TrackRow({ track, inLibrary = false }: { track: Track; inLibrary?: boolean }) {
  const { currentTrack, isPlaying, playTrack, togglePlayback, download, downloadingId } = useMusic();
  const isCurrent = currentTrack?.id === track.id;
  const isDownloading = downloadingId === track.id;
  return (
    <article className={isCurrent ? "track-row current" : "track-row"}>
      <button className="cover-button" onClick={() => inLibrary ? isCurrent ? togglePlayback() : playTrack(track) : playTrack(track)} aria-label={isCurrent && isPlaying ? `Пауза: ${track.title}` : `Слушать: ${track.title}`}>
        <Image className="cover" src={track.cover} alt="" width={48} height={48} unoptimized />
        <span className="cover-play">{isCurrent && isPlaying ? "Ⅱ" : "▶"}</span>
      </button>
      <button className="track-meta" onClick={() => inLibrary ? isCurrent ? togglePlayback() : playTrack(track) : playTrack(track)}>
        <span className="track-title">{track.title}</span><span className="track-artist">{track.artist}</span>
      </button>
      {inLibrary ? (
        <button className="play-button" onClick={() => isCurrent ? togglePlayback() : playTrack(track)} aria-label={isCurrent && isPlaying ? "Пауза" : "Воспроизвести"}>
          {isCurrent && isPlaying ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7z"/></svg>}
        </button>
      ) : track.isDownloaded ? <span className="downloaded-label"><span>✓</span> Скачано</span> : (
        <button className="download-button" onClick={() => void download(track)} disabled={isDownloading}>
          {isDownloading ? <span className="spinner dark" /> : <><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M5 17v3h14v-3"/></svg><span>Скачать</span></>}
        </button>
      )}
    </article>
  );
}
