"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { downloadTrack, searchTracks } from "@/lib/music-api";
import type { Track } from "@/lib/types";

type MusicContextValue = {
  searchResults: Track[];
  downloadedTracks: Track[];
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  progress: number;
  duration: number;
  isSearching: boolean;
  downloadingId: string | null;
  search: (query: string) => Promise<void>;
  download: (track: Track) => Promise<void>;
  playTrack: (track: Track) => void;
  togglePlayback: () => void;
  nextTrack: () => void;
  seek: (time: number) => void;
};

const STORAGE_KEY = "music-mini-app.downloaded.v1";
const MusicContext = createContext<MusicContextValue | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [downloadedTracks, setDownloadedTracks] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setDownloadedTracks(JSON.parse(stored) as Track[]);
    } catch { /* Ignore invalid or unavailable browser storage. */ }
    finally { setStorageReady(true); }
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(downloadedTracks)); }
    catch { /* In-memory library remains available when storage is disabled. */ }
  }, [downloadedTracks, storageReady]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    audio.src = currentTrack.audioUrl;
    audio.load();
    setProgress(0);
    setDuration(currentTrack.duration || 0);
    void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [currentTrack]);

  const search = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      const results = await searchTracks(query);
      const decorated = results.map((track) => ({ ...track, isDownloaded: downloadedTracks.some((saved) => saved.id === track.id) }));
      setSearchResults(decorated);
      setQueue(decorated);
    }
    catch (error) { console.error("Music search failed", error); setSearchResults([]); }
    finally { setIsSearching(false); }
  }, [downloadedTracks]);

  const download = useCallback(async (track: Track) => {
    setDownloadingId(track.id);
    try {
      const saved = await downloadTrack(track.id);
      setDownloadedTracks((current) => current.some((item) => item.id === saved.id) ? current : [...current, saved]);
      setSearchResults((current) => current.map((item) => item.id === saved.id ? { ...item, isDownloaded: true } : item));
      // Trigger a browser download when allowed; the saved library record is independent of file storage.
      const anchor = document.createElement("a");
      anchor.download = `${saved.artist} - ${saved.title}.mp3`;
      try {
        const response = await fetch(saved.downloadUrl);
        if (!response.ok) throw new Error("Audio file is unavailable");
        const blobUrl = URL.createObjectURL(await response.blob());
        anchor.href = blobUrl;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
      } catch {
        // Cross-origin sources may reject fetch; keep the download available as a direct link.
        anchor.href = saved.downloadUrl;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      }
    } catch (error) { console.error("Track download failed", error); }
    finally { setDownloadingId(null); }
  }, []);

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  }, []);

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!currentTrack) {
      const first = downloadedTracks[0];
      if (first) playTrack(first);
      return;
    }
    if (audio.paused) void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    else { audio.pause(); setIsPlaying(false); }
  }, [currentTrack, downloadedTracks, playTrack]);

  const nextTrack = useCallback(() => {
    const list = downloadedTracks.length ? downloadedTracks : queue;
    const index = list.findIndex((track) => track.id === currentTrack?.id);
    if (index >= 0 && index + 1 < list.length) playTrack(list[index + 1]);
    else if (index < 0 && list[0]) playTrack(list[0]);
  }, [currentTrack, downloadedTracks, queue, playTrack]);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setProgress(time);
  }, []);

  const value: MusicContextValue = {
    searchResults, downloadedTracks, currentTrack, queue, isPlaying, progress, duration,
    isSearching, downloadingId, search, download, playTrack, togglePlayback, nextTrack, seek,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="metadata" onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime)} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || currentTrack?.duration || 0)} onEnded={() => { setIsPlaying(false); nextTrack(); }} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic must be used within MusicProvider");
  return context;
}
