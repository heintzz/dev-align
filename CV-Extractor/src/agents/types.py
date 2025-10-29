from pydantic import BaseModel, Field
from typing import List, Optional

class CVData(BaseModel):
    name: str = Field(description="Full name of the candidate")
    email: str = Field(description="Email address")
    phoneNumber: Optional[str] = Field(default=None, description="Contact phone number")
    description: Optional[str] = Field(default=None, description="Professional summary or objective")
    skills: List[str] = Field(default_factory=list, description="List of skills")