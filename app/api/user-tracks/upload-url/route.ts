import { NextResponse } from "next/server";
import { isTelegramVerificationConfigured, verifyTelegramInitData } from "@/lib/telegram-auth";
import { getSupabaseAdmin, USER_TRACKS_BUCKET } from "@/lib/supabase-admin";

export const runtime = "nodejs";
const maxBytes = 50 * 1024 * 1024;
const mimeByExtension: Record<string, string> = {
  mp3: "audio/mpeg", m4a: "audio/mp4", mp4: "audio/mp4", aac: "audio/aac", ogg: "audio/ogg",
  oga: "audio/ogg", opus: "audio/ogg", wav: "audio/wav", flac: "audio/flac", webm: "audio/webm",
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { initData?: string; fileName?: string; contentType?: string; size?: number } | null;
  if (!body?.initData || !body.fileName || !Number.isFinite(body.size) || !body.size) {
    return NextResponse.json({ error: "INVALID_UPLOAD" }, { status: 400 });
  }
  if (body.size > maxBytes) return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 413 });

  if (!isTelegramVerificationConfigured()) return NextResponse.json({ error: "TELEGRAM_NOT_CONFIGURED" }, { status: 503 });
  const user = await verifyTelegramInitData(body.initData);
  if (!user) return NextResponse.json({ error: "TELEGRAM_AUTH_REQUIRED" }, { status: 401 });

  const extension = body.fileName.split(".").pop()?.toLowerCase() ?? "";
  const contentType = mimeByExtension[extension];
  if (!contentType || (body.contentType && !body.contentType.startsWith("audio/") && body.contentType !== "application/octet-stream")) {
    return NextResponse.json({ error: "AUDIO_FILE_REQUIRED" }, { status: 415 });
  }

  try {
    const id = crypto.randomUUID();
    const path = `${user.id}/${id}.${extension}`;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage.from(USER_TRACKS_BUCKET).createSignedUploadUrl(path);
    if (error || !data) return NextResponse.json({ error: "UPLOAD_URL_FAILED" }, { status: 503 });
    return NextResponse.json({ id, path, token: data.token });
  } catch { return NextResponse.json({ error: "MUSIC_STORAGE_NOT_CONFIGURED" }, { status: 503 }); }
}
