FROM --platform=linux/amd64 node:18-alpine as build
WORKDIR /build
COPY . .
RUN apk add --update bash\
   && rm -rf /var/cache/apk/*
RUN yarn install
RUN yarn build

# at this point, the whole mono-repo is built and ready to be served
# now, we can create multiple smaller images for each service

# build the delivery-service
FROM --platform=linux/amd64 node:18-alpine as delivery-service
WORKDIR /app
COPY --from=build /build/packages/delivery-service/ delivery-service/
COPY --from=build /build/packages/lib/ lib/

WORKDIR /app/delivery-service 
RUN yarn install

ENTRYPOINT [ "yarn" "start" ]

