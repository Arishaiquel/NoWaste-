import { afterEach, describe, expect, it } from "vitest";
import { telegramBotUrl, telegramBotUsername } from "@/lib/telegramBot";

const originalUsername = process.env.TELEGRAM_BOT_USERNAME;

afterEach(() => {
  if (originalUsername === undefined) delete process.env.TELEGRAM_BOT_USERNAME;
  else process.env.TELEGRAM_BOT_USERNAME = originalUsername;
});

describe("Telegram bot links", () => {
  it("links directly to the NoWaste bot by default", () => {
    delete process.env.TELEGRAM_BOT_USERNAME;
    expect(telegramBotUrl()).toBe("https://t.me/groceryfoodbot?start=home");
  });

  it("accepts a configured username with an optional @ prefix", () => {
    process.env.TELEGRAM_BOT_USERNAME = "@another_nowaste_bot";
    expect(telegramBotUsername()).toBe("another_nowaste_bot");
  });

  it("preserves valid link commands and rejects arbitrary commands", () => {
    const token = "a".repeat(48);
    expect(telegramBotUrl(`link_${token}`)).toContain(`?start=link_${token}`);
    expect(telegramBotUrl("unexpected")).toContain("?start=home");
  });
});
