from src.configs.mongodb import connect_to_mongo, close_mongo_connection
from src.api import cv, roster
from fastapi import FastAPI, APIRouter

from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

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

@router.get("/")
def root():
    return {"message": "Welcome to the main API!"}

@router.get("/health")
def health_check():
    return JSONResponse(content={"status": "ok", "message": "Service is healthy"}, status_code=200)

app.include_router(router)
app.include_router(cv.router)
app.include_router(roster.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)



