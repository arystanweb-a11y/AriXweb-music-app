export type VerifiedTelegramUser = {
  id: string;
  username: string | null;
  firstName: string;
};

export function isTelegramVerificationConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN);
}

export async function verifyTelegramInitData(initData: string): Promise<VerifiedTelegramUser | null> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken || !initData) return null;

  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");
  const authDate = Number(params.get("auth_date"));
  if (!receivedHash || !Number.isFinite(authDate)) return null;
  const now = Math.floor(Date.now() / 1000);
  if (authDate > now + 60 || now - authDate > 86_400) return null;

  const checkString = [...params.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode("WebAppData"), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const secret = await crypto.subtle.sign("HMAC", key, encoder.encode(botToken));
  const signingKey = await crypto.subtle.importKey("raw", secret, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", signingKey, encoder.encode(checkString)));
  const expectedHash = [...signature].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  if (receivedHash.length !== expectedHash.length) return null;
  let difference = 0;
  for (let index = 0; index < expectedHash.length; index += 1) difference |= expectedHash.charCodeAt(index) ^ receivedHash.charCodeAt(index);
  if (difference !== 0) return null;

  try {
    const user = JSON.parse(params.get("user") ?? "null") as { id?: number; username?: string; first_name?: string } | null;
    if (!user?.id || !user.first_name) return null;
    return { id: String(user.id), username: user.username ?? null, firstName: user.first_name };
  } catch { return null; }
}
