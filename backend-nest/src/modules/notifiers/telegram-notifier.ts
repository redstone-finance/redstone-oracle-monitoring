import TelegramBot from "node-telegram-bot-api";
import { telegramConfig } from "src/config";

const token = telegramConfig.token;
const chatId = telegramConfig.chatId;

export const notify = (message: string) => {
  const bot = new TelegramBot(token);
  return bot.sendMessage(chatId, message);
};
