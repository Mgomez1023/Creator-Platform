from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .analyzer import analyze_draft
from .config import get_settings
from .db import Base, engine, get_db
from .models import Analysis
from .schemas import AnalysisResponse, AnalyzeRequest
from .simulation import run_simulation

settings = get_settings()

app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
def create_analysis(payload: AnalyzeRequest, db: Session = Depends(get_db)) -> Analysis:
    analysis_output = analyze_draft(payload)
    simulation = run_simulation(analysis_output)

    row = Analysis(
        platform=payload.platform.value,
        caption=payload.caption,
        transcript=payload.transcript,
        hook_strength_0_1=analysis_output.hook_strength_0_1,
        topic_clarity_0_1=analysis_output.topic_clarity_0_1,
        niche_specificity_0_1=analysis_output.niche_specificity_0_1,
        cta_strength_0_1=analysis_output.cta_strength_0_1,
        transcript_clarity_0_1=analysis_output.transcript_clarity_0_1,
        predicted_score=simulation.predicted_score,
        stage1_pass_prob=simulation.stage1_pass_prob,
        stage2_pass_prob=simulation.stage2_pass_prob,
        viral_prob=simulation.viral_prob,
        top_recommendations=analysis_output.recommendations,
        rewritten_caption=analysis_output.rewritten_caption,
        hook_options=analysis_output.hook_options,
        why_this_score=analysis_output.why_this_score,
    )

    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@app.get("/analyses", response_model=list[AnalysisResponse])
def list_analyses(db: Session = Depends(get_db)) -> list[Analysis]:
    stmt = select(Analysis).order_by(Analysis.created_at.desc(), Analysis.id.desc())
    return list(db.scalars(stmt).all())


@app.get("/analyses/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(analysis_id: int, db: Session = Depends(get_db)) -> Analysis:
    analysis = db.get(Analysis, analysis_id)
    if analysis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found")
    return analysis
