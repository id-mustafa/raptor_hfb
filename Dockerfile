# Production Dockerfile for Render deployment
FROM ubuntu:22.04

ENV TZ=America/New_York
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# System deps
RUN apt-get update && apt-get install -y \
    ca-certificates curl git gnupg software-properties-common tzdata \
    build-essential cmake pkg-config libcairo2-dev libpq-dev \
    python3.12 python3.12-venv python3.12-dev python3-pip \
 && rm -rf /var/lib/apt/lists/*

# Ensure python3 -> 3.12 and modern pip
RUN ln -sf /usr/bin/python3.12 /usr/bin/python3 && python3 -m pip install --upgrade pip setuptools wheel

# Node 22 for build
RUN mkdir -p /etc/apt/keyrings \
 && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
 && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
 && apt-get update && apt-get install -y nodejs \
 && npm i -g npm@latest \
 && rm -rf /var/lib/apt/lists/*

# Caddy
RUN curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg \
 && curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list \
 && apt-get update && apt-get install -y caddy \
 && rm -rf /var/lib/apt/lists/*

# Honcho (ok to keep, see note)
RUN python3 -m pip install honcho

WORKDIR /app

# ---- Backend deps ----
COPY backend/requirements.txt ./backend/requirements.txt
RUN python3 -m pip install --no-cache-dir -r backend/requirements.txt

# ---- App code ----
COPY backend ./backend

# ---- Frontend build ----
WORKDIR /app/frontend
COPY frontend/package*.json ./
# Install ALL deps to build; prune later if you care about size
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Move built static to where Caddy will serve from
WORKDIR /app
RUN mkdir -p /srv/www && \
    if [ -d "frontend/dist" ]; then cp -R frontend/dist/* /srv/www/; \
    elif [ -d "frontend/build" ]; then cp -R frontend/build/* /srv/www/; \
    else echo "No dist/ or build/ found"; exit 1; fi

# ---- Configs ----
COPY Caddyfile.prod /app/Caddyfile.prod
COPY Procfile.prod /app/Procfile.prod

# (Optional) expose a typical port for local runs; Render ignores this anyway
EXPOSE 10000

# One command that keeps both processes alive
CMD ["honcho","start","-f","/app/Procfile.prod"]
