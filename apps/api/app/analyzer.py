import json
import logging
import re

from .config import get_settings
from .schemas import AIAnalyzerOutput, AnalyzeRequest

try:
    from openai import OpenAI
except Exception:  # pragma: no cover - only hit when dependency is absent
    OpenAI = None

logger = logging.getLogger(__name__)

CTA_KEYWORDS = [
    "comment",
    "follow",
    "share",
    "save",
    "subscribe",
    "link in bio",
    "dm",
    "join",
]

HOOK_PATTERNS = [
    r"\?",
    r"\bhow to\b",
    r"\b\d{1,3}\b",
    r"\bmistake\b",
    r"\bsecret\b",
    r"\bstop\b",
]



def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))



def _extract_topic(caption: str) -> str:
    stripped = re.sub(r"#\w+", "", caption)
    words = re.findall(r"[A-Za-z0-9']+", stripped)
    if not words:
        return "your audience"
    return " ".join(words[:6]).lower()



def _heuristic_analyze(payload: AnalyzeRequest) -> AIAnalyzerOutput:
    caption = payload.caption.strip()
    caption_lower = caption.lower()
    transcript = (payload.transcript or "").strip()

    caption_len = len(caption)
    transcript_len = len(transcript)

    hook_hits = sum(1 for pattern in HOOK_PATTERNS if re.search(pattern, caption_lower))
    cta_hits = sum(1 for keyword in CTA_KEYWORDS if keyword in caption_lower)
    hashtags = len(re.findall(r"#\w+", caption))
    long_words = len(re.findall(r"\b[a-zA-Z]{7,}\b", caption))
    transcript_sentences = len(re.findall(r"[.!?]", transcript))

    hook_strength = _clamp(
        0.22
        + (0.16 if caption_len <= 120 else 0.0)
        + hook_hits * 0.15
        - (0.1 if caption_len > 280 else 0.0)
    )

    topic_clarity = _clamp(
        0.3
        + (0.34 if 40 <= caption_len <= 180 else 0.12)
        + (0.08 if ":" in caption or "-" in caption else 0.0)
        + (0.08 if "for" in caption_lower else 0.0)
    )

    niche_specificity = _clamp(
        0.24
        + min(hashtags, 3) * 0.11
        + min(long_words, 5) * 0.07
        + (0.06 if payload.platform == "youtube" else 0.0)
    )

    cta_strength = _clamp(
        0.18
        + min(cta_hits, 3) * 0.22
        + (0.1 if any(token in caption_lower for token in ["today", "now", "this week"]) else 0.0)
    )

    transcript_clarity = _clamp(
        0.44
        + (0.12 if transcript_len >= 80 else 0.0)
        + (0.14 if 180 <= transcript_len <= 2200 else 0.0)
        + min(transcript_sentences, 6) * 0.03
        - (0.08 if 0 < transcript_len < 40 else 0.0)
    )

    topic = _extract_topic(caption)

    recommendations: list[str] = []
    if hook_strength < 0.6:
        recommendations.append("Lead with a stronger first line using a clear promise or pattern break.")
    if topic_clarity < 0.6:
        recommendations.append("Narrow the caption to one concrete outcome so the audience gets it in one read.")
    if niche_specificity < 0.55:
        recommendations.append("Add niche-specific terms or examples to signal exactly who this is for.")
    if cta_strength < 0.55:
        recommendations.append("End with one explicit CTA like comment, save, or follow for part 2.")
    if transcript_clarity < 0.62:
        recommendations.append("Tighten transcript flow: short sentences, one idea per beat, fewer filler phrases.")

    if not recommendations:
        recommendations = [
            "Keep the hook but test two variants that sharpen the payoff in the first line.",
            "Mirror your best-performing keyword in both opening line and CTA.",
            "Add one proof element (result, metric, or example) to raise trust quickly.",
        ]

    platform_cta = {
        "tiktok": "Comment 'audit' and follow for the next teardown.",
        "instagram": "Save this and drop a comment if you want the full checklist.",
        "youtube": "Subscribe and comment your niche for a custom breakdown.",
    }[payload.platform]

    rewritten_caption = (
        f"Stop scrolling: {topic} is usually where creators lose reach. "
        f"Use this simple framework to make the value obvious in the first 3 seconds. "
        f"{platform_cta}"
    )

    hook_options = [
        f"The {topic} mistake that quietly kills retention",
        f"How to improve {topic} before your next upload",
        f"3 quick fixes for {topic} that increase watch time",
    ]

    why_this_score = (
        "This draft has a usable structure and some intent signals, but stronger hook wording, "
        "clearer audience targeting, and a sharper CTA would improve conversion through later stages."
    )

    return AIAnalyzerOutput(
        hook_strength_0_1=round(hook_strength, 3),
        topic_clarity_0_1=round(topic_clarity, 3),
        niche_specificity_0_1=round(niche_specificity, 3),
        cta_strength_0_1=round(cta_strength, 3),
        transcript_clarity_0_1=round(transcript_clarity, 3),
        recommendations=recommendations[:5],
        rewritten_caption=rewritten_caption,
        hook_options=hook_options,
        why_this_score=why_this_score,
    )



def _openai_analyze(payload: AnalyzeRequest) -> AIAnalyzerOutput | None:
    settings = get_settings()
    if not settings.openai_api_key:
        return None

    if OpenAI is None:
        logger.warning("OPENAI_API_KEY is set but openai package is not installed. Falling back to heuristics.")
        return None

    client = OpenAI(api_key=settings.openai_api_key)

    system_prompt = (
        "You analyze short-form creator drafts. Return ONLY valid JSON with keys: "
        "hook_strength_0_1, topic_clarity_0_1, niche_specificity_0_1, cta_strength_0_1, "
        "transcript_clarity_0_1, recommendations, rewritten_caption, hook_options, why_this_score. "
        "Scores must be decimals between 0 and 1. recommendations should be 3-5 concise strings. "
        "hook_options must contain exactly 3 strings."
    )

    user_prompt = {
        "platform": payload.platform,
        "caption": payload.caption,
        "transcript": payload.transcript or "",
    }

    try:
        response = client.chat.completions.create(
            model=settings.openai_model,
            temperature=0.2,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(user_prompt)},
            ],
        )
        content = response.choices[0].message.content or "{}"
        parsed = json.loads(content)
        return AIAnalyzerOutput.model_validate(parsed)
    except Exception as exc:  # pragma: no cover - network/provider errors
        logger.warning("OpenAI analysis failed, using heuristic fallback: %s", exc)
        return None



def analyze_draft(payload: AnalyzeRequest) -> AIAnalyzerOutput:
    model_output = _openai_analyze(payload)
    if model_output is not None:
        return model_output
    return _heuristic_analyze(payload)
