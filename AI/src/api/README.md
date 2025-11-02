# API Documentation

This document provides a step-by-step description of the CV and Roster APIs.

# CV API

This API is responsible for parsing CV documents and extracting structured data.

## Endpoints

### 1. `POST /cv/extract-data`

This endpoint parses a CV document and returns structured data. It accepts a file upload.

**Request:**

The request should be a `multipart/form-data` request with a file attached.

**Step-by-step Description:**

1.  **Configure LLM**: The endpoint configures the language model using the `configure_llm` function.

2.  **Upload and Save File**: The uploaded CV file is saved to the server using the `upload_document` function. This function also validates that the file is a PDF.

3.  **Extract Text**: The text content is extracted from the PDF file using the `extract_text_from_pdf` utility function.

4.  **Parse CV**: The `CVParserAgent` is used to parse the extracted text. This agent uses a language model to extract structured data from the CV text, such as the candidate's name, email, skills, etc.

5.  **Response**: The endpoint returns a JSON response containing the extracted data from the CV.

# Roster API

This document provides a step-by-step description of the Roster API, which is responsible for managing project embeddings and providing roster recommendations.

## Endpoints

### 1. `POST /project-embeddings`

This endpoint generates and stores embeddings for a given project. The embeddings are created based on the tasks performed by users who have worked on the project.

**Request Body:**

```json
{
  "project_id": "string"
}
```

**Step-by-step Description:**

1.  **Get Database and Embedder**: The endpoint initializes a connection to the MongoDB database and sets up the `dspy.Embedder` with the configured embedding model.

2.  **Aggregation Pipeline**: It uses a MongoDB aggregation pipeline to gather information about the tasks performed by each user in the specified project.

    - It looks up tasks from the `tasks` collection.
    - It filters tasks to include only those belonging to the specified `project_id`.
    - It looks up user information from the `users` collection.
    - It filters tasks to include only those with a status of `done` or `in_progress`.
    - It looks up project information from the `projects` collection.
    - It filters projects to include only those with a status of `completed`.
    - It groups the tasks by user, creating a list of task titles for each user.
    - It groups the results again by project.

3.  **Generate and Store Embeddings**: For each user in the project, the endpoint:

    - Combines the user's task titles into a single string.
    - Generates embeddings for the combined task string using the `dspy.Embedder`.
    - Creates a document containing the `user_id`, `project_id`, the combined task `description`, the `embeddings`, and a `created_at` timestamp.
    - Inserts this document into the `projectembeddings` collection in the database.

4.  **Response**: The endpoint returns a success message along with the `project_id`.

### 2. `POST /roster-recommendations`

This endpoint provides a list of recommended users for a new project based on a set of required skills and positions.

**Request Body:**

```json
{
  "description": "string",
  "positions": [
    {
      "name": "string",
      "numOfRequest": "int"
    }
  ],
  "skills": ["string"]
}
```

**Step-by-step Description:**

1.  **Initialization**: The endpoint initializes a connection to the database and retrieves the user collection. It also extracts the project description, required positions, and required skills from the request body.

2.  **Iterate Through Users**: The endpoint iterates through all users with the role of "staff". For each user, it calculates a set of scores:

    - **Skill Match Score**: It compares the user's skills with the required skills for the project. The score is the ratio of matched skills to the total number of required skills.

    - **Workload Score**: It calculates the user's current workload by counting the number of active projects they are assigned to in a relevant position. The score is inversely proportional to the number of active projects.

    - **Project Similarity Score**: It calculates the cosine similarity between the new project's description and the user's past projects.
      - It first generates an embedding for the new project's description.
      - It then retrieves the embeddings of the user's past projects from the `projectembeddings` collection.
      - It calculates the cosine similarity between the new project's embedding and each of the user's past project embeddings.
      - The final similarity score is the average of the top 3 similarity scores.

3.  **Calculate Total Score**: For each user, a `total_score` is calculated as a weighted average of the `skill_match`, `workload`, and `project_similarity` scores.

4.  **Group and Rank Candidates**: The users are grouped by their position. Within each position, the candidates are sorted in descending order based on their `total_score`.

5.  **Select Top Candidates**: For each required position, the endpoint selects the top `n * 2` candidates, where `n` is the number of requested people for that position.

6.  **Response**: The endpoint returns a JSON response containing the top candidates for each position. (Note: The current implementation has a placeholder response and the final ranking by AI is not yet implemented).
