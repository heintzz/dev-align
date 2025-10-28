import os
from typing import Union
from fastapi import APIRouter, UploadFile, HTTPException
from src.models.cv import DocumentUploadResponse, InvalidFileTypeError
from src.services.extractor import upload_document
from src.agents.agent import configure_dspy
from src.agents.parser_agent.parser import CVParserAgent
from src.utils.util import extract_text_from_pdf
import tempfile

router = APIRouter()

# @router.post("/upload", response_model=DocumentUploadResponse)
# def upload_document_endpoint(
#     file: Union[UploadFile, str]
# ):
#     """Upload a single CV document. Accepts an UploadFile (production) or a local path (for tests)."""
#     try:
#         if isinstance(file, str):
#             # support passing a local path for testing
#             with open(file, "rb") as local_file:
#                 temp_upload_file = UploadFile(filename=os.path.basename(file), file=local_file)
#                 document_data = upload_document(file=temp_upload_file)
#         else:
#             document_data = upload_document(file=file)

#         return DocumentUploadResponse(**document_data)

#     except InvalidFileTypeError:
#         raise
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@router.post("/parse")
def parse_document_endpoint(file: Union[UploadFile, str]):
    """Parse a CV document and return structured data. Accepts an UploadFile (production) or a local path (for tests)."""
    tmp_path = None
    try:
        configure_dspy()

        if isinstance(file, str):
            if not os.path.exists(file):
                raise HTTPException(status_code=400, detail="Local file path does not exist")
            path = file
        else:
            # Save uploaded file to a temporary file so extract_text_from_pdf can read it from disk
            file.file.seek(0)
            contents = file.file.read()
            suffix = os.path.splitext(file.filename)[1] or ".pdf"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
                tmp.write(contents)
                tmp_path = tmp.name
            path = tmp_path

        cv_text = extract_text_from_pdf(path)
        if not cv_text or not cv_text.strip():
            raise HTTPException(status_code=400, detail="No text extracted from CV document")

        cv_parser = CVParserAgent()
        cv_data = cv_parser(cv_text)

        if isinstance(cv_data, dict) and "error" in cv_data:
            raise HTTPException(status_code=500, detail=f"Failed to parse CV: {cv_data['error']}")

        return cv_data

    except InvalidFileTypeError:
        raise
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass