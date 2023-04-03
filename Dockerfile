FROM node:18.14.0

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./

#install files

RUN npm install pm2 -g

RUN npm ci --include=dev

COPY . .

EXPOSE 5002

CMD ["npm", "run", "dev2"]