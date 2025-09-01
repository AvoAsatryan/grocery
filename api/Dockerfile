# Base stage: Minimal setup for all other stages
FROM node:20-slim AS base
WORKDIR /usr/src/app

# Install system dependencies for Prisma
RUN apt-get update && apt-get install -y openssl

# Development stage
FROM base AS dev
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose ports
EXPOSE 5000 9229

# Start with hot reload
CMD ["npm", "run", "start:dev"]

# Builder stage: Install dependencies, build app, and generate Prisma client
FROM base AS builder
WORKDIR /usr/src/app

# Copy package files first
COPY package*.json ./

# Copy prisma directory explicitly to ensure schema is present
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Set environment variables for better caching and generate Prisma client
ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-3.0.x
RUN npx prisma generate

# Copy source code and build the application
COPY . .
RUN npm run build

# Production stage: A minimal image for running the app
FROM base AS prod
WORKDIR /usr/src/app

# Copy only necessary artifacts from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
# IMPORTANT: Copy prisma directory for migrations
COPY --from=builder /usr/src/app/prisma ./prisma

# Expose the port
EXPOSE 5000

# Start the application
CMD ["npm", "run", "start:prod"]

# Migration stage: Specifically for running migrations
FROM base AS migrate
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Copy prisma directory with schema and migrations
COPY prisma ./prisma/

# Install only production dependencies plus prisma CLI
RUN npm ci --only=production && \
    npm install prisma

# Generate Prisma client
RUN npx prisma generate

# Default command for migrations
CMD ["npx", "prisma", "migrate", "deploy"]