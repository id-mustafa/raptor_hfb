# ./Dockerfile
FROM python:3.12-slim

WORKDIR /app
# system deps you actually need (psycopg etc.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 && rm -rf /var/lib/apt/lists/*

# install deps first for better caching
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# copy code
COPY backend /app/backend

# Render will inject PORT (defaults to 10000 if you run locally)
ENV PORT=4402
CMD ["uvicorn","backend.main:app","--host","0.0.0.0","--port","4402"]
