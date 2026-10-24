# ---- stage 1: build the React app ----
FROM node:22-slim AS web
WORKDIR /web
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ---- stage 2: Python API that also serves the built app ----
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
COPY --from=web /web/dist ./static
RUN useradd -m appuser && mkdir -p /app/data && chown -R appuser /app
USER appuser
ENV PORT=8000
EXPOSE 8000
# One process on purpose: running jobs are tracked in memory
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT}"]