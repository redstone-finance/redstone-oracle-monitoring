import TelegramBot from "node-telegram-bot-api";
import { telegramConfig } from "../config";

const token = telegramConfig.token;
const chatId = telegramConfig.chatId;

export const notify = (subject: string, message: string) => {
  const bot = new TelegramBot(token);
  return bot.sendMessage(chatId, `${subject}\n\n${message}`, {
    parse_mode: "HTML",
  });
};
