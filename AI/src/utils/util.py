from functools import wraps
import time
import pypdfium2

def retry_on_error(max_retries=3, delay=1):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    print(f"Attempt {attempt + 1}/{max_retries} failed: {str(e)}")
                    if attempt < max_retries - 1:
                        sleep_time = delay * (2 ** attempt)  # Exponential backoff
                        print(f"Retrying in {sleep_time} seconds...")
                        time.sleep(sleep_time)
                    else:
                        print(f"All {max_retries} attempts failed")
            
            raise last_exception
        return wrapper
    return decorator

def extract_text_from_pdf(pdf_path: str) -> str:
    try:
        pdf = pypdfium2.PdfDocument(pdf_path)
        
        text = ""
        for page in pdf:
            text += page.get_textpage().get_text_bounded()
        
        pdf.close()
        
        return text
    except Exception as e:
        raise Exception(f"Failed to extract text from PDF: {str(e)}")