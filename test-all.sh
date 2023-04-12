#!/bin/sh
cd packages/lib/ && 
yarn test --watchAll=false &&
cd ../backend/ && 
yarn test --watchAll=false &&
cd ../offchain-resolver/ && 
yarn test:local
