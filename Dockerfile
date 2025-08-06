FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p streams/hls streams/dash logs

# Expose ports
EXPOSE 1935 3001 8080

# Start the application
CMD ["node", "server.js"]