FROM node:15-alpine

WORKDIR /coffaine-users

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY index.js .
COPY server.js .
COPY db.js .
COPY circuitBreaker.js .

COPY routes/ routes
COPY models/ models
COPY middleware/ middleware
COPY config/ config
COPY controllers/ controllers

EXPOSE 3000

CMD npm start
