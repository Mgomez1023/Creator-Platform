import math

from .schemas import AIAnalyzerOutput, SimulationResult

WEIGHTS = {
    "hook_strength_0_1": 0.26,
    "topic_clarity_0_1": 0.23,
    "niche_specificity_0_1": 0.17,
    "cta_strength_0_1": 0.17,
    "transcript_clarity_0_1": 0.17,
}



def _sigmoid(value: float) -> float:
    return 1.0 / (1.0 + math.exp(-value))



def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))



def run_simulation(signals: AIAnalyzerOutput) -> SimulationResult:
    score_0_1 = (
        signals.hook_strength_0_1 * WEIGHTS["hook_strength_0_1"]
        + signals.topic_clarity_0_1 * WEIGHTS["topic_clarity_0_1"]
        + signals.niche_specificity_0_1 * WEIGHTS["niche_specificity_0_1"]
        + signals.cta_strength_0_1 * WEIGHTS["cta_strength_0_1"]
        + signals.transcript_clarity_0_1 * WEIGHTS["transcript_clarity_0_1"]
    )

    predicted_score = round(score_0_1 * 10.0, 1)
    stage1_pass_prob = _clamp(_sigmoid((score_0_1 - 0.35) * 7), 0.0, 0.95)
    stage2_pass_prob = _clamp(_sigmoid((score_0_1 - 0.55) * 7), 0.0, 0.85)
    viral_prob = _clamp(_sigmoid((score_0_1 - 0.75) * 9), 0.0, 0.35)

    return SimulationResult(
        predicted_score=predicted_score,
        stage1_pass_prob=round(stage1_pass_prob, 4),
        stage2_pass_prob=round(stage2_pass_prob, 4),
        viral_prob=round(viral_prob, 4),
    )
