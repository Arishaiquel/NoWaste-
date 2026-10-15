const API = "https://api.telegram.org";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export function detectImageMime(bytes: Uint8Array): "image/jpeg" | "image/png" | "image/webp" | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return "image/png";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

function token(): string {
  if (!process.env.TELEGRAM_BOT_TOKEN) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  return process.env.TELEGRAM_BOT_TOKEN;
}

async function telegram<T>(method: string, body?: object): Promise<T> {
  const response = await fetch(`${API}/bot${token()}/${method}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body ?? {}),
  });
  const json = await response.json() as { ok: boolean; result: T; description?: string };
  if (!response.ok || !json.ok) throw new Error(`Telegram ${method} failed: ${json.description ?? response.status}`);
  return json.result;
}

export function sendMessage(chatId: number, text: string, replyMarkup?: object) {
  return telegram("sendMessage", { chat_id: chatId, text, reply_markup: replyMarkup });
}

export function answerCallbackQuery(id: string, text?: string) {
  return telegram("answerCallbackQuery", { callback_query_id: id, text });
}

export async function downloadTelegramPhoto(fileId: string): Promise<{ bytes: Uint8Array; mimeType: string }> {
  const file = await telegram<{ file_path?: string; file_size?: number }>("getFile", { file_id: fileId });
  if (!file.file_path) throw new Error("Telegram returned no file path");
  if (file.file_size && file.file_size > MAX_IMAGE_BYTES) throw new Error("Receipt image is too large (10 MB maximum)");
  const response = await fetch(`${API}/file/bot${token()}/${file.file_path}`);
  if (!response.ok) throw new Error(`Telegram file download failed: ${response.status}`);
  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (contentLength > MAX_IMAGE_BYTES) throw new Error("Receipt image is too large (10 MB maximum)");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.byteLength > MAX_IMAGE_BYTES) throw new Error("Receipt image is too large (10 MB maximum)");
  const mimeType = detectImageMime(bytes);
  if (!mimeType) throw new Error("Unsupported image type. Send JPEG, PNG, or WebP.");
  return { bytes, mimeType };
}

export const inlineKeyboard = (rows: Array<Array<{ text: string; callback_data: string }>>) => ({ inline_keyboard: rows });
