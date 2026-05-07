# ============================
# Stage 1 — Build environment
# ============================
FROM python:3.11-slim AS builder

ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install build deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend + requirements
COPY backend/ ./backend/
COPY backend/requirements.txt .

# Install dependencies into a wheelhouse
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt


# ============================
# Stage 2 — Runtime image
# ============================
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Create non-root user
RUN useradd -m appuser

# Install runtime deps only
COPY --from=builder /wheels /wheels
RUN pip install --no-cache /wheels/*

# Copy application code
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY config/ ./config/

# Expose FastAPI port
EXPOSE 8000

USER appuser

# Gunicorn with Uvicorn workers
CMD ["gunicorn", "server:app", \
     "--chdir", "backend", \
     "--workers", "4", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000", \
     "--timeout", "30"]
