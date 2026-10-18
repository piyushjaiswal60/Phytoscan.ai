# Project: Plant Disease Classifier — Full-Stack Upgrade

## Context
I (the owner) am a B.Tech student preparing for software engineering interviews.
This repo already contains my Plant Disease Classification project:
- 38 plant disease classes, 54,000+ leaf images
- A custom CNN (about 93.4% test accuracy) and a MobileNetV2 transfer-learning model (about 96.2% test accuracy), built with TensorFlow/Keras
- A Streamlit app that compares both models on uploaded leaf images

**Goal:** turn this into a production-style full-stack app:
FastAPI backend -> React frontend -> Docker -> tests -> GitHub Actions CI -> CD -> deployment.

I must be able to explain every part in an interview. Optimise for my understanding, not just for working code.

## How we work (rules)
1. Follow `PLAN.md` strictly, ONE step at a time. At the end of each step: stop, summarise, and wait for me to say "continue".
2. Start every step by inspecting the existing repo. Do not delete or rewrite my existing notebooks, trained models or Streamlit app. If you move them, put them in `legacy/` and tell me.
3. Never fabricate. No invented metrics, test results, URLs or "it works" claims. Run the commands and report the real output. If something can't be verified, say so.
4. Use a git branch per step (`step-1-backend`, `step-2-frontend`, ...). Make small commits with clear messages. Merge to `main` only after the step's "Done when" checks pass.
5. Never commit secrets, `.env` files or large model files. Decide on model storage (Git LFS, release asset, or download-on-start) together with me and document it.
6. If a command or test fails: find the root cause. Do not skip tests, weaken assertions or hide errors to get green.
7. Ask me before any major choice (hosting provider, new framework, big dependency). Offer 2-3 options with trade-offs and a recommendation.
8. After each step, append to `LEARNING.md`: what was built, why this design, how to explain it in an interview, and 3 likely interview questions with short answers.
9. Pin dependency versions. Check TensorFlow / Python version compatibility before choosing the Python version.

## Target structure (adjust after auditing the repo)
```
backend/    FastAPI app (app/, tests/, requirements.txt, Dockerfile)
frontend/   React + Vite + TypeScript (src/, Dockerfile)
legacy/     original Streamlit app / notebooks if moved
.github/workflows/   ci.yml, cd.yml
docker-compose.yml
README.md   architecture diagram, setup, API docs, deploy notes
LEARNING.md
PLAN.md
```

## Code standards
- Backend: Python type hints, Pydantic schemas, config via environment variables, structured error responses, `ruff` for lint/format.
- Frontend: TypeScript strict mode, functional components, ESLint + Prettier, clear loading and error states.
- API: model loaded once at startup (not per request); validate uploads (file type, size limit); CORS origins from env; never load untrusted pickle files.
- Tests: pytest for backend (unit + API tests with FastAPI TestClient); keep tests fast by mocking or using a tiny stub model where appropriate.

## Honesty about AI use
I review everything you generate. Flag assumptions, uncertainty and anything you'd want a human to double-check.
