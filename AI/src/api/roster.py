import numpy as np
import dspy 
import string

from src.configs.mongodb import get_database
from src.config import settings
from src.agents.agent import configure_llm_roster
from src.agents.recommendation_agent.model import RecommendationModel

from bson import ObjectId
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from collections import defaultdict

class PositionRequest(BaseModel):
    name: str
    numOfRequest: int

class SkillRequest(BaseModel):
    description: str
    positions: List[PositionRequest]
    skills: Optional[List[str]]

class EmbeddingProjectRequest(BaseModel):
    project_id: str
    
def clean_skills_name(str):
    return str.lower().strip().translate(str.maketrans("", "", string.punctuation))
    
router = APIRouter()

@router.post("/project-embeddings")
async def create_project_embeddings(request: EmbeddingProjectRequest):
    database = get_database()

    embedder = dspy.Embedder(
      model=settings.EMBEDDING_MODEL, 
      api_base=settings.LLM_BASE_URL_ROSTER,
      api_key=settings.LLM_API_KEY
    )

    # Ngambil deskripsi task tiap2 user
    pipeline = [
      # Start from taskassignments
      {
          "$lookup": {
              "from": "tasks",
              "localField": "taskId",
              "foreignField": "_id",
              "as": "task"
          }
      },
      {"$unwind": "$task"},

      # Filter by this project
      {"$match": {"task.projectId": ObjectId(request.project_id)}},

      # Lookup user info
      {
          "$lookup": {
              "from": "users",
              "localField": "userId",
              "foreignField": "_id",
              "as": "user"
          }
      },
      {"$unwind": "$user"},

      # Completed or in progress task
      {"$match": {"task.status": { "$in": ["done", "in_progress"] }}},

      # Lookup project info
      {
          "$lookup": {
              "from": "projects",
              "localField": "task.projectId",
              "foreignField": "_id",
              "as": "project"
          }
      },
      {"$unwind": "$project"},

      # Only completed project
      {"$match": {"project.status": "completed"}},

      # Group by user
      {
          "$group": {
              "_id": "$user._id",
              "user_id": {"$first": "$user._id"},
              "user_name": {"$first": "$user.name"},
              "tasks": {"$addToSet": "$task.title"},
              "project_id": {"$first": "$project._id"},
              "project_name": {"$first": "$project.name"}
          }
      },

      # Group again by project
      {
          "$group": {
              "_id": "$project_id",
              "project_id": {"$first": "$project_id"},
              "project_name": {"$first": "$project_name"},
              "users": {
                  "$push": {
                      "user_id": "$user_id",
                      "user_name": "$user_name",
                      "tasks": "$tasks"
                  }
              }
          }
      },

      # Clean up output
      {
          "$project": {
              "_id": 0,
              "project_id": 1,
              "project_name": 1,
              "users": 1
          }
      }
    ]

    results = list(database.taskassignments.aggregate(pipeline))
    
    for project in results:
      for user in project["users"]:
        combinedTask = ", ".join(user["tasks"])

        try:
            embeddings = embedder(combinedTask)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Embedding generation failed: {e}")

        doc = {
            "user_id": user["user_id"],
            "project_id": project["project_id"],
            "description": combinedTask,
            "embeddings": embeddings.tolist(),
            "created_at": datetime.now(),
        }

        database.projectembeddings.insert_one(doc)

    return {
        "status": "success",
        "project_id": request.project_id
    }

@router.post("/roster-recommendations")
def get_recommendations(request: SkillRequest):
    database = get_database()
    user_collection = database.get_collection("users")
    
    # INIT: user request parameters
    project_description = request.description
    required_positions = request.positions
    position_names = [p.name for p in required_positions]
    required_skills = request.skills

    # MAIN
    scores = []
    for user in user_collection.find({"role": "staff"}):
        user_id = user.get("_id")
        position_id = user.get("position")
        position = database.get_collection("positions").find_one({"_id": position_id}, {"name": 1})
        position_name = position["name"] if position and position.get("name") else None

        # 1. matching skills, FURTHER IMPROVEMENT: maybe we can use AI to match some typo skills
        skill_ids = user.get("skills", [])
        skills = list(database.get_collection("skills").find({"_id": {"$in": skill_ids}}, {"name": 1}))
        user_skills = [clean_skills_name(skill["name"]) for skill in skills]

        matched_count = len(set(required_skills) & set(user_skills))
        total = len(set(required_skills))
        matched_count_score = matched_count / total

        # 2. workload counter
        project_pipeline = [
            {"$match": {"userId": user_id}},  # filter by user
            {
                "$lookup": {
                    "from": "projects",            # collection to join
                    "localField": "projectId",     # field in projectassignments
                    "foreignField": "_id",         # field in projects
                    "as": "project"                # output array field name
                }
            },
            {
            "$lookup": {
                "from": "positions",
                "localField": "user.positionId",
                "foreignField": "_id",
                "as": "position"
            }
            },
            {"$unwind": "$position"},

            # lookup the project
            {
                "$lookup": {
                    "from": "projects",
                    "localField": "projectId",
                    "foreignField": "_id",
                    "as": "project"
                }
            },
            {"$unwind": "$project"},

            # project active + position name in required list
            {
                "$match": {
                    "project.status": "active",
                    "position.name": {"$in": position_names}
                }
            },

            {
                "$project": {
                    "_id": 0,
                    "project": 1,
                    "user._id": 1,
                    "user.name": 1,
                    "position.name": 1
                }
            }
        ]

        project_assignments = list(database.get_collection("projectassignments").aggregate(project_pipeline))
        project_count = len(project_assignments)
        project_count_score = 1.0 if project_count == 0 else 1.0 / project_count

        # 3. Embedding vector
        embedder = dspy.Embedder(
            model=settings.EMBEDDING_MODEL, 
            api_base=settings.LLM_BASE_URL_ROSTER,
            api_key=settings.LLM_API_KEY
        )

        embeddings = embedder(project_description)

        # NOTE: projectembeddings stores task title, jadi nanti yang masuk database, deskripsinya itu joinan dari task title
        embeddings_collection = database.get_collection("projectembeddings")
        project_history_refs = list(embeddings_collection.find({"user_id": user_id}, {"project_id": 1, "embeddings": 1, "description": 1}))

        # 4. Calculate cosine similarity for each project
        def cosine_similarity(vec_a, vec_b): 
            a = np.array(vec_a)
            b = np.array(vec_b)
            return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

        similarities = []
        if len(project_history_refs) == 0:
            similarities.append(0)
        else:
            for history in project_history_refs:
                sim = cosine_similarity(embeddings, history["embeddings"])
                similarities.append(sim)

        # Ambil 3 similarity terbesar
        top_3 = sorted(similarities, reverse=True)[:3]
        top_3_avg = np.mean(top_3)

        # 5. Merge all the data
        result = {
            "name": user.get("name"),
            "position": position_name,
            "skills":  [skill["name"] for skill in skills],
            "skill_match": matched_count_score,
            "workload": project_count_score,
            "project_similarity": 0 if np.isnan(top_3_avg) else float(top_3_avg)
        }

        scores.append(result)

   
    # 5. sort by the overall scores then limit to a certain number (n_required * 2)
    for score in scores:
        score["matching_percentage"] = round(0.4 * score["skill_match"] + 0.3 * score["workload"] + 0.3 * score["project_similarity"], 2)
        score["skill_match"] = round(score["skill_match"], 2)
        score["workload"] = round(score["workload"], 2)
        score["project_similarity"] = round(score["project_similarity"], 2)
        
        print(score)
        print("-" * 25)

    # group by position
    grouped = defaultdict(list)
    for s in scores:
        grouped[s["position"]].append(s)

    required_map = {p.name: p.numOfRequest for p in required_positions}
    
    top_candidates = {}
    for position, candidates in grouped.items():
        if position not in required_map:
            continue  # skip posisi yang tidak dibutuhkan
        
        n = required_map[position]
        sorted_candidates = sorted(candidates, key=lambda x: x["matching_percentage"], reverse=True)
        top_candidates[position] = sorted_candidates[:n*2]

    print("top candidates")
    print(top_candidates)

    # 6. let the AI rerank the recommendations
    # ga pake dspy juga aman aja 👌
    configure_llm_roster()
    reranker = dspy.Predict(RecommendationModel)

    # berat ga yah :v
    # bagusnya sebenernya ga desimal sih di skor kandidatnya tapi later lah
    for position, candidates in top_candidates.items():
        response = reranker(
            project_description=project_description,
            candidates=candidates
        )

        indexes = response.ordered_indexes
        reasoning = response.reasoning

        # Safety fallback kalau model ngasih teks mentah
        if not isinstance(indexes, list):
            import re, json
            match = re.search(r"\[([0-9,\s]+)\]", str(indexes))
            if match:
                indexes = json.loads(f"[{match.group(1)}]")
            else:
                indexes = list(range(len(top_candidates[position])))

        # Terapkan urutan ke kandidat
        ordered = [top_candidates[position][i] for i in indexes]

        # Tambahkan rank number
        for idx, c in enumerate(ordered, start=1):
            c["rank"] = idx
            c["ai_thought"] = reasoning

        top_candidates[position] = ordered
    
    print("-" * 25)
    print("final top candidates")
    print(top_candidates)

    return JSONResponse(content={"success": True, "data": top_candidates}, status_code=200)