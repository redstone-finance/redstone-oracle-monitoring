# RedStone Oracle Monitoring

RedStone Oracle Monitoring is an application used to periodically download and validate data from the redstone ecosystem. It is also responsible for collecting metrics and notifying developers about potential issues.

## Installation

`yarn`
or
`yarn install`

## Running

In order to run monitoring service environment variables are required. The simplest way is to create `.env` files in main folder and populate with desired values based on `.env.example`

Then run:

`yarn dev`

Frontend app will be served on `http://localhost:3000`

## Docker running

`Dockerfile` is prepared in order to make usage of monitoring service easier. It can be found in main folder. In order to make it run environment variables inside file need to be populate. Then run following command in main folder to build Docker image:

`docker build -t oracle-monitoring .`

To start docker:

`docker run -p 127.0.0.1:3000:3000 oracle-monitoring`

## Telegram integration

In order to integrate the monitoring notifier with telegram chat or channel, you need to populate `TELEGRAM_TOKEN` and `TELEGRAM_CHAT_ID` in the environment variables file. To get those variables you need to create a bot using [BotFather](#https://core.telegram.org/bots#3-how-do-i-create-a-bot) and add it to your chat or channel. After creating the bot you will receive an `access token` which you should use as `TELEGRAM_TOKEN`. Chat id can be found from bot updates response. It can be fetched from URL `https://api.telegram.org/bot<YourBOTToken>/getUpdates`. The response should be an object with `chat` attribute and `id` inside it.
