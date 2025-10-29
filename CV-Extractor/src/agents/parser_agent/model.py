import dspy
from typing import List, Optional

class CVStructuredModel(dspy.Signature):
    """You are a CV parser agent that extracts structured data from CV text.
    Parse a CV into structured data including name, phoneNumber, email, description, and skills"""
    cv_text: str = dspy.InputField(desc="The raw text extracted from a CV")

    name: Optional[str] = dspy.OutputField(desc="Full name of the candidate (or None)")
    phoneNumber: Optional[str] = dspy.OutputField(desc="Contact phone number if available")
    email: Optional[str] = dspy.OutputField(desc="Email address if available")
    description: Optional[str] = dspy.OutputField(desc="Professional summary or objective (if available)")

    skills: List[str] = dspy.OutputField(desc="List of skills related to programming (empty list if none)")
