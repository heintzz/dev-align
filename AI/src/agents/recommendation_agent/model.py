import dspy

from typing import List
from pydantic import BaseModel, Field

class CandidateModel(BaseModel):
    """Model to represent a candidate with relevant metrics."""
    id: str = Field(alias="_id")
    name: str
    position: str
    skills: List[str]
    skillMatch: float
    currentWorkload: float
    projectSimilarity: float
    matchingPercentage: float
    managerId: str

class SkillModel(BaseModel):
    position: str
    skills: List[str]

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

class ClassifySkillModel(dspy.Signature):
    """
    You are a skill classifier. Your task is to assign relevant skills to each position 
    in a project. Skills can overlap across multiple positions. The goal is to fairly group skills by position, so each employee is only compared 
    to skills that are relevant to their role — even if some skills are shared among positions
    """
    positions: List[str] = dspy.InputField(desc="List of required positions in the projec")
    skills: List[str] = dspy.InputField(desc="A complete list of all skills required in the project")

    grouped_skills: List[SkillModel] = dspy.OutputField(desc="A mapping of position to its relevant skills")