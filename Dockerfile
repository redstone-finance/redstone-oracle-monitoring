FROM node:16

RUN mkdir /app
WORKDIR /app

# Installing required npm packages
COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn

# Copying all files
COPY . .

# Building app
RUN yarn build

# Running the gateway
CMD yarn start
