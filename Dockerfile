FROM node:latest

RUN npm install nodemon

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm","nodemon", "app.js"]
