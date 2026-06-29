# LEGEND AI - Production Multi-Stage GPU Dockerfile
# Combines Node.js web server with FFmpeg, Whisper transcription, and Python ML pipelines.

# --- Stage 1: Build Node.js full-stack applet ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package.json tsconfig.json vite.config.ts tailwind.config.ts ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Final Production Container ---
# For real GPU accelerated video recaps, we base on NVIDIA CUDA with Ubuntu support
FROM nvidia/cuda:12.2.0-base-ubuntu22.04
LABEL maintainer="Legend AI Team <admin@legend-ai.local>"

# Install system dependencies (FFmpeg, Python, NodeJS, etc.)
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    curl \
    git \
    ffmpeg \
    python3-pip \
    python3-dev \
    libsndfile1 \
    pkg-config \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python ML/Video core engines
# PySceneDetect (scene boundaries), Whisper (transcription), YOLOv8 (character/object recognition)
RUN pip3 install --no-cache-dir \
    fastapi \
    uvicorn \
    celery \
    redis \
    sqlalchemy \
    psycopg2-binary \
    scenedetect \
    openai-whisper \
    ultralytics \
    gdown \
    torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Copy build files from Stage 1
COPY --from=frontend-builder /app/dist ./dist
COPY --from=frontend-builder /app/package.json ./
COPY --from=frontend-builder /app/server.ts ./

# Install only production Node dependencies
RUN npm install --only=production && npm install -g tsx esbuild

# Copy dev/production configurations
COPY .env.example ./

# Expose port 3000 for standard Cloud Run routing
EXPOSE 3000

# Start command (Runs our bundled Node.js full-stack web service)
CMD ["tsx", "server.ts"]
