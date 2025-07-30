# 1. Base image
FROM node:18-slim

# 2. OS deps for Prisma
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# 3. Workdir
WORKDIR /app

# 4. Copy manifests first
COPY package*.json ./
COPY package-lock*.json ./
COPY prisma ./prisma/

# 5. Install ALL dependencies (tsx included)
RUN npm install

# 6. Generate Prisma client
RUN npx prisma generate

# 7. Copy source
COPY . .

# 8. Expose port
EXPOSE 3000

# 9. Default CMD (overridden by docker-compose)
CMD ["npm", "run", "dev"]
