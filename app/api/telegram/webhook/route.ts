import { NextResponse } from "next/server";
import { getSupabaseAdmin, USER_TRACKS_BUCKET } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const maxDuration = 60;

type TelegramUser = { id: number; first_name?: string; username?: string };
type TelegramAudio = {
  file_id: string;
  file_unique_id: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
  title?: string;
  performer?: string;
  duration?: number;
};
type TelegramMessage = {
  message_id: number;
  chat: { id: number; type: string };
  from?: TelegramUser;
  text?: string;
  caption?: string;
  audio?: TelegramAudio;
  document?: TelegramAudio;
};
type TelegramUpdate = { update_id: number; message?: TelegramMessage };

const mimeByExtension: Record<string, { mime: string; extension: string }> = {
  mp3: { mime: "audio/mpeg", extension: "mp3" },
  m4a: { mime: "audio/mp4", extension: "m4a" },
  mp4: { mime: "audio/mp4", extension: "mp4" },
  aac: { mime: "audio/aac", extension: "aac" },
  ogg: { mime: "audio/ogg", extension: "ogg" },
  oga: { mime: "audio/ogg", extension: "oga" },
  opus: { mime: "audio/ogg", extension: "opus" },
  wav: { mime: "audio/wav", extension: "wav" },
  flac: { mime: "audio/flac", extension: "flac" },
  webm: { mime: "audio/webm", extension: "webm" },
};

async function telegramCall<T>(method: string, payload: Record<string, unknown>): Promise<T> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN_MISSING");
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const result = await response.json() as { ok: boolean; result?: T; description?: string };
  if (!response.ok || !result.ok || result.result === undefined) {
    throw new Error(result.description ?? `TELEGRAM_${method.toUpperCase()}_FAILED`);
  }
  return result.result;
}

async function sendMessage(chatId: number, text: string, withAppButton = false) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://arixwebmusicapp.vercel.app/";
  await telegramCall("sendMessage", {
    chat_id: chatId,
    text,
    ...(withAppButton ? {
      reply_markup: {
        inline_keyboard: [[{ text: "Открыть AriXweb Music", web_app: { url: appUrl } }]],
      },
    } : {}),
  });
}

export async function POST(request: Request) {
  const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const receivedSecret = request.headers.get("x-telegram-bot-api-secret-token");
  if (!expectedSecret || !receivedSecret || receivedSecret !== expectedSecret) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const update = await request.json().catch(() => null) as TelegramUpdate | null;
  const message = update?.message;
  if (!message?.chat?.id) return NextResponse.json({ ok: true });

  try {
    if (message.chat.type !== "private") {
      return NextResponse.json({ ok: true });
    }

    const file = message.audio ?? message.document;
    if (!file) {
      if (message.text?.startsWith("/start")) {
        await sendMessage(message.chat.id, "Отправьте мне аудиофайл как музыку или документ. Я добавлю его в общий каталог AriXweb Music.");
      } else if (message.text?.startsWith("/")) {
        await sendMessage(message.chat.id, "Чтобы добавить песню, отправьте аудиофайл в этот чат.");
      } else if (message.text || message.caption) {
        await sendMessage(message.chat.id, "Пришлите песню аудиофайлом (MP3, M4A, AAC, OGG, WAV, FLAC или WEBM).");
      }
      return NextResponse.json({ ok: true });
    }

    if (file.file_size && file.file_size > 20 * 1024 * 1024) {
      await sendMessage(message.chat.id, "Файл больше 20 МБ. Отправьте аудио меньшего размера.");
      return NextResponse.json({ ok: true });
    }

    const originalName = file.file_name ?? (file.mime_type === "audio/mpeg" ? "telegram-audio.mp3" : "");
    const rawExtension = originalName.split(".").pop()?.toLowerCase() ?? "";
    const fileType = mimeByExtension[rawExtension];
    if (!fileType || (file.mime_type && !file.mime_type.startsWith("audio/") && file.mime_type !== "application/octet-stream")) {
      await sendMessage(message.chat.id, "Не удалось распознать аудиофайл. Отправьте MP3, M4A, AAC, OGG, WAV, FLAC или WEBM.");
      return NextResponse.json({ ok: true });
    }

    const user = message.from;
    if (!user) {
      await sendMessage(message.chat.id, "Не удалось определить отправителя файла.");
      return NextResponse.json({ ok: true });
    }

    const safeUniqueId = file.file_unique_id.replace(/[^a-zA-Z0-9_-]/g, "");
    const path = `${user.id}/telegram-${safeUniqueId}.${fileType.extension}`;
    const supabase = getSupabaseAdmin();

    const { data: existing, error: existingError } = await supabase
      .from("user_tracks").select("id").eq("audio_path", path).maybeSingle();
    if (existingError) throw new Error("TRACK_LOOKUP_FAILED");
    if (existing) {
      await sendMessage(message.chat.id, "Эта песня уже есть в общем каталоге AriXweb Music.", true);
      return NextResponse.json({ ok: true });
    }

    const fileInfo = await telegramCall<{ file_path?: string; file_size?: number }>("getFile", { file_id: file.file_id });
    if (!fileInfo.file_path) throw new Error("TELEGRAM_FILE_PATH_MISSING");

    const token = process.env.TELEGRAM_BOT_TOKEN!;
    const downloadResponse = await fetch(`https://api.telegram.org/file/bot${token}/${fileInfo.file_path}`, { cache: "no-store" });
    if (!downloadResponse.ok) throw new Error("TELEGRAM_FILE_DOWNLOAD_FAILED");
    const bytes = Buffer.from(await downloadResponse.arrayBuffer());
    if (!bytes.length || bytes.length > 20 * 1024 * 1024) throw new Error("INVALID_AUDIO_SIZE");

    const { error: uploadError } = await supabase.storage.from(USER_TRACKS_BUCKET).upload(path, bytes, {
      contentType: fileType.mime,
      upsert: false,
      cacheControl: "3600",
    });
    if (uploadError) throw new Error("SUPABASE_AUDIO_UPLOAD_FAILED");

    const fileTitle = originalName.replace(/\.[^.]+$/, "").replace(/[\u0000-\u001f]/g, "").trim();
    const caption = message.caption?.trim() ?? "";
    const titleSource = file.title?.trim() || caption || fileTitle || "Без названия";
    const separator = titleSource.indexOf(" - ");
    const artist = (file.performer?.trim() || (separator > 0 ? titleSource.slice(0, separator).trim() : "") || "Неизвестный исполнитель").slice(0, 100);
    const title = (file.title?.trim() || (separator > 0 ? titleSource.slice(separator + 3).trim() : titleSource)).slice(0, 120) || "Без названия";

    const { error: insertError } = await supabase.from("user_tracks").insert({
      id: crypto.randomUUID(),
      telegram_user_id: String(user.id),
      uploader_username: user.username ?? null,
      uploader_first_name: user.first_name?.trim() || "Telegram user",
      title,
      artist,
      audio_path: path,
      duration: file.duration ?? 0,
    });
    if (insertError) {
      await supabase.storage.from(USER_TRACKS_BUCKET).remove([path]);
      throw new Error("TRACK_SAVE_FAILED");
    }

    await sendMessage(message.chat.id, `Добавлено в AriXweb Music\nНазвание: ${title}\nИсполнитель: ${artist}`, true);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram music upload failed:", error instanceof Error ? error.message : "UNKNOWN_ERROR");
    try {
      await sendMessage(message.chat.id, "Не получилось добавить песню. Попробуйте отправить файл ещё раз позже.");
    } catch { /* Telegram may be unavailable; acknowledge the webhook update. */ }
    return NextResponse.json({ ok: true });
  }
}
