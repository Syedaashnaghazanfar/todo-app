# Quickstart: Todo App UI Redesign

## Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.11+ with pip
- Git

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd todo-app
```

### 2. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies
```bash
cd frontend/todo-app
npm install
```

### 4. Set up Environment Variables
Create `.env` file in the backend directory with:
```
DATABASE_URL=your_database_url
SECRET_KEY=your_secret_key
```

### 5. Run the Development Servers

Backend:
```bash
cd backend
python main.py
```

Frontend:
```bash
cd frontend/todo-app
npm run dev
```

## Running Tests
Backend tests:
```bash
cd backend
pytest
```

Frontend tests:
```bash
cd frontend/todo-app
npm run test
```

## Key Files for UI Redesign
- `frontend/todo-app/app/globals.css` - Global styles and CSS variables
- `frontend/todo-app/hooks/useTheme.ts` - Theme toggle functionality
- `frontend/todo-app/components/shared/Card.tsx` - Glassmorphism card component
- `frontend/todo-app/components/shared/Button.tsx` - Neon-styled buttons
- `frontend/todo-app/lib/utils.ts` - Utility functions for styling

## Running the Redesigned UI
1. Ensure both backend and frontend servers are running
2. Open browser to `http://localhost:3000`
3. The redesigned UI with cyberpunk neon elegance theme will be visible
4. Use the theme toggle in the header to switch between light/dark modes