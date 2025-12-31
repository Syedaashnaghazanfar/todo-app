# 🚀 Deployment Quick Reference

## Environment Variables Configuration

### 🎨 Frontend (Vercel)

Set these in **Vercel Dashboard** → Project → Settings → Environment Variables:

```env
# Backend API URL (Your Hugging Face Space URL)
NEXT_PUBLIC_API_URL=https://your-space-name.hf.space/api/v1

# Frontend URL (Your Vercel deployment URL)
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-app.vercel.app

# Optional
NEXT_PUBLIC_APP_NAME=Todo App
NEXT_PUBLIC_APP_VERSION=0.1.0
```

**Where to get the URLs:**
- `NEXT_PUBLIC_API_URL`: After deploying to Hugging Face, copy your Space URL and add `/api/v1`
- `NEXT_PUBLIC_BETTER_AUTH_URL`: Your Vercel deployment URL (e.g., `https://my-todo-app.vercel.app`)

---

### 🔧 Backend (Hugging Face Spaces)

Set these in **Hugging Face Space** → Settings → Repository secrets:

```env
# Database (Get from Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Frontend URL (Your Vercel deployment URL - for CORS)
FRONTEND_URL=https://your-app.vercel.app

# Server Configuration
DEBUG=False
LOG_LEVEL=INFO
APP_PORT=7860

# Optional Authentication Secrets
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=60
```

**Where to get the URLs:**
- `DATABASE_URL`: From Neon dashboard → Connection Details → Copy connection string
- `FRONTEND_URL`: Your Vercel deployment URL (same as `NEXT_PUBLIC_BETTER_AUTH_URL`)

---

## 📊 Configuration Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  USER BROWSER                                               │
│                                                             │
│  Opens: https://your-app.vercel.app                         │
│         ↓                                                   │
│  Frontend reads: NEXT_PUBLIC_API_URL                        │
│         ↓                                                   │
│  Makes API calls to: https://your-space-name.hf.space/api/v1│
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  HUGGING FACE BACKEND                                       │
│                                                             │
│  Receives request from: https://your-app.vercel.app         │
│         ↓                                                   │
│  Checks FRONTEND_URL for CORS validation                    │
│         ↓                                                   │
│  If match → Process request                                │
│         ↓                                                   │
│  Connects to database using: DATABASE_URL                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  NEON POSTGRESQL                                            │
│                                                             │
│  Connection from: Hugging Face backend                      │
│  Using: DATABASE_URL with SSL                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Deployment Steps Summary

### 1️⃣ Set Up Database (5 minutes)
1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Add `?sslmode=require` at the end
5. Run migrations: `alembic upgrade head`

### 2️⃣ Deploy Backend (10 minutes)
1. Go to https://huggingface.co/spaces
2. Create new Space with Docker SDK
3. Upload backend files (or push via git)
4. Add secrets in Settings → Repository secrets
5. Wait for build (2-5 minutes)
6. Test: `curl https://your-space-name.hf.space/api/v1/health`

### 3️⃣ Deploy Frontend (5 minutes)
1. Push frontend to GitHub
2. Import to Vercel
3. Add environment variables in Settings
4. Deploy
5. Test: Open your Vercel URL

### 4️⃣ Connect Everything (2 minutes)
1. Update backend `FRONTEND_URL` with your Vercel URL
2. Update frontend `NEXT_PUBLIC_API_URL` with your HF Space URL
3. Redeploy both if needed

---

## 🔍 Testing Checklist

After deployment, test these:

- [ ] **Backend Health**: `curl https://your-space.hf.space/api/v1/health`
- [ ] **API Docs**: Open `https://your-space.hf.space/api/docs`
- [ ] **Frontend Loads**: Open `https://your-app.vercel.app`
- [ ] **CORS Works**: Frontend can call backend (check browser console)
- [ ] **Database Works**: Sign up → Creates user in database
- [ ] **Auth Works**: Login → Returns session
- [ ] **CRUD Works**: Create task → Appears in list
- [ ] **Real-time Updates**: Multiple actions work correctly

---

## 🐛 Common Issues

### Issue: Frontend can't connect to backend
**Fix**: Check CORS settings in backend
- Verify `FRONTEND_URL` secret in Hugging Face matches your Vercel URL exactly
- Ensure both URLs use HTTPS (not HTTP)

### Issue: Database connection fails
**Fix**: Check connection string
- Verify `?sslmode=require` is at the end
- Test connection locally first
- Check Neon database is not suspended

### Issue: 404 on API calls
**Fix**: Check API URL
- Ensure `NEXT_PUBLIC_API_URL` includes `/api/v1` at the end
- Example: `https://my-space.hf.space/api/v1` (note the `/api/v1`)

### Issue: Hugging Face Space sleeping
**Solution**: This is normal for free tier
- First request takes ~30 seconds to wake up
- Subsequent requests are fast
- Upgrade to paid plan for always-on

---

## 🎯 Final URLs Reference

After deployment, you'll have:

| Service | URL Format | Example |
|---------|------------|---------|
| **Frontend (Vercel)** | `https://[project-name].vercel.app` | `https://my-todo-app.vercel.app` |
| **Backend (HF)** | `https://[username]-[space-name].hf.space` | `https://johndoe-todo-backend.hf.space` |
| **API Docs** | `https://[backend-url]/api/docs` | `https://johndoe-todo-backend.hf.space/api/docs` |
| **Database (Neon)** | `postgresql://[host].neon.tech/[db]` | Internal connection string |

---

## 📝 Environment Variable Mapping

| Frontend Variable | Should Point To | Example |
|------------------|-----------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend Space + `/api/v1` | `https://user-space.hf.space/api/v1` |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Your Vercel URL | `https://my-app.vercel.app` |

| Backend Variable | Should Point To | Example |
|-----------------|-----------------|---------|
| `FRONTEND_URL` | Your Vercel URL | `https://my-app.vercel.app` |
| `DATABASE_URL` | Neon PostgreSQL | `postgresql://...neon.tech/db?sslmode=require` |

**Key Rule**: `FRONTEND_URL` (backend) must match `NEXT_PUBLIC_BETTER_AUTH_URL` (frontend)

---

## 🆘 Need Help?

1. **Backend Logs**: Hugging Face Space → Logs tab
2. **Frontend Logs**: Vercel → Deployments → Click deployment → View logs
3. **Database Logs**: Neon dashboard → Operations tab
4. **Browser Console**: F12 → Console tab (for frontend errors)

---

**Quick Deploy Command Summary**:

```bash
# Backend (Hugging Face)
git clone https://huggingface.co/spaces/YOUR-USERNAME/SPACE-NAME
cd SPACE-NAME
cp -r /path/to/backend/* .
git add .
git commit -m "Deploy backend"
git push

# Frontend (Vercel)
cd frontend/todo-app
vercel --prod
```

---

**Last Updated**: 2025-12-20
**Platform**: Vercel (Frontend) + Hugging Face Spaces (Backend) + Neon (Database)
