# Multi-stage build for the deployment pipeline system
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the React application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server code
COPY server ./server

# Install Docker CLI for building images
RUN apk add --no-cache docker-cli

# Install AWS CLI
RUN apk add --no-cache aws-cli

# Create temp directory for builds
RUN mkdir -p /tmp/deployments

EXPOSE 3001

CMD ["npm", "run", "server"]