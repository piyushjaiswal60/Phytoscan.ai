# PLAN.md — Plant Disease Full-Stack Upgrade

Work one step at a time. Tick the boxes only after the "Done when" checks have actually been run.
Each step = its own git branch, merged to `main` when finished.

---

## Step 0 — Audit (no code changes)
- [ ] Inspect the repo: models (format, size, input shape, preprocessing), class labels, Streamlit app, requirements, Python/TensorFlow versions.
- [ ] Write `AUDIT.md`: what exists, how predictions are currently made, risks (model size, TF version, missing labels file).
- [ ] Propose the final folder structure and the model-storage approach.

**Done when:** I have read `AUDIT.md` and approved the plan.

## Step 1 — FastAPI backend
- [ ] `backend/app/` with `main.py`, `config.py`, `schemas.py`, `model_service.py`.
- [ ] Load both models once at startup; reuse the exact preprocessing from my training code (image size, scaling).
- [ ] Endpoints: `GET /health`, `GET /models`, `POST /predict` (image upload + `model` = `custom_cnn` | `mobilenetv2`), `POST /predict/compare` (both models).
- [ ] Return top-3 predictions with class name and confidence.
- [ ] Validate uploads (JPEG/PNG only, max size); clear 4xx errors.
- [ ] CORS via environment variable. Auto docs at `/docs`.

**Done when:** `uvicorn` runs locally, and `curl` with a sample leaf image returns correct JSON for each endpoint; invalid files return a clean error.

## Step 2 — React frontend
- [ ] `frontend/` using Vite + React + TypeScript.
- [ ] Image upload (with preview), model selector, "Compare both models" view.
- [ ] Show top-3 predictions with confidence bars; loading and error states.
- [ ] API URL from environment variable (`VITE_API_URL`).

**Done when:** frontend and backend run together locally and a real prediction shows in the browser.

## Step 3 — Containerize
- [ ] `backend/Dockerfile` (slim base, non-root user, only needed files, `.dockerignore`).
- [ ] `frontend/Dockerfile` (multi-stage build, served by nginx).
- [ ] `docker-compose.yml` to run both with one command.

**Done when:** `docker compose up --build` works from a clean state and the app is usable at the documented URL.

## Step 4 — Manual smoke test
- [ ] Write `SMOKE_TEST.md`: a checklist (health check, each model, compare, bad file, oversized file, backend down).
- [ ] Run it against the Docker setup and record the real results, including any bugs found and fixed.

**Done when:** every item passes or has a logged known issue.

## Step 5 — Automated tests
- [ ] Backend: pytest tests for `/health`, `/models`, `/predict`, `/predict/compare`, validation errors, preprocessing function.
- [ ] Frontend: a few component tests (Vitest + React Testing Library) for upload and error states.
- [ ] Coverage report for the backend.

**Done when:** `pytest` and the frontend tests pass locally; report the real coverage number.

## Step 6 — GitHub Actions CI
- [ ] `.github/workflows/ci.yml` on push and pull request: lint (ruff, ESLint), backend tests, frontend tests, Docker build check.
- [ ] Dependency caching. Status badge in README.

**Done when:** CI is green on a pull request on GitHub, and I have seen a deliberately broken test turn it red (then reverted).

## Step 7 — CD and deployment
- [ ] Ask me to choose a hosting option (offer 2-3 free/low-cost options with trade-offs, mindful of TensorFlow image size and memory limits).
- [ ] `.github/workflows/cd.yml`: on merge to `main` and passing CI, build images and deploy.
- [ ] Secrets stored in GitHub Secrets only. Document every setup step.
- [ ] Update README with live URL, architecture diagram, API docs, how to run locally, and known limitations.

**Done when:** the live URL works end to end, and a push to `main` triggers a successful deploy.

## Step 8 — Wrap-up
- [ ] Finalise `LEARNING.md`.
- [ ] Draft resume bullets using ONLY things verified in this repo (real numbers, real URL). Mark anything unverified.
