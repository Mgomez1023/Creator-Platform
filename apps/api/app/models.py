from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from .db import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    platform: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    caption: Mapped[str] = mapped_column(Text, nullable=False)
    transcript: Mapped[str | None] = mapped_column(Text, nullable=True)

    hook_strength_0_1: Mapped[float] = mapped_column(Float, nullable=False)
    topic_clarity_0_1: Mapped[float] = mapped_column(Float, nullable=False)
    niche_specificity_0_1: Mapped[float] = mapped_column(Float, nullable=False)
    cta_strength_0_1: Mapped[float] = mapped_column(Float, nullable=False)
    transcript_clarity_0_1: Mapped[float] = mapped_column(Float, nullable=False)

    predicted_score: Mapped[float] = mapped_column(Float, nullable=False, index=True)
    stage1_pass_prob: Mapped[float] = mapped_column(Float, nullable=False)
    stage2_pass_prob: Mapped[float] = mapped_column(Float, nullable=False)
    viral_prob: Mapped[float] = mapped_column(Float, nullable=False)

    top_recommendations: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    rewritten_caption: Mapped[str] = mapped_column(Text, nullable=False)
    hook_options: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    why_this_score: Mapped[str] = mapped_column(Text, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )
