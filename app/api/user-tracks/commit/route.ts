import { NextResponse } from "next/server";
import { isTelegramVerificationConfigured, verifyTelegramInitData } from "@/lib/telegram-auth";
import { getSupabaseAdmin, USER_TRACKS_BUCKET } from "@/lib/supabase-admin";

export const runtime = "nodejs";
const uuidPattern = /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { initData?: string; id?: string; path?: string; title?: string; artist?: string } | null;
  if (!body?.initData || !body.id || !body.path || !body.title || !uuidPattern.test(body.id)) {
    return NextResponse.json({ error: "INVALID_TRACK" }, { status: 400 });
  }
  if (!isTelegramVerificationConfigured()) return NextResponse.json({ error: "TELEGRAM_NOT_CONFIGURED" }, { status: 503 });
  const user = await verifyTelegramInitData(body.initData);
  if (!user) return NextResponse.json({ error: "TELEGRAM_AUTH_REQUIRED" }, { status: 401 });
  if (!body.path.startsWith(`${user.id}/${body.id}.`)) return NextResponse.json({ error: "INVALID_TRACK_PATH" }, { status: 403 });

  try {
    const supabase = getSupabaseAdmin();
    const filename = body.path.split("/").pop();
    const { data: uploadedFiles, error: lookupError } = await supabase.storage.from(USER_TRACKS_BUCKET).list(user.id, { search: filename });
    if (lookupError || !uploadedFiles?.some((file) => file.name === filename)) {
      return NextResponse.json({ error: "AUDIO_UPLOAD_MISSING" }, { status: 400 });
    }
    const audioUrl = supabase.storage.from(USER_TRACKS_BUCKET).getPublicUrl(body.path).data.publicUrl;
    const { data, error } = await supabase.from("user_tracks").insert({
      id: body.id,
      telegram_user_id: user.id,
      uploader_username: user.username,
      uploader_first_name: user.firstName,
      title: body.title.replace(/[\u0000-\u001f]/g, "").trim().slice(0, 120) || "Untitled",
      artist: body.artist?.replace(/[\u0000-\u001f]/g, "").trim().slice(0, 100) || "Unknown artist",
      audio_path: body.path,
    }).select("id,title,artist,audio_path,uploader_username,uploader_first_name,duration").single();

    if (error || !data) {
      await supabase.storage.from(USER_TRACKS_BUCKET).remove([body.path]);
      return NextResponse.json({ error: "TRACK_SAVE_FAILED" }, { status: 503 });
    }

    return NextResponse.json({ track: {
      id: data.id,
      title: data.title,
      artist: data.artist,
      cover: "/uploaded-track.svg",
      duration: data.duration ?? 0,
      audioUrl,
      downloadUrl: audioUrl,
      uploadedBy: data.uploader_username ? `@${data.uploader_username}` : data.uploader_first_name,
      isDownloaded: true,
    } });
  } catch { return NextResponse.json({ error: "MUSIC_STORAGE_NOT_CONFIGURED" }, { status: 503 }); }
}
