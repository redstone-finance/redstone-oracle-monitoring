FROM node:16

WORKDIR /var/task/

COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn

COPY . .

RUN yarn build

ENV MONGO_DB_URL=
ENV METRICS_URL=
ENV MAILGUN_DOMAIN=
ENV MAILGUN_API_KEY=
ENV NOTIFICATION_RECIPIENT_EMAILS=
ENV PORT=3000
ENV BACKEND_URL=http://localhost:3000/api

CMD [ "yarn", "start" ]
