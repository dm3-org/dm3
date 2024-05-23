FROM node:18-alpine
WORKDIR /app
COPY . .
RUN apk add --update python3 make g++\
   && rm -rf /var/cache/apk/*
RUN yarn install
RUN yarn build
EXPOSE 3300 9229 8081
CMD   yarn workspace messenger-demo start
