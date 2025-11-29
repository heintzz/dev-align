from src.configs.mongodb import connect_to_mongo, close_mongo_connection
from src.api import cv, roster
from src.models.main import RootResponse, HealthCheckResponse
from fastapi import FastAPI, APIRouter

from fastapi.middleware.cors import CORSMiddleware

import uvicorn

app = FastAPI()
router = APIRouter()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    close_mongo_connection()

@router.get("/", response_model=RootResponse)
def root():
    return {"message": "Welcome to the DevAlign AI!"}

@router.get("/health", response_model=HealthCheckResponse)
def health_check():
    return {"status": "ok", "message": "Service is healthy"}

app.include_router(router)
app.include_router(cv.router)
app.include_router(roster.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)



