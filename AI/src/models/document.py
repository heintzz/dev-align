from pydantic import BaseModel
from fastapi import HTTPException

class DocumentUploadResponse(BaseModel):
    id: str
    name: str
    message: str = "Document uploaded successfully"

class InvalidFileTypeError(HTTPException):
    def __init__(self, detail: str = "Invalid file type. Only PDF files are allowed"):
        super().__init__(status_code=400, detail=detail)

class DocumentUploadError(HTTPException):
    def __init__(self, detail: str = "Failed to upload document"):
        super().__init__(status_code=500, detail=detail)

class CVData(BaseModel):
    name: str
    email: str
    phoneNumber: str
    description: str
    skills: list[str]

class CVResponse(BaseModel):
    success: bool
    message: str
    data: CVData

