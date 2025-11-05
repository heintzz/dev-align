from pydantic import BaseModel, field_validator
from typing import List, Dict
from bson import ObjectId

class ProjectEmbeddingsResponse(BaseModel):
    status: str
    project_id: str

class Candidate(BaseModel):
    _id: str
    name: str
    position: str
    skills: List[str]
    skillMatch: float
    currentWorkload: float
    projectSimilarity: float
    matchingPercentage: float
    rank: int
    reason: str

    @field_validator('_id', mode='before')
    def convert_objectId(cls, v):
        if isinstance(v, ObjectId):
            return str(v)
        return v

class RosterRecommendationsResponse(BaseModel):
    success: bool
    data: Dict[str, List[Candidate]]
