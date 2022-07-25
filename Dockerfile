FROM node:16-bullseye

WORKDIR /var/task/

COPY package.json package.json
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
COPY yarn.lock yarn.lock
COPY frontend/yarn.lock frontend/yarn.lock
COPY backend/yarn.lock backend/yarn.lock
RUN yarn

COPY . .

ENV MONGO_DB_URL=mongodb://mongodb:27017/redstone-oracle-monitoring?retryWrites=true&w=majority
ENV METRICS_URL=https://api.redstone.finance/metrics
ENV MAILGUN_DOMAIN=
ENV MAILGUN_API_KEY=
ENV MAILGUN_SENDER_EMAIL=
ENV EMAIL_NOTIFICATIONS_RECIPIENTS=dev@redstone.finance
ENV TELEGRAM_TOKEN=
ENV TELEGRAM_CHAT_ID=
ENV DB_DATA_TTL_DAYS=14
ENV PORT=3000
ENV BACKEND_URL=http://127.0.0.1:3000/api

EXPOSE 3000

RUN yarn frontend:docker:build
RUN yarn backend:build

CMD [ "yarn", "backend:start" ]
