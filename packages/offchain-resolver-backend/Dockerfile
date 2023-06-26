FROM node:18-alpine
WORKDIR /app
COPY . .
ENV SIGNER_PRIVATE_KEY=SIGNER_PRIVATE_KEY
RUN apk add g++ make py3-pip
RUN yarn install
RUN yarn build
CMD  yarn workspace dm3-offchain-resolver-backend start
EXPOSE 8081