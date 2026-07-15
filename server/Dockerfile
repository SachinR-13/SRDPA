FROM node:22-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]