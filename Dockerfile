FROM node:18

WORKDIR /app

COPY package.json package.json
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json

RUN yarn install

COPY . .

ENV BACKEND_URL=/api
ENV MONGO_DB_URL=mongodb://mongodb:27017/redstone-oracle-monitoring?retryWrites=true&w=majority
ENV DATA_SERVICES_CONFIG=./data-services-config.json
ENV UPTIME_KUMA_URL=

EXPOSE 3000

RUN yarn backend:build
RUN yarn frontend:docker:build

CMD [ "yarn", "backend:start" ]
