import { downloadMockTrack, getMockTrack, searchMockTracks } from "./mock-music-api";
import type { Track } from "./types";

/** UI-facing API. Swap the adapter here when a real server endpoint is available. */
export function searchTracks(query: string): Promise<Track[]> {
  return searchMockTracks(query);
}

export function getTrack(id: string): Promise<Track | null> {
  return getMockTrack(id);
}

/** Returns track metadata; a real adapter should return a protected download URL or blob. */
export function downloadTrack(id: string): Promise<Track> {
  return downloadMockTrack(id);
}
