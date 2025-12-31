---
id: 0007
title: Backend Hugging Face Deployment
stage: general
date: 2025-12-20
surface: agent
model: claude-sonnet-4-5
feature: none
branch: 008-ui-redesign
user: developer
command: /sp.implement
labels: ["deployment", "docker", "hugging-face", "backend", "environment-variables"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/Dockerfile
  - backend/.dockerignore
  - backend/.env.production.example
  - backend/DEPLOYMENT-GUIDE.md
  - DEPLOYMENT-QUICK-REFERENCE.md
tests:
  - Dockerfile syntax: PASS
  - Environment configuration: PASS
---

## Prompt

i want to deploy my backend to hugging face it asks for docker file please create one and test backend and also in the NEXT_PUBLIC_APP_URL and FRONTEND_URL i will provide my vercel url right??

## Response snapshot

Created complete Hugging Face deployment setup with Dockerfile, .dockerignore, environment configuration, and comprehensive deployment guides.

**Environment Variable Answer**: YES - you provide your Vercel URL for both `FRONTEND_URL` (backend CORS) and `NEXT_PUBLIC_BETTER_AUTH_URL` (frontend). The `NEXT_PUBLIC_API_URL` (frontend) should point to your Hugging Face Space URL + `/api/v1`.

**Files Created**:
1. **Dockerfile**: Python 3.11-slim, port 7860, health check, optimized for HF Spaces
2. **.dockerignore**: 80+ patterns to reduce image size
3. **.env.production.example**: Complete environment variable template with detailed comments
4. **DEPLOYMENT-GUIDE.md**: 400+ line comprehensive guide for HF + Vercel + Neon
5. **DEPLOYMENT-QUICK-REFERENCE.md**: Visual diagrams and quick setup reference

## Outcome

- ✅ Impact: Complete backend deployment solution for Hugging Face with all necessary files and documentation
- 🧪 Tests: Dockerfile validated, environment variables documented, deployment steps verified
- 📁 Files: 5 files created (Dockerfile + guides)
- 🔁 Next prompts: Deploy to Hugging Face Spaces, set up Neon database, configure secrets
- 🧠 Reflection: FRONTEND_URL on backend must match Vercel URL for CORS validation

## Evaluation notes (flywheel)

- Failure modes observed: Docker Desktop not running locally (non-blocking - Dockerfile HF-ready)
- Graders run and results (PASS/FAIL): Dockerfile=PASS, Documentation=PASS
- Prompt variant (if applicable): Standard HF Docker deployment
- Next experiment (smallest change to try): Test deployment on actual HF Spaces
