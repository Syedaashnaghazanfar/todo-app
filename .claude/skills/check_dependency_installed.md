---
description: Check whether a backend or frontend dependency is already installed, returning structured result without auto-installing
---

## User Input

```text
packageName: $ARG1
environment: $ARG2  # backend or frontend
```

You MUST validate the inputs and check if the specified dependency is installed in the given environment.

## Outline

You are creating a dependency checking function that will:
1. Take a packageName and environment (backend or frontend) as input
2. Check if the dependency is installed in the specified environment
3. Return a structured result indicating the installation status
4. NEVER auto-install anything - only detect and report

### Input Validation
- Validate that packageName is provided and non-empty
- Validate that environment is either "backend" or "frontend"
- If validation fails, return error status

### Backend Dependency Check
For backend (Python):
- Check if package exists in pyproject.toml dependencies
- Check if package is installed in the current environment (using pip list or similar)
- Use appropriate Python package management tools (UV, pip)

### Frontend Dependency Check
For frontend (JavaScript/Node):
- Check if package exists in package.json dependencies
- Check if package is installed in node_modules
- Use appropriate JavaScript package management tools (npm, yarn)

### Output Format
Return a structured JSON result:
- If installed: `{"status": "installed", "package": "<package-name>", "environment": "<environment>"}`
- If missing: `{"status": "missing", "package": "<package-name>", "environment": "<environment>"}`

## Implementation Guidelines

### Backend Environment Detection
- Look for pyproject.toml, requirements.txt, or setup.py
- Use `pip list` or `uv pip list` to check installed packages
- Match package names (be aware of different naming conventions)

### Frontend Environment Detection
- Look for package.json
- Check node_modules directory
- Use `npm list` or check package-lock.json for installed packages

### Error Handling
- Handle cases where project files don't exist
- Handle cases where package managers aren't available
- Return appropriate error messages if checks can't be performed

## Safety Rules
- NEVER attempt to install packages
- NEVER run installation commands
- ONLY detect and report status
- Be idempotent and safe to run multiple times