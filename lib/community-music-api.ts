import { createClient } from "@supabase/supabase-js";
import type { Track } from "./types";
import { getTelegramInitData } from "./telegram";

type CommunityTrack = {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: number;
  audioUrl: string;
  downloadUrl: string;
  uploadedBy?: string;
};

export async function searchCommunityTracks(query: string): Promise<Track[]> {
  try {
    const response = await fetch(`/api/user-tracks?q=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    const result = (await response.json()) as { tracks?: CommunityTrack[] };
    return (result.tracks ?? []).map((track) => ({ ...track, isDownloaded: false }));
  } catch { return []; }
}

export async function uploadCommunityTrack(file: File): Promise<Track> {
  const initData = await getTelegramInitData();
  if (!initData) throw new Error("TELEGRAM_REQUIRED");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) throw new Error("SUPABASE_NOT_CONFIGURED");

  const fileTitle = file.name.replace(/\.[^.]+$/, "").trim();
  const separator = fileTitle.indexOf(" - ");
  const artist = separator > 0 ? fileTitle.slice(0, separator).trim().slice(0, 100) : "Unknown artist";
  const name = (separator > 0 ? fileTitle.slice(separator + 3).trim() : fileTitle).slice(0, 120) || "Untitled";
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const contentType = ({ mp3: "audio/mpeg", m4a: "audio/mp4", mp4: "audio/mp4", aac: "audio/aac", ogg: "audio/ogg", oga: "audio/ogg", opus: "audio/ogg", wav: "audio/wav", flac: "audio/flac", webm: "audio/webm" }[extension] ?? "application/octet-stream");
  const urlResponse = await fetch("/api/user-tracks/upload-url", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ initData, fileName: file.name, contentType: file.type, size: file.size, title: name }),
  });
  const urlResult = (await urlResponse.json()) as { error?: string; id?: string; path?: string; token?: string };
  if (!urlResponse.ok || !urlResult.id || !urlResult.path || !urlResult.token) throw new Error(urlResult.error ?? "UPLOAD_URL_FAILED");

  const client = createClient(supabaseUrl, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { error: uploadError } = await client.storage.from("user-tracks").uploadToSignedUrl(
    urlResult.path, urlResult.token, file, { contentType },
  );
  if (uploadError) throw new Error("AUDIO_UPLOAD_FAILED");

  const commitResponse = await fetch("/api/user-tracks/commit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ initData, id: urlResult.id, path: urlResult.path, title: name, artist }),
  });
  const commitResult = (await commitResponse.json()) as { error?: string; track?: Track };
  if (!commitResponse.ok || !commitResult.track) throw new Error(commitResult.error ?? "TRACK_SAVE_FAILED");
  return commitResult.track;
}
