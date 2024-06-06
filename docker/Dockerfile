FROM --platform=linux/amd64 node:22-alpine as build
WORKDIR /build
COPY . .
# we need coreutils for proper ls command
RUN apk add --update coreutils python3 make g++ curl bash gawk jq\
   && rm -rf /var/cache/apk/*
# RUN yarn install
# RUN yarn build

## Export libraries into archives
WORKDIR '/build/packages/lib'
# pack libraries into archives. they are copied to and used in the delivery service image.
# we ignore the billboard-api library because it is not properly connected to our monorepo
RUN mkdir /library_archives
RUN for lib in `ls -I billboard-api`; do cd $lib; yarn pack --filename /library_archives/$lib.tgz; cd ..;  done

## prepare dependency operations for all packages
WORKDIR '/build/packages'
# several steps are performed here for each package individually (but not for the libraries):
# 1. extract the information which libraries are needed for this package and store it in required_libraries
# 2. remove all dependencied referencing "workspace" in the monorepo from package.json
# 3. update the package.json with the resolutions from the docker/resolutions.json file
RUN for package in `ls -I lib`;\
   do cd $package;\
   grep -o '@dm3-org/dm3-lib-[^"]*' package.json| awk -F'dm3-lib-' '{print $NF}' > required_libraries; \
   sed -i '/.*dm3-org\/dm3-lib.*/d' ./package.json; \
   jq '. + input' package.json ../../docker/resolutions.json > updated_package.json;\
   mv updated_package.json package.json; \
   cd ..; \
   done

   ## Create a base image that contains some common tools and all libraries
FROM --platform=linux/amd64 node:22-alpine as base
RUN apk add --update bash gawk \
   && rm -rf /var/cache/apk/*

# copy archives of libraries
COPY --from=build /library_archives/ /library_archives/

# entrypoint is the same for all images that will be built from this image
ENTRYPOINT [ "yarn", "start" ]

FROM base

# override this with --build-arg="PACKAGE=delivery-service" to build another package
# the argument must correspond to the directory name in packages/
ARG PACKAGE=delivery-service

WORKDIR /app

RUN echo "Building package ${PACKAGE}"

# copy main package
COPY --from=build /build/packages/${PACKAGE} ./


# install required libraries from local archives
RUN yarn add $(cat required_libraries | awk '{print "file:/library_archives/"$1".tgz"}')

RUN yarn install
RUN yarn build

# remove some tools we don't need anymore to reduce image size
RUN apk del gawk




