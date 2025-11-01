import dspy

from typing import List
from pydantic import BaseModel

class CandidateModel(BaseModel):
    """Model to represent a candidate with relevant metrics."""
    name: str
    position: str
    skills: List[str]
    skill_match: float
    workload: float
    project_similarity: float
    matching_percentage: float

class RecommendationModel(dspy.Signature):
    """
    You are an AI recruitment assistant.
    Your task is to rank candidates for the position "{position}"
    based on their fit for this project.
    """

    project_description: str = dspy.InputField(desc="The project description, including goals and required skills.")
    candidates: List[CandidateModel] = dspy.InputField(desc="Top candidates filtered by initial matching metrics.")

    ordered_indexes: List[int] = dspy.OutputField(desc="A list of integers representing the ranking order of candidates.")
    reasoning: str = dspy.OutputField(desc="A short reasoning explaining the ranking order and top choices.")
