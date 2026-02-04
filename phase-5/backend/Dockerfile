# Multi-stage Dockerfile for FastAPI Backend
# Base: python:3.12-slim
# Non-root user: appuser (UID 10001)
# Production command: fastapi run

# syntax=docker/dockerfile:1

# ============================================
# Stage 1: Dependencies
# ============================================
FROM python:3.12-slim AS deps

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV LANG=C.UTF-8

WORKDIR /app

# Create non-root user
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    appuser

# Install dependencies (cached layer)
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ============================================
# Stage 2: Runtime
# ============================================
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV LANG=C.UTF-8
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH=/app/src

WORKDIR /app

# Copy non-root user from deps stage
COPY --from=deps /etc/passwd /etc/passwd
COPY --from=deps /etc/group /etc/group

# Copy installed dependencies
COPY --from=deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=deps /usr/local/bin /usr/local/bin

# Copy application source code
COPY src ./src
COPY alembic ./alembic
COPY alembic.ini ./

# Switch to non-root user
USER appuser

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()"

EXPOSE 8000

# Conditional command: hot-reload for development, production mode otherwise
# Set ENV=development in values-minikube.yaml to enable hot-reload
CMD ["sh", "-c", "cd /app/src && if [ \"$ENV\" = \"development\" ]; then uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload; else uvicorn backend.main:app --host 0.0.0.0 --port 8000; fi"]
