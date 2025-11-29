from pydantic import BaseModel, Field
from typing import List, Dict
from bson import ObjectId

class ProjectEmbeddingsResponse(BaseModel):
    status: str
    project_id: str

class ManagerModel(BaseModel):
    id: str = Field(alias="_id")
    name: str
    
class Candidate(BaseModel):
    id: str = Field(alias="_id")
    name: str
    position: str
    skills: List[str]
    skillMatch: float
    currentWorkload: float
    projectSimilarity: float
    matchingPercentage: float
    manager: ManagerModel
    rank: int
    reason: str

class RosterRecommendationsResponse(BaseModel):
    success: bool
    data: Dict[str, List[Candidate]]
