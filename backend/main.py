import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.db.session import engine, Base
from backend.services.alert_engine import ws_manager
from backend.services.evidence import EVIDENCE_DIR

# Routers
from backend.api.centres import router as centres_router
from backend.api.cameras import router as cameras_router
from backend.api.attendance import router as attendance_router
from backend.api.ai_ingest import router as ai_ingest_router
from backend.api.alerts import router as alerts_router
from backend.api.reports import router as reports_router
from backend.api.demo import router as demo_router
from backend.api.settings import router as settings_router

# Initialize tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Based Real-Time Monitoring API (MSDE Problem 26245)",
    version="1.0.0",
    description="Privacy-Preserving, Low-Bandwidth Edge AI Monitoring Platform for Skill Development Training Centres"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount evidence snapshots & video storage
os.makedirs(EVIDENCE_DIR, exist_ok=True)
os.makedirs("datasets", exist_ok=True)
app.mount("/api/evidence", StaticFiles(directory=EVIDENCE_DIR), name="evidence")
app.mount("/api/videos", StaticFiles(directory="datasets"), name="videos")

# Include Routers
app.include_router(centres_router)
app.include_router(cameras_router)
app.include_router(attendance_router)
app.include_router(ai_ingest_router)
app.include_router(alerts_router)
app.include_router(reports_router)
app.include_router(demo_router)
app.include_router(settings_router)

@app.get("/")
def root():
    return {
        "status": "healthy",
        "service": "AI Training Centre Monitoring API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; accept any client pings
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
