import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured, USER_TRACKS_BUCKET } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ tracks: [] });
  const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, 100) ?? "";
  const supabase = getSupabaseAdmin();
  let databaseQuery = supabase
    .from("user_tracks")
    .select("id,title,artist,audio_path,uploader_username,uploader_first_name,duration,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (query) databaseQuery = databaseQuery.textSearch("search_vector", query, { config: "simple", type: "plain" });
  const { data, error } = await databaseQuery;

  if (error) return NextResponse.json({ error: "CATALOG_UNAVAILABLE" }, { status: 503 });

  const tracks = (data ?? []).map((track) => {
      const audioUrl = supabase.storage.from(USER_TRACKS_BUCKET).getPublicUrl(track.audio_path).data.publicUrl;
      return {
        id: track.id,
        title: track.title,
        artist: track.artist,
        cover: "/uploaded-track.svg",
        duration: track.duration ?? 0,
        audioUrl,
        downloadUrl: audioUrl,
        uploadedBy: track.uploader_username ? `@${track.uploader_username}` : track.uploader_first_name,
      };
    });
  return NextResponse.json({ tracks });
}
