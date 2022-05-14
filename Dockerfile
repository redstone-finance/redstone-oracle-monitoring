FROM node:16

WORKDIR /var/task/

COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn

COPY . .

ENV MONGO_DB_URL=
ENV METRICS_URL=
ENV MAILGUN_DOMAIN=
ENV MAILGUN_API_KEY=

CMD [ "yarn", "start" ]
