FROM node:9-alpine

WORKDIR /coffaine-users

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY index.js .
COPY routes/ routes
COPY models/ models
COPY controllers/ controllers

EXPOSE 3000

CMD npm start