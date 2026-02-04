cd "D:\code\Q4\hackathon-2\todo-app\phase-3\backend\src"
$env:PYTHONPATH = "src"
& "D:\code\Q4\hackathon-2\todo-app\phase-3\backend\.venv\Scripts\python.exe" -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
