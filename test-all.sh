#!/bin/sh
cd packages/lib/crypto && yarn test  --watchAll=false  \
&& cd ../offchainResolver && yarn test --watchAll=false  \
&& cd ../delivery-api && yarn test --watchAll=false  \
&& cd ../messaging && yarn test --watchAll=false  \
&& cd ../offchainResolver-api && yarn test  --watchAll=false \
&& cd ../profile && yarn test  --watchAll=false \
&& cd ../shared && yarn test  --watchAll=false \
&& cd ../storage && yarn test --watchAll=false  \
&& cd ../../backend && yarn test  --watchAll=false \


