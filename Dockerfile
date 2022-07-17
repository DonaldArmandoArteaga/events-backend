FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install 
RUN npm install typescript -g

COPY . .

RUN npm run build

EXPOSE 8080

CMD [ "node", "dist/src/index.js" ]