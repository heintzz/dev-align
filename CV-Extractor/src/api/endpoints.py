import os
from typing import Union
from fastapi import APIRouter, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from src.config import settings
from src.models.document import InvalidFileTypeError
from src.services.extractor import upload_document
from src.agents.agent import configure_dspy
from src.agents.parser_agent.parser import CVParserAgent
from src.utils.util import extract_text_from_pdf


router = APIRouter()
cv_router = APIRouter(prefix="/cv")

@router.get("/")
def root():
    return {"message": "Welcome to the main API!"}

@router.get("/health")
def health_check():
    return JSONResponse(content={"status": "ok", "message": "Service is healthy"}, status_code=200)

@cv_router.post("/extract-data")
def parse_document_endpoint(file: Union[UploadFile, str]):
    """Parse a CV document and return structured data. Accepts an UploadFile (production) or a local path (for tests)."""
    
    try:
        configure_dspy()
       
        if isinstance(file, str):
            if not os.path.exists(file):
                raise HTTPException(status_code=400, detail="Local file path does not exist")
            path = file
            uploaded_file = {"id": None}
        else:
            uploaded_file = upload_document(file)
            path = os.path.join(settings.UPLOAD_DIR, uploaded_file["name"])

        cv_text = extract_text_from_pdf(path)
        if not cv_text or not cv_text.strip():
            raise HTTPException(status_code=400, detail="No text extracted from CV document")

        cv_parser = CVParserAgent()
        cv_data = cv_parser(cv_text)
        
        if isinstance(cv_data, dict) and "error" in cv_data:
            raise HTTPException(status_code=500, detail=f"Failed to parse CV: {cv_data['error']}")

        return JSONResponse(content={"success": True, "message": "CV has been extracted successfully", "data": cv_data})

    except InvalidFileTypeError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

            