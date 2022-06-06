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

ENV MONGO_DB_URL=
ENV METRICS_URL=
ENV MAILGUN_DOMAIN=
ENV MAILGUN_API_KEY=
ENV MAILGUN_SENDER_EMAIL=
ENV EMAIL_NOTIFICATIONS_RECIPIENTS=
ENV TELEGRAM_TOKEN=
ENV TELEGRAM_CHAT_ID=
ENV DB_DATA_TTL_DAYS=
ENV PORT=3000
ENV BACKEND_URL=http://localhost:3000/api

EXPOSE 3000

CMD [ "yarn", "start" ]
