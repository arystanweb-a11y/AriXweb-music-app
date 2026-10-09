import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const setupSecret = process.env.TELEGRAM_WEBHOOK_SETUP_SECRET;
  const suppliedSecret = request.headers.get("x-setup-secret");
  if (!setupSecret || !suppliedSecret || suppliedSecret !== setupSecret) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!token || !webhookSecret) {
    return NextResponse.json({ error: "TELEGRAM_ENV_MISSING" }, { status: 503 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://arixwebmusicapp.vercel.app/";
  const webhookUrl = new URL("/api/telegram/webhook", appUrl).toString();
  const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: webhookSecret,
      allowed_updates: ["message"],
      drop_pending_updates: false,
    }),
    cache: "no-store",
  });
  const result = await response.json().catch(() => null) as { ok?: boolean; description?: string } | null;
  if (!response.ok || !result?.ok) {
    return NextResponse.json({ error: result?.description ?? "SET_WEBHOOK_FAILED" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, webhookUrl });
}
