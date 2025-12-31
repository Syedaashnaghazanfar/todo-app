# main.py
from fastapi import FastAPI, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from chatkit.router import handle_event
from chatkit.upload import handle_upload

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chatkit/api")
async def chatkit_api(request: Request):
    # You can plug in your own auth here (JWT/session/etc.)
    event = await request.json()
    return await handle_event(event)

@app.post("/chatkit/api/upload")
async def chatkit_upload(file: UploadFile):
    return await handle_upload(file)
