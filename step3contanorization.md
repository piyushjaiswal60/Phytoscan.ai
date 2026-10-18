# PhytoScan AI - Exhaustive Containerization Instructions (Step 3)

**Objective:** Build a highly optimized, production-ready Docker environment using `docker-compose.yml` and multi-stage Dockerfiles. The build must strictly respect the Python 3.11 requirement due to PyO3/TensorFlow dependencies and properly map the existing machine learning assets.

Please generate the following 4 files exactly as specified below.

## 1. Backend Dockerfile (`/backend/Dockerfile`)
Create this file inside the `backend/` folder. This must be a highly optimized Python container.
*   **Base Image:** Strictly use `python:3.11-slim`. Do not use latest or 3.13, as it will break the PyO3/Pydantic-core rust compilation.
*   **System Dependencies:** Run `apt-get update && apt-get install -y libgl1 libglib2.0-0` (required for OpenCV/image processing libraries often used with TensorFlow).
*   **Layer Caching:** 
    *   Copy *only* `backend/requirements.txt` first.
    *   Run `pip install --no-cache-dir -r requirements.txt`.
*   **Asset Mapping:** 
    *   Copy the `backend/app/` directory to `/app/backend/app/`.
    *   **CRITICAL:** Copy the root `models/` directory to `/app/models/` and `labels.json` to `/app/labels.json`. The backend code expects these paths relative to the working directory.
*   **Execution:** Set the working directory to `/app` and set the command: `CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]`.

## 2. Frontend Dockerfile (`/frontend/Dockerfile`)
Create this file inside the `frontend/` folder. This must be a Multi-Stage build.
*   **Stage 1: Build (Node)**
    *   Use `node:18-alpine` as `builder`.
    *   Set working directory to `/app`.
    *   Copy `package.json` and `package-lock.json` first, run `npm ci` (or `npm install`).
    *   Copy the rest of the frontend code.
    *   Run `npm run build`.
*   **Stage 2: Production Server (Nginx)**
    *   Use `nginx:alpine`.
    *   Remove the default Nginx index page: `rm -rf /usr/share/nginx/html/*`.
    *   Copy the built assets from Stage 1 (`/app/dist`) to `/usr/share/nginx/html`.
    *   Copy the custom Nginx configuration (specified below) to `/etc/nginx/conf.d/default.conf`.
    *   Expose port 80 and run Nginx.

## 3. Nginx Configuration (`/frontend/nginx.conf`)
Create this file inside the `frontend/` folder to handle React Router and the FastAPI proxy.
*   **Server Block:** Listen on port 80.
*   **Static Routing:** For `location /`, define `root /usr/share/nginx/html;` and `index index.html;`.
*   **SPA Fallback:** Include `try_files $uri $uri/ /index.html;` so React handles client-side routing without throwing 404 errors on page refresh.
*   **API Proxy:** Create a `location /api/` block.
    *   Use `proxy_pass http://backend:8000/;` (ensure trailing slash behavior is handled correctly based on the FastAPI routes).
    *   Set headers: `proxy_set_header Host $host;`, `proxy_set_header X-Real-IP $remote_addr;`.

## 4. Docker Compose (`/docker-compose.yml`)
Create this file in the **root** of the project.
*   **Network:** Define a custom bridge network (e.g., `phytoscan-network`).
*   **Backend Service (`backend`):**
    *   `build:` context is `.` (the root directory), dockerfile is `backend/Dockerfile` (This is critical so the Docker daemon has access to the root `models/` and `labels.json` files during the build).
    *   Expose port `8000:8000`.
    *   Attach to `phytoscan-network`.
*   **Frontend Service (`frontend`):**
    *   `build:` context is `./frontend`.
    *   Expose port `80:80` (or `3000:80`).
    *   `depends_on:` `backend`.
    *   Attach to `phytoscan-network`.

Please write the exact code for these 4 files based on these rules. Do not skip the layer caching or path mappings.