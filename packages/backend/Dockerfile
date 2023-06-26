FROM node:18-alpine
WORKDIR /app
COPY . .

RUN yarn install
# RUN yarn build
CMD  cd packages/backend && yarn start
EXPOSE 3000