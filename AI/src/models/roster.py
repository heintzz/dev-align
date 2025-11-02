from pydantic import BaseModel
from typing import List, Dict

class ProjectEmbeddingsResponse(BaseModel):
    status: str
    project_id: str

class Candidate(BaseModel):
    name: str
    position: str
    skills: List[str]
    skillMatch: float
    currentWorkload: float
    projectSimilarity: float
    matchingPercentage: float
    rank: int
    reason: str

class RosterRecommendationsResponse(BaseModel):
    success: bool
    data: Dict[str, List[Candidate]]
