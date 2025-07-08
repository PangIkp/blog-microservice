FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Run prisma generate inside Docker
RUN npx prisma generate

CMD ["npx", "ts-node-dev", "src/index.ts"]
