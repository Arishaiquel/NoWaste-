const DEFAULT_BOT_USERNAME = "groceryfoodbot";

export function telegramBotUsername() {
  const configured = process.env.TELEGRAM_BOT_USERNAME?.trim().replace(/^@/, "");
  return configured && /^[A-Za-z0-9_]{5,32}$/.test(configured)
    ? configured
    : DEFAULT_BOT_USERNAME;
}

export function telegramBotUrl(command = "home") {
  const safeCommand = command === "rescue" || /^link_[a-f0-9]{48}$/.test(command)
    ? command
    : "home";

  return `https://t.me/${telegramBotUsername()}?start=${safeCommand}`;
}
