# Full-Stack Todo App 📝

A modern, production-ready todo application built with React, Next.js, and FastAPI. Features a beautiful purple-themed UI, real-time task management, analytics dashboard, and complete task history tracking.

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- **Task Management**: Create, edit, complete, and delete tasks with inline editing
- **Analytics Dashboard**: Visualize your productivity with interactive charts
- **Task History**: Track all task operations with detailed timeline
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

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL (Neon)
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Testing**: pytest (40+ tests)
- **Validation**: Pydantic

## 📁 Project Structure

```
full-stack-todo-app/
├── frontend/todo-app/       # Next.js frontend application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── hooks/               # Custom hooks
│   └── services/            # API client
├── backend/                 # FastAPI backend
│   ├── src/                 # Source code
│   │   ├── api/            # API endpoints
│   │   ├── models/         # Database models
│   │   └── services/       # Business logic
│   └── tests/              # Test suite
└── specs/                   # Feature specifications
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

### Deploy Frontend to Vercel

1. Import repository at [vercel.com](https://vercel.com)
2. Set root directory: `frontend/todo-app`
3. Add environment variable:
   ```
   NEXT_PUBLIC_API_URL=<your-backend-url>
   ```
4. Deploy!

See [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) for detailed instructions.

### Deploy Backend

Backend can be deployed to:
- Railway
- Render
- Heroku
- Any platform supporting Python

Don't forget to set up your PostgreSQL database and update `DATABASE_URL`.

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

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Live Demo**: [Coming Soon]

**Made with ❤️ using Claude Code**
