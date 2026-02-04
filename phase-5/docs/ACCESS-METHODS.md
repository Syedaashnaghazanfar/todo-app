# Todo App Access Methods - Phase 4 Deployment

**Last Updated:** 2026-01-06
**Status:** ✅ Working (Minikube Local Development)

This document describes two methods for accessing the Todo App deployed on Minikube: **Port-Forward (Recommended for Local Dev)** and **Ingress (Production-Ready)**.

---

## Quick Start (TL;DR)

**For Local Development (Recommended):**
```bash
# Start Minikube tunnel (keep running)
minikube tunnel

# Port-forward frontend and backend (in separate terminals)
kubectl port-forward svc/todo-frontend 3000:3000
kubectl port-forward svc/todo-backend 8000:8000

# Access application
http://localhost:3000
```

---

## Method 1: Port-Forward Access (Local Development) ✅ WORKING

**Status:** ✅ **Currently Working**
**Use Case:** Local Minikube development, debugging, quick testing
**Pros:** Simple, no DNS configuration, works immediately
**Cons:** Requires manual port-forward commands, not production-ready

### Prerequisites
- Minikube running (`minikube status`)
- Application deployed (`helm list`)
- All pods in Running state (`kubectl get pods`)

### Step-by-Step Setup

#### 1. Start Minikube Tunnel
```bash
# Open Command Prompt as Administrator
minikube tunnel
```

**Expected Output:**
```
✅ Tunnel successfully started
📌 NOTE: Please do not close this terminal...
🏃 Starting tunnel for service todo-ingress.
```

**⚠️ IMPORTANT:** Keep this terminal window open! The tunnel must stay running.

#### 2. Port-Forward Frontend
```bash
# Open a new terminal
kubectl port-forward svc/todo-frontend 3000:3000
```

**Expected Output:**
```
Forwarding from 127.0.0.1:3000 -> 3000
Forwarding from [::1]:3000 -> 3000
```

#### 3. Port-Forward Backend
```bash
# Open another new terminal
kubectl port-forward svc/todo-backend 8000:8000
```

**Expected Output:**
```
Forwarding from 127.0.0.1:8000 -> 8000
Forwarding from [::1]:8000 -> 8000
```

#### 4. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

### Verification

**Test Frontend:**
```bash
curl -I http://localhost:3000
# Expected: HTTP/1.1 200 OK
```

**Test Backend:**
```bash
curl http://localhost:8000/api/v1/health
# Expected: {"status":"healthy","service":"todo-app-backend"}
```

**Test Full Stack:**
1. Open http://localhost:3000
2. Sign up with a new account
3. Create a task
4. Use the ChatKit AI assistant
5. Verify all features work

### Troubleshooting Port-Forward

**Problem:** Port already in use
```
Error: listen tcp 127.0.0.1:3000: bind: Only one usage of each socket address...
```
**Solution:**
```bash
# Find and kill the process using the port
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Problem:** Connection refused
```
Error from server: error dialing backend: dial tcp 10.244.0.24:3000: connect: connection refused
```
**Solution:**
```bash
# Check if pods are running
kubectl get pods
# Restart port-forward
kubectl port-forward svc/todo-frontend 3000:3000
```

**Problem:** Port-forward keeps disconnecting
```
Handling connection for 3000
E0106 error: lost connection to pod
```
**Solution:** This is normal behavior. Port-forward automatically reconnects. If it doesn't, press Ctrl+C and restart the command.

---

## Method 2: Ingress Access (Production-Ready) 🚧 IN PROGRESS

**Status:** 🚧 **Partially Working** (works inside Minikube, browser caching issues on Windows)
**Use Case:** Production deployments, real cloud clusters (AWS EKS, GCP GKE, Azure AKS)
**Pros:** Production-ready, SSL support, load balancing, no manual port-forwarding
**Cons:** Requires DNS configuration, more complex setup on Windows + Minikube

### Prerequisites
- Minikube with Ingress addon enabled (`minikube addons list`)
- Minikube tunnel running (`minikube tunnel`)
- Ingress controller running (`kubectl get pods -n ingress-nginx`)

### Step-by-Step Setup

#### 1. Enable Ingress Addon
```bash
minikube addons enable ingress
```

**Verify Ingress Controller:**
```bash
kubectl get pods -n ingress-nginx
# Expected: ingress-nginx-controller-xxx Running
```

#### 2. Get Minikube IP
```bash
minikube ip
# Expected: 192.168.49.2 (may vary)
```

#### 3. Add Hosts Entry

**Windows:**
1. Open Notepad as Administrator
2. Open file: `C:\Windows\System32\drivers\etc\hosts`
3. Add line at the end:
   ```
   192.168.49.2  todo-app.local
   ```
4. Save and close

**Verify DNS:**
```bash
ping todo-app.local
# Expected: Reply from 192.168.49.2
```

#### 4. Start Minikube Tunnel
```bash
# Command Prompt as Administrator
minikube tunnel
```

**Keep this running!**

#### 5. Access the Application
Open your browser and navigate to:
```
http://todo-app.local
```

### Current Status & Known Issues

**✅ Working:**
- Ingress controller is running
- Ingress routes are configured correctly
- Services have active endpoints
- Tested successfully from inside Minikube:
  ```bash
  minikube ssh "curl -H 'Host: todo-app.local' http://192.168.49.2/"
  # Returns: Full HTML of Todo App homepage
  ```

**🚧 Known Issues:**
1. **Browser Caching:** Windows browsers may cache old "bad request" errors
   - **Workaround:** Use Incognito mode or clear browser cache (Ctrl+Shift+Delete)
   - **Alternative:** Use port-forward method instead

2. **Windows Networking:** Docker Desktop + Minikube + Windows has networking quirks
   - Tunnel works but browser may not resolve correctly
   - **Recommendation:** For local development, use Method 1 (Port-Forward)
   - **For Production:** Deploy to real cloud cluster (AWS EKS, GCP GKE) where Ingress works perfectly

### Ingress Configuration

**Current Ingress Setup:**
```yaml
Host: todo-app.local
Rules:
  - Path: /api → Service: todo-backend (port 8000)
  - Path: / → Service: todo-frontend (port 3000)
Annotations:
  - nginx.ingress.kubernetes.io/ssl-redirect: "false"  # Disabled for local dev
```

**View Ingress:**
```bash
kubectl get ingress
kubectl describe ingress todo-ingress
```

### Troubleshooting Ingress

**Problem:** "bad request" error in browser
**Root Cause:** Browser cached old error or SSL redirect misconfiguration
**Solutions:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Use Incognito mode (Ctrl+Shift+N)
3. Hard refresh (Ctrl+F5)
4. **Or just use Method 1 (Port-Forward)** ✅

**Problem:** DNS not resolving
```bash
ping todo-app.local
# ping: cannot resolve todo-app.local
```
**Solution:**
- Verify hosts file entry exists and uses correct Minikube IP
- Flush DNS cache:
  ```bash
  ipconfig /flushdns
  ```

**Problem:** Ingress shows "404 Not Found"
**Solution:**
```bash
# Check Ingress rules
kubectl describe ingress todo-ingress

# Check backend is accessible internally
kubectl run test --rm -it --image=curlimages/curl --restart=Never -- curl http://todo-backend:8000/api/v1/health
```

---

## Comparison: Port-Forward vs Ingress

| Feature | Port-Forward | Ingress |
|---------|--------------|---------|
| **Ease of Setup** | ✅ Simple (2 commands) | 🟡 Moderate (hosts file, tunnel) |
| **Local Development** | ✅ Perfect | 🟡 Overkill |
| **Production Ready** | ❌ No | ✅ Yes |
| **SSL/TLS Support** | ❌ No | ✅ Yes |
| **Load Balancing** | ❌ No | ✅ Yes |
| **Path-Based Routing** | ❌ Manual | ✅ Automatic |
| **Persistence** | ❌ Manual restart needed | ✅ Persistent |
| **Windows Compatibility** | ✅ Excellent | 🟡 Has quirks |
| **Cloud Deployment** | ❌ Not applicable | ✅ Ideal |

---

## Recommendations

### For Phase 4 (Local Minikube Development) ✅
**Use Method 1: Port-Forward**
- Quick and reliable
- No DNS configuration needed
- Works perfectly on Windows + Docker Desktop + Minikube
- Ideal for testing features, debugging, and development

### For Phase 5 (Real Cloud Deployment) 🚀
**Use Method 2: Ingress**
- Deploy to AWS EKS, GCP GKE, or Azure AKS
- Use real domain name (not .local)
- Enable SSL/TLS with cert-manager
- Configure production-ready load balancing
- Ingress will work perfectly without the Windows/Minikube quirks

---

## Environment Variables Configuration

Both methods use the same environment variable configuration:

**Frontend ConfigMap Variables:**
- `NEXT_PUBLIC_API_URL`: `http://localhost:8000` (for port-forward method)
- `NEXT_PUBLIC_CHATKIT_URL`: `http://localhost:8000/api/chatkit`
- `NEXT_PUBLIC_APP_URL`: `http://localhost:3000`

**Backend Secret Variables:**
- `DATABASE_URL`: Neon PostgreSQL connection string
- `OPENAI_API_KEY`: OpenAI API key for ChatKit
- `BETTER_AUTH_SECRET`: Better Auth JWT secret
- `JWT_SECRET`: JWT signing secret
- `GROQ_API_KEY`: Groq LLM API key
- `BETTERAUTH_DATABASE_URL`: Database URL for Better Auth

**Backend ConfigMap Variables (17 total):**
- `LLM_PROVIDER`: `groq`
- `GROQ_DEFAULT_MODEL`: `openai/gpt-oss-20b`
- `ENVIRONMENT`: `development`
- And 14 more configuration variables

---

## Next Steps

### Immediate (Phase 4 Complete) ✅
- [X] Port-forward method working
- [X] All features tested (signup, login, tasks, ChatKit AI)
- [X] Documentation complete
- [ ] Create MINIKUBE.md with full setup guide
- [ ] Create TROUBLESHOOTING.md with common issues

### Future (Phase 5 - Real Cloud Deployment) 🚀
- [ ] Deploy to AWS EKS / GCP GKE / Azure AKS
- [ ] Configure real domain name (e.g., todo-app.example.com)
- [ ] Enable SSL/TLS with cert-manager
- [ ] Configure production Ingress with proper routing
- [ ] Test Ingress in real cloud environment (will work perfectly!)

---

## Support

**If you encounter issues:**
1. Check that all 3 windows are running:
   - Minikube tunnel (Command Prompt as Admin)
   - Frontend port-forward
   - Backend port-forward

2. Verify pods are running:
   ```bash
   kubectl get pods
   # All should show 1/1 Running
   ```

3. Check logs:
   ```bash
   kubectl logs -l component=backend --tail=20
   kubectl logs -l component=frontend --tail=20
   ```

4. If all else fails, restart everything:
   ```bash
   # Kill all port-forwards (Ctrl+C in each terminal)
   # Restart in order:
   minikube tunnel
   kubectl port-forward svc/todo-frontend 3000:3000
   kubectl port-forward svc/todo-backend 8000:8000
   ```

---

**Document Version:** 1.0.0
**Last Tested:** 2026-01-06
**Minikube Version:** v1.37.0
**Kubernetes Version:** v1.34.0
**Status:** ✅ Port-Forward Method Working | 🚧 Ingress Method Partial
