# AI Service

This service is a crucial component of the DevAlign project, designed to streamline and enhance the software development lifecycle. It provides intelligent features for project management, including automated roster generation, CV analysis, and personalized recommendations. By leveraging advanced AI models, this service helps optimize team composition, improve project planning, and align development tasks with the most suitable talent.

This directory contains the AI service for the DevAlign project.

## Setup

**Environment Variables**:
Create a `.env` file in this directory by copying `.env.example`:  
 `bash
    cp .env.example .env
    `
Then, fill in the necessary values for the following variables in the newly created `.env` file: - `LLM_MODEL_CV`: Specify the LLM model for CV processing. - `LLM_BASE_URL_CV`: Base URL for the CV processing LLM. - `EMBEDDING_MODEL`: Specify the embedding model to be used. - `LLM_BASE_URL_ROSTER`: Base URL for the roster processing LLM. - `LLM_API_KEY`: API key for accessing the LLM services. - `MONGO_URI`: Connection string for the MongoDB database.

## run without docker
source venv/Scripts/activate

uvicorn src.main:app --reload

## Makefile Commands

The following `make` commands are available to manage the AI service:

- `make build`:
  Builds the Docker image for the AI service. The image will be tagged as `ai-be:v1`.

  ```bash
  make build
  ```

- `make run`:
  Runs the Docker container for the AI service. It maps port `8000` from the container to port `8000` on the host. The container will be removed automatically when it exits (`--rm`).

  ```bash
  make run
  ```

- `make stop`:
  Stops any running Docker containers based on the `ai-be:v1` image.

  ```bash
  make stop
  ```

- `make clean`:
  Removes stopped Docker containers and the `ai-be:v1` Docker image.
  ```bash
  make clean
  ```

## API Documentation

To learn more about the API, you can access the documentation by running the application and navigating to the following endpoints:

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

Alternatively, you can view the OpenAPI specification in the `openapi.json` file.

## Project Structure

Here is an overview of the important files and directories in the project:

- `src/`
  - `main.py`: The entry point of the application.
  - `api/`: Contains the API endpoints for the different services.
  - `agents/`: Contains the AI agents for different tasks.
  - `configs/`: Contains the configuration files for the application.
  - `models/`: Contains the data models for the application.
  - `services/`: Contains the business logic for the application.
  - `utils/`: Contains utility functions.
- `Dockerfile`: The Dockerfile for building the Docker image.
- `requirements.txt`: The list of Python dependencies.
- `Makefile`: The Makefile for managing the AI service.
- `openapi.json`: The OpenAPI specification for the API.
