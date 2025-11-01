# AI Service

This directory contains the AI service for the DevAlign project.

## Setup

**Environment Variables**:
    Create a `.env` file in this directory by copying `.env.example`:    
    ```bash
    cp .env.example .env
    ```
    Then, fill in the necessary values for the following variables in the newly created `.env` file:
    -   `LLM_MODEL_CV`: Specify the LLM model for CV processing.
    -   `LLM_BASE_URL_CV`: Base URL for the CV processing LLM.
    -   `EMBEDDING_MODEL`: Specify the embedding model to be used.
    -   `LLM_BASE_URL_ROSTER`: Base URL for the roster processing LLM.
    -   `LLM_API_KEY`: API key for accessing the LLM services.
    -   `MONGO_URI`: Connection string for the MongoDB database.

## Makefile Commands

The following `make` commands are available to manage the AI service:

-   `make dev`:
    Runs the Uvicorn development server with auto-reload. This is suitable for local development.
    ```bash
    make dev
    ```

-   `make build`:
    Builds the Docker image for the AI service. The image will be tagged as `ai-be:v1`.
    ```bash
    make build
    ```

-   `make run`:
    Runs the Docker container for the AI service. It maps port `8000` from the container to port `8000` on the host. The container will be removed automatically when it exits (`--rm`).
    ```bash
    make run
    ```

-   `make stop`:
    Stops any running Docker containers based on the `ai-be:v1` image.
    ```bash
    make stop
    ```

-   `make clean`:
    Removes stopped Docker containers and the `ai-be:v1` Docker image.
    ```bash
    make clean
    ```
