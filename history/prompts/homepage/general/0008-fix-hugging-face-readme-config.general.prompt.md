---
id: 0008
title: Fix Hugging Face README Config
stage: general
date: 2025-12-20
surface: agent
model: claude-sonnet-4-5
feature: none
branch: 008-ui-redesign
user: developer
command: /sp.implement
labels: ["hugging-face", "deployment", "readme", "configuration", "docker"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/README.md
  - backend/DEPLOYMENT-GUIDE.md
tests:
  - README config header validation: PASS
---

## Prompt

configuration error

Missing configuration in README

Base README.md template:

---

title: {{title}}

emoji: {{emoji}}

colorFrom: {{colorFrom}}

colorTo: {{colorTo}}

sdk: {{sdk}}

sdk_version: "{{sdkVersion}}"

app_file: app.py

pinned: false

---

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference got this error

## Response snapshot

Fixed Hugging Face Spaces configuration error by adding required YAML frontmatter to README.md.

**Root Cause**: Hugging Face Spaces requires a README.md file with specific metadata configuration at the top in YAML format. The backend README.md was missing this configuration header.

**Solution Applied**:
Added the following configuration header to `backend/README.md`:

```yaml
---
title: Todo App Backend API
emoji: ✅
colorFrom: purple
colorTo: blue
sdk: docker
pinned: false
---
```

**Configuration Breakdown**:
- `title`: Display name in Hugging Face Spaces UI
- `emoji`: Icon shown in Space listing (✅ checkmark for todo app)
- `colorFrom` & `colorTo`: Gradient colors for Space card (purple to blue matching app theme)
- `sdk`: Deployment SDK - "docker" for Docker-based deployment
- `pinned`: Whether to pin the Space (false = not pinned)

**Additional Updates**:
1. Updated DEPLOYMENT-GUIDE.md to emphasize README.md requirement
2. Added note about the mandatory HF Space config header
3. Included the config template in the upload checklist

**Why This Matters**:
Hugging Face Spaces uses the README.md metadata to:
- Configure the deployment SDK (Docker in our case)
- Display the Space in the UI with proper branding
- Determine build and runtime settings
- Show the Space card with correct styling

## Outcome

- ✅ Impact: Fixed critical deployment blocker for Hugging Face Spaces
- 🧪 Tests: README config format validated against HF Spaces requirements
- 📁 Files: 2 files updated (README.md + DEPLOYMENT-GUIDE.md)
- 🔁 Next prompts: Deploy backend to Hugging Face Spaces with updated README
- 🧠 Reflection: README.md is not just documentation - it's deployment configuration for HF Spaces

## Evaluation notes (flywheel)

- Failure modes observed: Missing required YAML frontmatter in README.md
- Graders run and results (PASS/FAIL): README format=PASS, Config completeness=PASS
- Prompt variant (if applicable): Standard HF Spaces README configuration
- Next experiment (smallest change to try): Test deployment with updated README on HF Spaces
