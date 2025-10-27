import os
from typing import Union
from fastapi import APIRouter, UploadFile, HTTPException
from src.models.cv import DocumentUploadResponse, InvalidFileTypeError
from src.services.extractor import upload_document

router = APIRouter()

@router.post("/upload", response_model=DocumentUploadResponse)
def upload_document_endpoint(
    file: Union[UploadFile, str]
):
    """Upload a single CV document. Accepts an UploadFile (production) or a local path (for tests)."""
    try:
        if isinstance(file, str):
            # support passing a local path for testing
            with open(file, "rb") as local_file:
                temp_upload_file = UploadFile(filename=os.path.basename(file), file=local_file)
                document_data = upload_document(file=temp_upload_file)
        else:
            document_data = upload_document(file=file)

        return DocumentUploadResponse(**document_data)

    except InvalidFileTypeError:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
