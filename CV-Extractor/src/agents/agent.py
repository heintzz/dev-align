import dspy
from src.config import settings

def configure_dspy():
    lm = dspy.LM(
        model=f"openai/{settings.LLM_MODEL}",
        api_base=settings.LLM_BASE_URL,
        api_key=settings.LLM_API_KEY,
        temperature=0.1,
        max_tokens=4000,
    )
    dspy.configure(lm=lm)

configure_dspy()