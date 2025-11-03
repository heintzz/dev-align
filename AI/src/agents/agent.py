import dspy
from src.config import settings

def configure_llm():
    lm = dspy.LM(
        model=f"openai/{settings.LLM_MODEL_CV}",
        api_base=settings.LLM_BASE_URL_CV,
        api_key=settings.LLM_API_KEY,
        temperature=0.6,
        max_tokens=4000,
    )
    dspy.configure(lm=lm)

def configure_llm_roster():
    lm = dspy.LM(
        model=f"openai/{settings.LLM_MODEL_ROSTER}",
        api_base=settings.LLM_BASE_URL_ROSTER,
        api_key=settings.LLM_API_KEY,
    )

    dspy.configure(lm=lm)