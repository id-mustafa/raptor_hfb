# Production Dockerfile for Render deployment
FROM ubuntu:22.04

ENV TZ=America/New_York
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update \
    && apt-get install --yes \
    apt-transport-https \
    build-essential \
    ca-certificates \
    curl \
    git \
    gnupg \
    software-properties-common \
    tzdata \
    wget \
    cmake \
    pkg-config \
    libcairo2-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Caddy web server
RUN curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg \
    && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list \
    && apt update \
    && apt install caddy \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22
ENV NODE_MAJOR=22
RUN mkdir -p /etc/apt/keyrings \ 
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install nodejs -y \
    && npm install -g npm@latest \
    && rm -rf /var/lib/apt/lists/*

# Install Python 3.12
RUN add-apt-repository ppa:deadsnakes/ppa \
    && apt update \
    && apt install --yes \
    python3.12 \
    python3.12-venv \
    python3.12-dev \
    && rm -rf /var/lib/apt/lists* \
    && unlink /usr/bin/python3 \
    && ln -s /usr/bin/python3.12 /usr/bin/python3

# Install pip
RUN python3 -m ensurepip
RUN python3 -m pip install --upgrade pip setuptools

# Install honcho for process management
RUN python3 -m pip install honcho

# Create app directory
WORKDIR /app

# Copy and install Python dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN python3 -m pip install -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy frontend package files and install dependencies
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm ci --only=production

# Copy frontend code
COPY frontend/ ./

# Build frontend for production (if needed)
# RUN npm run build

# Copy configuration files
WORKDIR /app
COPY Procfile ./
COPY Caddyfile ./

# Create production Caddyfile
RUN echo ":$PORT {\n\
    reverse_proxy /api/* localhost:4402\n\
    reverse_proxy /* localhost:4401\n\
    encode gzip\n\
}" > Caddyfile.prod

# Expose port (Render will set PORT env var)
EXPOSE $PORT

# Start command
CMD ["honcho", "start"]
