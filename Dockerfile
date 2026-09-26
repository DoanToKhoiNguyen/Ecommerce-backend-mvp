FROM node:20-alpine

# Cài đặt openssl và libc6-compat để Prisma Engine chạy ổn định trên Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma/
COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]