import dspy
from typing import Dict, Any
from src.agents.parser_agent.model import CVStructuredModel
from src.agents.types import CVData
from src.utils import retry_on_error

class CVParserAgent(dspy.Module):
    def __init__(self):
        super().__init__()
        self.generate = dspy.ChainOfThought(CVStructuredModel)
    
    @retry_on_error(max_retries=3, delay=1)
    def forward(self, cv_text: str) -> Dict[str, Any]:
        try:
            prediction = self.generate(cv_text=cv_text)
            
            name = "Unknown"
            if hasattr(prediction, 'name') and prediction.name:
                name = str(prediction.name).strip() or "Unknown"
            
            email = ""
            if hasattr(prediction, 'email') and prediction.email:
                email = str(prediction.email).strip()
                
            skills = []
            if hasattr(prediction, 'skills') and prediction.skills:
                if isinstance(prediction.skills, list):
                    skills = [str(s) for s in prediction.skills if s]
                else:
                    skills = []
          
            phoneNumber = None
            if hasattr(prediction, 'phoneNumber') and prediction.phoneNumber and str(prediction.phoneNumber).strip() not in ['N/A', 'null', 'None', '']:
                phoneNumber = str(prediction.phoneNumber)
            
            description = None
            if hasattr(prediction, 'description') and prediction.description and str(prediction.description).strip() not in ['N/A', 'null', 'None', '']:
                description = str(prediction.description)
            
            cv_data = CVData(
                name=name,
                email=email,
                description=description,
                phoneNumber=phoneNumber,
                skills=skills,
            )
            
            return cv_data.model_dump()
            
        except Exception as e:
            print(f"Error in CVParserAgent: {e}")
            return CVData(
                name="Unknown",
                email="",
                description="",
                phoneNumber="",
                skills=[],
            ).model_dump()

