FROM --platform=linux/amd64 node:18-alpine as build
WORKDIR /build
COPY . .
RUN apk add --update bash\
   && rm -rf /var/cache/apk/*
# todo: re-enable build
   #RUN yarn install
#RUN yarn build

## Export libraries into archives
WORKDIR '/build/packages/lib'
# pack libraries into archives. they are copied to and used in the delivery service image.
# we ignore the billboard-api library because it is not properly connected to our monorepo
RUN mkdir ../library-archives
RUN for lib in `ls -I billboard-api`; do cd $lib; yarn pack --filename ../../library-archives/$lib.tgz; cd ..;  done

# at this point, the whole mono-repo is built and ready to be served
# now, we can create multiple smaller images for each service
#
## build the delivery-service
#
FROM --platform=linux/amd64 node:18-alpine as delivery-service
WORKDIR /app
# copy main package
COPY --from=build /build/packages/delivery-service/ ./
# copy archives of libraries
COPY --from=build /build/packages/lib/*.tgz ./lib/

## make project runnable without monorepo. Sadly, we need to copy this code block for every image we build
# store necessary libraries in file
RUN grep -o '@dm3-org/dm3-lib-[^"]*' package.json| awk -F'-' '{print $NF}' > /required_libraries
# remove references to local libraries from package.json
RUN sed -i '/.*dm3-org\/dm3-lib.*/d' ./package.json
# install required libraries from local archives
RUN yarn add $(cat /required_libraries | awk '{print "file:lib/"$1".tgz"}')
# remove all library archives, we don't need them anymore
RUN rm -rf lib
# run yarn install and yarn build to make sure yarn is happy
RUN yarn install
RUN yarn build

ENTRYPOINT [ "yarn" "start" ]

