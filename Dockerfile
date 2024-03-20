FROM node:latest

RUN npm install 

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npx","nodemon", "app.js"]
