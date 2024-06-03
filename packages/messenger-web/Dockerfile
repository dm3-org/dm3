FROM node:22-alpine
WORKDIR /app
COPY . .
RUN apk add --update python3 make g++\
   && rm -rf /var/cache/apk/*
RUN yarn install
RUN yarn build
CMD   yarn workspace messenger-demo start
EXPOSE 3000