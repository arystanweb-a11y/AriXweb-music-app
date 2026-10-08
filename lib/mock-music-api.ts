import type { Track } from "./types";

const demoAudio = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
const mockTracks: Track[] = [
  { id: "demo-1", title: "Midnight City", artist: "M83", cover: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=160&h=160&fit=crop", duration: 244, audioUrl: demoAudio, downloadUrl: demoAudio, isDownloaded: false },
  { id: "demo-2", title: "Sunset Lover", artist: "Petit Biscuit", cover: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=160&h=160&fit=crop", duration: 237, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", downloadUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", isDownloaded: false },
  { id: "demo-3", title: "Ocean Drive", artist: "Duke Dumont", cover: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=160&h=160&fit=crop", duration: 191, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", downloadUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", isDownloaded: false },
  { id: "demo-4", title: "A Moment Apart", artist: "ODESZA", cover: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=160&h=160&fit=crop", duration: 228, audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", downloadUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", isDownloaded: false },
];

/** Mock adapter. Replace this module's implementation with server API requests later. */
export async function searchMockTracks(query: string): Promise<Track[]> {
  await new Promise((resolve) => setTimeout(resolve, 180));
  const normalized = query.trim().toLocaleLowerCase();
  const matches = normalized
    ? mockTracks.filter((track) => `${track.title} ${track.artist}`.toLocaleLowerCase().includes(normalized))
    : mockTracks;
  // Return demo suggestions when a query has no exact match, keeping the mock usable.
  return matches.length ? matches.map((track) => ({ ...track })) : mockTracks.slice(0, 3).map((track) => ({ ...track }));
}

export async function getMockTrack(id: string): Promise<Track | null> {
  const track = mockTracks.find((item) => item.id === id);
  return track ? { ...track } : null;
}

export async function downloadMockTrack(id: string): Promise<Track> {
  const track = await getMockTrack(id);
  if (!track) throw new Error("Трек не найден");
  return { ...track, isDownloaded: true };
}
