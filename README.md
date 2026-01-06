# Full-Stack Todo App 📝

A modern, production-ready todo application built with React, Next.js, and FastAPI. Features a beautiful purple-themed UI, real-time task management, analytics dashboard, complete task history tracking, **AI-powered ChatKit assistant**, and **cloud-native Kubernetes deployment**.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![Kubernetes](https://img.shields.io/badge/Kubernetes-ready-blue)
![Docker](https://img.shields.io/badge/Docker-optimized-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎯 Project Phases

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1** | ✅ Complete | Frontend UI with React 19 + Next.js 16 |
| **Phase 2** | ✅ Complete | Backend API with FastAPI + PostgreSQL |
| **Phase 3** | ✅ Complete | AI ChatKit Integration (OpenAI Agents SDK) |
| **Phase 4** | ✅ **Complete** | **Cloud Native Deployment (Kubernetes + Minikube)** |
| **Phase 5** | 🚧 Planned | Production Cloud Deployment (AWS EKS / GCP GKE / Azure AKS) |

## ✨ Features

- **Task Management**: Create, edit, complete, and delete tasks with inline editing
- **AI ChatKit Assistant**: Natural language task management powered by OpenAI Agents SDK
- **Analytics Dashboard**: Visualize your productivity with interactive charts
- **Task History**: Track all task operations with detailed timeline
- **Authentication**: Secure user authentication with Better Auth + JWT
- **Cloud Native**: Containerized with Docker, deployed on Kubernetes
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark Mode**: Eye-friendly dark theme support
- **Real-time Updates**: Instant UI updates with optimistic rendering
- **Beautiful UI**: Modern purple gradient theme with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (for frontend)
- Python 3.8+ (for backend)
- PostgreSQL database (we use Neon)

### Frontend Setup

```bash
cd frontend/todo-app
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

### Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL

# Run migrations
alembic upgrade head

# Start server
python main.py
```

Backend runs on `http://localhost:8000`

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 4
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Notifications**: SweetAlert2
- **Auth**: Better Auth with JWT

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL (Neon)
- **ORM**: SQLModel
- **Migrations**: Alembic
- **Testing**: pytest (40+ tests)
- **Validation**: Pydantic
- **AI**: OpenAI Agents SDK with ChatKit
- **LLM Providers**: OpenAI, Gemini, Groq, OpenRouter

### Cloud Native (Phase 4)
- **Containerization**: Docker (multi-stage builds)
- **Orchestration**: Kubernetes
- **Package Manager**: Helm
- **Local Development**: Minikube
- **Image Sizes**: Backend 490MB, Frontend 297MB
- **Security**: Non-root containers (UID 10001 backend, UID 1001 frontend)

## 📁 Project Structure

```
todo-app/
├── phase-3/                    # Current application code
│   ├── frontend/todo-app/     # Next.js frontend application
│   │   ├── app/               # App router pages
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom hooks
│   │   └── lib/               # Auth & utilities
│   └── backend/               # FastAPI backend
│       ├── src/               # Source code
│       │   ├── api/          # API endpoints
│       │   ├── models/       # Database models
│       │   └── services/     # Business logic
│       ├── mcp_server/       # MCP tools for AI
│       └── tests/            # Test suite
├── phase-4/                   # Cloud-native deployment (NEW!)
│   ├── backend/              # Backend Dockerfile
│   ├── frontend/todo-app/    # Frontend Dockerfile
│   ├── helm/todo-app/        # Helm chart
│   │   ├── templates/        # Kubernetes manifests
│   │   └── values.yaml       # Configuration
│   ├── scripts/              # Automation scripts
│   └── docs/                 # Deployment documentation
└── specs/                     # Feature specifications
```

## 📱 Pages

- **Homepage** (`/`) - Hero section with quick actions
- **Tasks** (`/tasks`) - Task management with CRUD operations
- **Analytics** (`/analytics`) - Charts and statistics
- **History** (`/history`) - Task operation timeline
- **Task Detail** (`/tasks/[id]`) - Individual task view

## 🔌 API Endpoints

- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks` - List all tasks
- `GET /api/v1/tasks/{id}` - Get single task
- `PUT /api/v1/tasks/{id}` - Update task
- `PATCH /api/v1/tasks/{id}/complete` - Mark complete
- `PATCH /api/v1/tasks/{id}/incomplete` - Mark incomplete
- `DELETE /api/v1/tasks/{id}` - Delete task
- `GET /api/v1/history` - Get task history
- `GET /api/v1/stats/weekly` - Get weekly statistics

## 🚢 Deployment

### Phase 4: Kubernetes (Local Minikube) ✅ **CURRENT**

**Prerequisites:**
- Docker Desktop
- Minikube v1.31+
- kubectl v1.25+
- Helm v3.10+

**Quick Start:**
```bash
# Start Minikube with Ingress
minikube start
minikube addons enable ingress

# Build Docker images
cd phase-4
./scripts/build-images.sh

# Load images to Minikube
minikube image load todo-backend:latest
minikube image load todo-frontend:latest

# Create secrets (replace with your values)
kubectl create secret generic todo-secrets \
  --from-literal=DATABASE_URL='<your-neon-db-url>' \
  --from-literal=OPENAI_API_KEY='<your-openai-key>' \
  --from-literal=BETTER_AUTH_SECRET='<your-secret>' \
  --from-literal=JWT_SECRET='<your-jwt-secret>' \
  --from-literal=GROQ_API_KEY='<your-groq-key>' \
  --from-literal=BETTERAUTH_DATABASE_URL='<your-db-url>'

# Deploy with Helm
helm install todo-app ./helm/todo-app

# Access the application (in separate terminals)
minikube tunnel  # Keep running
kubectl port-forward svc/todo-frontend 3000:3000
kubectl port-forward svc/todo-backend 8000:8000

# Open http://localhost:3000
```

**Deployment Features:**
- ✅ Multi-stage Docker builds (optimized image sizes)
- ✅ Non-root containers (secure by default)
- ✅ Health checks and liveness probes
- ✅ ConfigMap for 17 environment variables
- ✅ Secrets for 6 sensitive credentials
- ✅ Helm chart for easy deployment
- ✅ All 4 pods running (2 backend + 2 frontend)

**Documentation:**
- [ACCESS-METHODS.md](phase-4/docs/ACCESS-METHODS.md) - Port-forward vs Ingress access
- [tasks.md](specs/011-cloud-native-deployment/tasks.md) - Complete task list

### Phase 5: Production Cloud (Coming Soon) 🚧

Deploy to real cloud platforms:
- AWS EKS (Elastic Kubernetes Service)
- GCP GKE (Google Kubernetes Engine)
- Azure AKS (Azure Kubernetes Service)

Features will include:
- Real domain names with SSL/TLS
- Production-grade Ingress with load balancing
- Auto-scaling (HPA)
- Multi-environment management (dev/staging/prod)

### Traditional Deployment Options

**Frontend (Vercel):**
1. Import repository at [vercel.com](https://vercel.com)
2. Set root directory: `phase-3/frontend/todo-app`
3. Add environment variables
4. Deploy!

**Backend (Railway/Render/Heroku):**
- Any platform supporting Python 3.11+
- Set DATABASE_URL and other environment variables
- Deploy from `phase-3/backend/`

## 🧪 Testing

### Frontend Tests
```bash
cd frontend/todo-app
npm test
```

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

## 📊 Features Breakdown

### Task Management
- ✅ Inline editing - Edit tasks without leaving the page
- ✅ Quick toggle - Mark complete/incomplete with one click
- ✅ Drag to reorder (future feature)

### Analytics
- 📊 Weekly activity bar chart (green for completed, orange for incomplete)
- 🥧 Completion status pie chart
- 📈 Metric cards showing stats
- ⏱️ Activity timeline

### Design
- 🎨 Purple gradient theme throughout
- 🌙 Dark mode support
- 📱 Fully responsive
- ✨ Smooth animations with Framer Motion

## 🔒 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=Todo App
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:port/database
APP_PORT=8000
FRONTEND_URL=http://localhost:3000
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Claude Code](https://claude.com/claude-code)
- Designed with [TailwindCSS](https://tailwindcss.com)
- Charts by [Recharts](https://recharts.org)

## 🎉 Phase 4 Achievements (Latest)

**Cloud-Native Deployment Complete! ✅**

- ✅ **Containerization**: Multi-stage Dockerfiles for backend (490MB) and frontend (297MB)
- ✅ **Security**: Non-root containers (backend UID 10001, frontend UID 1001)
- ✅ **Kubernetes**: Full Helm chart with deployments, services, ConfigMap, Secret, and Ingress
- ✅ **Environment Management**: 23 environment variables (6 secrets + 17 config)
- ✅ **Health Checks**: Liveness and readiness probes for all pods
- ✅ **Local Development**: Minikube deployment with port-forward access
- ✅ **Documentation**: Complete ACCESS-METHODS.md with both access approaches
- ✅ **All Features Working**: Signup, login, tasks, ChatKit AI - fully tested!

**Next Up: Phase 5 - Production Cloud Deployment** 🚀

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Project Status**: Phase 4 Complete ✅ | Production-ready Kubernetes deployment on Minikube

**Made with ❤️ using Claude Code**
