import os
import uuid
import shutil
from fastapi import UploadFile
from src.models.cv import InvalidFileTypeError, DocumentUploadError

UPLOAD_DIR: str = "temp"

def generate_file_id() -> str:
    return str(uuid.uuid4())

def save_upload_file(upload_file: UploadFile, destination: str) -> None:
    with open(destination, "wb") as buffer:
        upload_file.file.seek(0)
        shutil.copyfileobj(upload_file.file, buffer)

def validate_pdf_file(file: UploadFile) -> bool:
    """Validate that the uploaded file is a PDF.

    Strategy:
    1. Check the file header (magic bytes).
    2. Fall back to content_type if provided.
    3. Fall back to file extension.
    """
    
    try:
        file.file.seek(0)
        header = file.file.read(4)
    except Exception:
        header = b""
    finally:
        try:
            file.file.seek(0)
        except Exception:
            pass

    if header.startswith(b"%PDF"):
        return True

    if getattr(file, "content_type", None) == "application/pdf":
        return True

    if file.filename and file.filename.lower().endswith('.pdf'):
        return True

    return False

def upload_document(
    file: UploadFile,
) -> dict[str, any]:
    if not validate_pdf_file(file):
        raise InvalidFileTypeError()
    
    document_id = generate_file_id()
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"{document_id}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    try:
        save_upload_file(file, file_path)

    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise DocumentUploadError(f"Failed to upload document: {str(e)}")
    return {"id": document_id, "name": file_name}
