FROM --platform=linux/amd64 node:18-alpine
WORKDIR /app
COPY . .
RUN apk add --update python3 make g++\
   && rm -rf /var/cache/apk/*
RUN yarn install
RUN yarn build
