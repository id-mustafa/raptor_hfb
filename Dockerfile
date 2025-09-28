FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive PYTHONUNBUFFERED=1
WORKDIR /app

RUN apt-get update && apt-get install -y \
    ca-certificates curl git build-essential libpq-dev \
    software-properties-common pkg-config libcairo2-dev \
 && rm -rf /var/lib/apt/lists/*

RUN add-apt-repository ppa:deadsnakes/ppa -y \
 && apt-get update && apt-get install -y \
    python3.12 python3.12-venv python3.12-dev \
 && rm -rf /var/lib/apt/lists/* \
 && ln -sf /usr/bin/python3.12 /usr/bin/python3 \
 && python3 -m ensurepip \
 && python3 -m pip install --upgrade pip setuptools wheel

# deps first
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# copy code as a package
COPY backend/ /app/backend
# ensure the package marker exists
RUN [ -f /app/backend/__init__.py ] || touch /app/backend/__init__.py

# start
ENV PORT=10000
CMD ["sh","-c","uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-10000}"]