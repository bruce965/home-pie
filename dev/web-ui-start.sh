#!/bin/bash

cd /app

echo Configuring NPM cache...
npm config set cache /app/.npm-cache

echo Configuring Yarn cache...
yarn config set cache-folder /app/.yarn-cache

echo Installing dependencies...
yarn install

echo Watching dependencies...
npm exec --yes -- nodemon@2.0.22 --watch package.json --exec "yarn install" &

echo Starting web-ui server...
while :
do
	yarn start
	sleep 5
done
