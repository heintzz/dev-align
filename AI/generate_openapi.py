
import json
from src.main import app

def generate_openapi_spec():
    with open("openapi.json", "w") as f:
        json.dump(app.openapi(), f, indent=2)

if __name__ == "__main__":
    generate_openapi_spec()
