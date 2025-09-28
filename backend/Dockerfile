# backend/Dockerfile
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
WORKDIR /app

# OS + build deps (add pkg-config and libcairo2-dev for pycairo)
RUN apt-get update && apt-get install -y \
    ca-certificates curl git build-essential libpq-dev \
    software-properties-common pkg-config libcairo2-dev \
 && rm -rf /var/lib/apt/lists/*

# Python 3.12 from deadsnakes (use ensurepip, not apt's pip)
RUN add-apt-repository ppa:deadsnakes/ppa -y \
 && apt-get update && apt-get install -y \
    python3.12 python3.12-venv python3.12-dev \
 && rm -rf /var/lib/apt/lists/* \
 && ln -sf /usr/bin/python3.12 /usr/bin/python3 \
 && python3 -m ensurepip \
 && python3 -m pip install --upgrade pip setuptools wheel

# Install deps first for better caching
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the rest of your backend source
COPY . /app

# Bind to Render's $PORT (fallback for local runs)
ENV PORT=4042
CMD ["sh","-c","uvicorn main:app --host 0.0.0.0 --port ${PORT:-4042}"]
