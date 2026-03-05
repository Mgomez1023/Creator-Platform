from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator


class Platform(str, Enum):
    tiktok = "tiktok"
    instagram = "instagram"
    youtube = "youtube"


class AnalyzeRequest(BaseModel):
    platform: Platform
    caption: str = Field(min_length=1, max_length=2200)
    transcript: str | None = Field(default=None, max_length=20000)

    @field_validator("caption", "transcript", mode="before")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        stripped = value.strip()
        return stripped or None


class AIAnalyzerOutput(BaseModel):
    hook_strength_0_1: float = Field(ge=0.0, le=1.0)
    topic_clarity_0_1: float = Field(ge=0.0, le=1.0)
    niche_specificity_0_1: float = Field(ge=0.0, le=1.0)
    cta_strength_0_1: float = Field(ge=0.0, le=1.0)
    transcript_clarity_0_1: float = Field(ge=0.0, le=1.0)
    recommendations: list[str] = Field(min_length=1, max_length=7)
    rewritten_caption: str = Field(min_length=1, max_length=2200)
    hook_options: list[str] = Field(min_length=3, max_length=3)
    why_this_score: str = Field(min_length=1, max_length=600)


class SimulationResult(BaseModel):
    predicted_score: float = Field(ge=0.0, le=10.0)
    stage1_pass_prob: float = Field(ge=0.0, le=0.95)
    stage2_pass_prob: float = Field(ge=0.0, le=0.85)
    viral_prob: float = Field(ge=0.0, le=0.35)


class AnalysisResponse(BaseModel):
    id: int
    platform: Platform
    caption: str
    transcript: str | None

    hook_strength_0_1: float
    topic_clarity_0_1: float
    niche_specificity_0_1: float
    cta_strength_0_1: float
    transcript_clarity_0_1: float

    predicted_score: float
    stage1_pass_prob: float
    stage2_pass_prob: float
    viral_prob: float

    top_recommendations: list[str]
    rewritten_caption: str
    hook_options: list[str]
    why_this_score: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
