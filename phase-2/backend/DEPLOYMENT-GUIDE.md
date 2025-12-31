# Backend Deployment Guide - Hugging Face Spaces

## 📋 Overview

This guide walks you through deploying the Todo App backend to Hugging Face Spaces using Docker.

## 🎯 Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Vercel        │         │  Hugging Face    │         │  Neon           │
│   (Frontend)    │────────▶│  Spaces          │────────▶│  PostgreSQL     │
│                 │  HTTPS  │  (Backend)       │  SSL    │  (Database)     │
└─────────────────┘         └──────────────────┘         └─────────────────┘
  your-app.vercel.app     your-space.hf.space         neon.tech
```

## ✅ Prerequisites

1. **Hugging Face Account**: Sign up at https://huggingface.co
2. **Neon Database**: Create free PostgreSQL database at https://neon.tech
3. **Vercel Account** (for frontend): https://vercel.com
4. **Git**: Installed and configured

## 🗄️ Step 1: Set Up Neon PostgreSQL Database

### 1.1 Create Neon Project
1. Go to https://console.neon.tech
2. Click "New Project"
3. Name it (e.g., "todo-app-db")
4. Select region closest to your users
5. Click "Create Project"

### 1.2 Get Database Connection String
1. In your Neon dashboard, click "Connection Details"
2. Copy the connection string (looks like):
   ```
   postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```
3. **IMPORTANT**: Make sure `?sslmode=require` is at the end

### 1.3 Run Migrations (from your local machine)
```bash
# Set the DATABASE_URL temporarily
export DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"

# Run migrations
cd backend
alembic upgrade head
```

## 🚀 Step 2: Deploy Backend to Hugging Face Spaces

### 2.1 Create a New Space
1. Go to https://huggingface.co/spaces
2. Click "Create new Space"
3. Configuration:
   - **Owner**: Your username/organization
   - **Space name**: `todo-app-backend` (or your preferred name)
   - **License**: Apache 2.0 (or your choice)
   - **Space SDK**: Docker
   - **Visibility**: Public or Private
4. Click "Create Space"

### 2.2 Prepare Your Repository

#### Option A: Push to Hugging Face Git (Recommended)

1. Clone your new Space:
```bash
git clone https://huggingface.co/spaces/YOUR-USERNAME/todo-app-backend
cd todo-app-backend
```

2. Copy backend files:
```bash
# Copy all backend files from your project
cp -r /path/to/todo-app/backend/* .
```

3. Ensure these files are present:
   - `Dockerfile` ✅ (created)
   - `.dockerignore` ✅ (created)
   - `README.md` ✅ (with HF Space config header)
   - `requirements.txt` ✅ (exists)
   - `main.py` ✅ (exists)
   - All `src/` files ✅

4. Commit and push:
```bash
git add .
git commit -m "Initial backend deployment"
git push
```

#### Option B: Upload via Web Interface

1. In your Space, click "Files"
2. Click "Add file" → "Upload files"
3. Upload ALL backend files including:
   - `Dockerfile` ✅
   - `.dockerignore` ✅
   - `README.md` ✅ (IMPORTANT: Must have HF Space config header)
   - `requirements.txt` ✅
   - `main.py` ✅
   - `config.py` ✅
   - `alembic.ini` ✅
   - Entire `src/` directory ✅
   - Entire `alembic/` directory ✅

   **Note**: The README.md file MUST contain the Hugging Face Space configuration at the top:
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

### 2.3 Configure Environment Variables (Secrets)

1. In your Space, go to "Settings" tab
2. Scroll to "Repository secrets"
3. Add the following secrets:

#### Required Secrets:

| Secret Name | Example Value | Description |
|-------------|---------------|-------------|
| `DATABASE_URL` | `postgresql://user:pass@host.neon.tech/db?sslmode=require` | Neon PostgreSQL connection string |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Your Vercel frontend URL |
| `DEBUG` | `False` | Production mode |
| `LOG_LEVEL` | `INFO` | Logging level |
| `APP_PORT` | `7860` | Port for Hugging Face (must be 7860) |

#### Optional Secrets (if using authentication):

| Secret Name | Example Value | Description |
|-------------|---------------|-------------|
| `SECRET_KEY` | `your-secret-key-here` | Application secret key |
| `JWT_SECRET` | `your-jwt-secret-here` | JWT signing secret |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `JWT_EXPIRATION_MINUTES` | `60` | Token expiration time |

**Important**: Click "Save" after adding each secret.

### 2.4 Build and Deploy

1. After pushing files and setting secrets, Hugging Face will automatically build
2. Go to "App" tab to see build progress
3. Build takes 2-5 minutes
4. Once deployed, you'll see: "Your app is running at: https://your-space-name.hf.space"

### 2.5 Verify Deployment

Test your backend endpoints:

```bash
# Health check
curl https://your-space-name.hf.space/api/v1/health

# API docs
# Open in browser: https://your-space-name.hf.space/api/docs
```

Expected response for health check:
```json
{
  "status": "healthy",
  "service": "todo-app-backend"
}
```

## 🌐 Step 3: Connect Frontend to Backend

### 3.1 Update Frontend Environment Variables

In your Vercel project (frontend):

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Update/Add these variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://your-space-name.hf.space/api/v1` | Production |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | `https://your-app.vercel.app` | Production |

3. Click "Save"
4. Redeploy your frontend for changes to take effect

### 3.2 Update Backend CORS

Your backend automatically uses the `FRONTEND_URL` secret for CORS.

**Verify in main.py** that CORS is configured:
```python
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🧪 Step 4: Test End-to-End

### 4.1 Test Backend Directly

```bash
# Test health endpoint
curl https://your-space-name.hf.space/api/v1/health

# Test authentication (signup)
curl -X POST https://your-space-name.hf.space/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test User"}'

# Test tasks endpoint (after login)
curl https://your-space-name.hf.space/api/v1/tasks \
  -H "Cookie: session=your-session-cookie"
```

### 4.2 Test Frontend Integration

1. Open your Vercel app: `https://your-app.vercel.app`
2. Sign up for a new account
3. Create a task
4. Verify it saves and appears in the list
5. Check analytics, history, and other features

## 📊 Monitoring and Logs

### View Hugging Face Logs

1. Go to your Space
2. Click "Logs" tab
3. View real-time application logs

### Common Log Checks

- **Startup**: `INFO: Uvicorn running on http://0.0.0.0:7860`
- **Database**: Connection successful/failed messages
- **CORS**: Check for CORS errors if frontend can't connect
- **API Calls**: Request logs with status codes

## 🔧 Troubleshooting

### Issue: Build Fails

**Symptoms**: Build fails during Docker build

**Solutions**:
1. Check Dockerfile syntax
2. Verify all files are uploaded
3. Check build logs in Hugging Face
4. Ensure requirements.txt has all dependencies

### Issue: Database Connection Error

**Symptoms**: `Connection refused` or `SSL error`

**Solutions**:
1. Verify `DATABASE_URL` secret is correct
2. Ensure `?sslmode=require` is at the end of connection string
3. Check Neon database is active (not suspended)
4. Test connection from local machine first

### Issue: CORS Errors

**Symptoms**: Frontend can't connect to backend

**Solutions**:
1. Verify `FRONTEND_URL` secret matches your Vercel URL exactly
2. Check CORS middleware in main.py
3. Ensure HTTPS (not HTTP) in URLs
4. Check browser console for exact CORS error

### Issue: 404 on API Endpoints

**Symptoms**: API endpoints return 404

**Solutions**:
1. Verify you're using `/api/v1/` prefix
2. Check docs at `https://your-space-name.hf.space/api/docs`
3. Ensure routers are properly included in main.py

### Issue: Space Sleeping

**Symptoms**: First request takes long time

**Solution**:
- Free Hugging Face Spaces sleep after inactivity
- First request wakes up the space (takes ~30 seconds)
- Consider upgrading to paid plan for always-on spaces

## 🔄 Updating Your Deployment

### Update Code

1. Make changes to your backend code locally
2. Commit and push to Hugging Face:
```bash
cd backend
git add .
git commit -m "Update: description of changes"
git push
```
3. Hugging Face automatically rebuilds and redeploys

### Update Environment Variables

1. Go to Space Settings → Repository secrets
2. Update the secret value
3. Restart the space (toggle it off/on in Settings)

## 📈 Performance Optimization

### Database Pooling

Add to your database configuration:
```python
# In your database connection setup
engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True  # Verify connections before using
)
```

### Caching

Consider adding Redis for caching:
- Use Upstash Redis (free tier available)
- Cache frequent queries
- Reduce database load

### Health Check Endpoint

Already configured in `main.py`:
```python
@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "service": "todo-app-backend"}
```

## 🔐 Security Best Practices

1. **Never commit secrets**: Use Hugging Face secrets only
2. **Use HTTPS**: Ensure all URLs use HTTPS in production
3. **Validate inputs**: FastAPI Pydantic models handle this
4. **Rate limiting**: Consider adding rate limiting middleware
5. **Regular updates**: Keep dependencies updated

## 💰 Cost Considerations

### Free Tier (Current Setup)

- **Hugging Face**: Free Docker Spaces
  - Sleeps after inactivity
  - 16 GB RAM
  - 8 CPU cores
  - No GPU

- **Neon PostgreSQL**: Free tier
  - 0.5 GB storage
  - Suspends after 5 minutes of inactivity
  - 100 hours of active compute per month

- **Vercel**: Free tier
  - Unlimited websites
  - 100 GB bandwidth
  - Automatic HTTPS

### Upgrade Options

If you need:
- **Always-on backend**: Upgrade Hugging Face Space ($5-20/month)
- **More database**: Neon Pro ($19/month for 10 GB)
- **More bandwidth**: Vercel Pro ($20/month)

## 📞 Support and Resources

### Documentation

- **Hugging Face Spaces**: https://huggingface.co/docs/hub/spaces
- **Neon PostgreSQL**: https://neon.tech/docs
- **FastAPI**: https://fastapi.tiangolo.com
- **Vercel**: https://vercel.com/docs

### Getting Help

- **Hugging Face Forum**: https://discuss.huggingface.co
- **Neon Community**: https://neon.tech/community
- **Project Issues**: GitHub repository

## ✅ Deployment Checklist

- [ ] Neon PostgreSQL database created and connection string obtained
- [ ] Database migrations run successfully
- [ ] Hugging Face Space created with Docker SDK
- [ ] Backend files uploaded/pushed to Space
- [ ] All environment secrets configured in Space settings
- [ ] Space built and deployed successfully
- [ ] Health check endpoint returns 200 OK
- [ ] API documentation accessible at /api/docs
- [ ] Frontend environment variables updated in Vercel
- [ ] CORS working (frontend can call backend)
- [ ] End-to-end test: signup → login → create task → verify data
- [ ] All API endpoints tested and working
- [ ] Logs checked for errors

## 🎉 Next Steps

1. **Custom Domain**: Add custom domain in Hugging Face Settings
2. **Monitoring**: Set up uptime monitoring (e.g., UptimeRobot)
3. **Analytics**: Add analytics to track API usage
4. **Backups**: Set up database backup strategy in Neon
5. **CI/CD**: Automate deployments with GitHub Actions

---

**Last Updated**: 2025-12-20
**Deployment Platform**: Hugging Face Spaces + Neon PostgreSQL
**Status**: ✅ Production Ready
