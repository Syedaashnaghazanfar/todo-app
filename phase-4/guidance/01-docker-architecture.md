# Phase 4: Docker Architecture Specifications

## 1. Overview
This document outlines the containerization strategy for the Todo App (Phase 4). The goal is to produce secure, lightweight, and production-ready Docker images for both the FastAPI backend and Next.js frontend.

**Key Principles:**
*   **Multi-stage Builds:** To minimize final image size and remove build dependencies.
*   **Non-Root Execution:** All containers must run as a non-privileged user for security.
*   **Immutable Infrastructure:** Images should be self-contained and configuration injected via environment variables.
*   **Layer Caching:** Optimize Dockerfile instruction order to maximize cache hits.

---

## 2. Backend Container (FastAPI)

### 2.1 Base Image & Dependencies
*   **Base Image:** `python:3.12-slim` (Debian-based, small footprint).
*   **Package Manager:** `pip` (standard) or `uv` (performance). For this spec, we will use standard `pip` with optimization flags, but `uv` is an acceptable alternative for faster CI/CD.

### 2.2 Dockerfile Structure (Multi-stage)

#### Stage 1: Builder (Optional/Implicit)
Since we are using pure Python, a separate builder stage is primarily useful if we need to compile dependencies (e.g., C extensions). For `slim` images, we can often install directly, but a virtual environment approach is cleaner.

#### Stage 2: Runtime
1.  **Workdir:** `/app`
2.  **Environment Variables:**
    *   `PYTHONDONTWRITEBYTECODE=1`
    *   `PYTHONUNBUFFERED=1`
    *   `PATH="/app/.venv/bin:$PATH"` (if using venv)
3.  **System Dependencies:** Install minimal runtime libs (e.g., `libpq-dev` if using `psycopg2`, though `psycopg-binary` or `asyncpg` is preferred for pure python).
4.  **User Creation:**
    ```dockerfile
    RUN addgroup --system appgroup && adduser --system --group appuser
    ```
5.  **Dependency Installation (Layer Optimization):**
    *   COPY `requirements.txt` .
    *   RUN `pip install --no-cache-dir --upgrade -r requirements.txt`
6.  **Application Code:**
    *   COPY `src/` ./src/
    *   COPY `alembic.ini` .
    *   COPY `alembic/` ./alembic/
7.  **Permissions:** `chown -R appuser:appgroup /app`
8.  **User Switch:** `USER appuser`
9.  **Command:**
    ```dockerfile
    CMD ["fastapi", "run", "src/main.py", "--port", "8000"]
    ```
    *Note: `fastapi run` is the production-ready command introduced in FastAPI 0.110.0+.*

### 2.3 Security & Optimization
*   **Non-root:** Strictly enforced via `USER appuser`.
*   **No Cache:** `pip install --no-cache-dir` prevents bloating the image with cache files.
*   **Explicit Port:** Expose port 8000.

---

## 3. Frontend Container (Next.js)

### 3.1 Base Image & Strategy
*   **Base Image:** `node:20-alpine` (Extremely lightweight).
*   **Strategy:** **Standalone Output**. This is critical. It bundles only the necessary files for production, excluding the massive `node_modules` folder typical of dev environments.

### 3.2 Dockerfile Structure (Multi-stage)

#### Stage 1: Deps (Dependency Installation)
*   Goal: Install dependencies for building.
*   Image: `node:20-alpine` + `libc6-compat` (often needed for alpine).
*   Action: Copy `package.json`, `package-lock.json`. Run `npm ci`.

#### Stage 2: Builder (Compilation)
*   Goal: Build the Next.js app.
*   Image: `node:20-alpine`.
*   Action:
    *   Copy `node_modules` from Deps.
    *   Copy source code.
    *   **Environment:** Set `NEXT_PUBLIC_` variables if they need to be baked in (though runtime config is preferred for container portability).
    *   Run `npm run build`.
    *   *Requirement:* Ensure `output: 'standalone'` is set in `next.config.js`.

#### Stage 3: Runner (Production Runtime)
*   Goal: Minimal runtime environment.
*   Image: `node:20-alpine`.
*   **User Creation:**
    ```dockerfile
    RUN addgroup --system --gid 1001 nodejs
    RUN adduser --system --uid 1001 nextjs
    ```
*   **File Copying:**
    *   Copy `public` folder.
    *   Copy `.next/static` folder to `.next/static`.
    *   Copy `.next/standalone` (The standalone build).
*   **Permissions:** Ensure `nextjs` user owns the `.next` directory (or at least the cache).
*   **User Switch:** `USER nextjs`
*   **Command:**
    ```dockerfile
    CMD ["node", "server.js"]
    ```
    *Note: Standalone builds produce a `server.js` entrypoint.*

### 3.3 Environment Variable Handling
*   **Build Time:** `NEXT_PUBLIC_*` variables that affect the bundle must be present during `npm run build`.
*   **Runtime:** Server-side variables (like API URL for SSR) can be passed to the container at runtime.

---

## 4. Image Tagging & Management
*   **Naming Convention:**
    *   `todo-backend:v{version}`
    *   `todo-frontend:v{version}`
*   **CI/CD:** Images should be built and pushed to a registry (e.g., Docker Hub, GHCR, or DigitalOcean Container Registry).
*   **Scanning:** All images should be scanned for vulnerabilities (e.g., using `trivy` or `docker scout`) before deployment.
