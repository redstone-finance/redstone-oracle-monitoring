# RedStone Oracle Monitoring

RedStone Oracle Monitoring is an application used to periodically download and validate data from the redstone ecosystem. It is also responsible for collecting metrics and notifying developers about potential issues.

## Installation

`yarn`
or
`yarn install`

## Running

`ts-node ./backend/src/run-monitoring-service.ts`

Frontend app will be served on `http://localhost:3000`

## Telegram integration

In order to integrate the monitoring notifier with telegram chat or channel, you need to populate `TELEGRAM_TOKEN` and `TELEGRAM_CHAT_ID` in the environment variables file. To get those variables you need to create a bot using [BotFather](#https://core.telegram.org/bots#3-how-do-i-create-a-bot) and add it to your chat or channel. After creating the bot you will receive an `access token` which you should use as `TELEGRAM_TOKEN`. Chat id can be found from bot updates response. It can be fetched from URL `https://api.telegram.org/bot<YourBOTToken>/getUpdates`. The response should be an object with `chat` attribute and `id` inside it.
