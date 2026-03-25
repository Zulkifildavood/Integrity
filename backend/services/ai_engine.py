import json
from google import genai
from google.genai import types
from core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def validate_am_goals(goals: list[str], primary_aim: str) -> dict:
    prompt = f"""
    The user's primary long-term Aim is: "{primary_aim}".
    Today they have set the following goals:
    {json.dumps(goals)}
    
    Evaluate if these goals are actionable and aligned with their primary Aim.
    Return ONLY a raw JSON object (no markdown, no backticks, just the `{...}`) with the following structure:
    {{
        "integrity_score": <int 0-100>,
        "aim_alignment_score": <int 0-100>,
        "verdict": "<PASS|EXPAND|FAIL>",
        "issues": "<string describing any issues, or null>",
        "insight": "<brief encouraging or correcting insight>"
    }}
    
    Rules for verdict:
    - If integrity_score >= 70 and aim_alignment_score >= 70 AND there are at least 3 distinct goals: PASS
    - If scores are between 40-69: EXPAND
    - If scores < 40 or < 3 goals: FAIL
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )
    
    try:
        data = json.loads(response.text)
        return data
    except:
        return {
            "integrity_score": 0, "aim_alignment_score": 0, 
            "verdict": "FAIL", "issues": "Failed to parse AI response", "insight": ""
        }

def validate_pm_reflection(reflection: str, am_goals: list[str], primary_aim: str) -> dict:
    prompt = f"""
    The user's primary long-term Aim is: "{primary_aim}".
    Their morning goals were: {json.dumps(am_goals)}
    Their evening reflection is: "{reflection}"
    
    Evaluate how well they executed their goals and maintained discipline.
    Return ONLY a raw JSON object (no markdown, no backticks, just the `{...}`) with the following structure:
    {{
        "integrity_score": <int 0-100>,
        "aim_alignment_score": <int 0-100>,
        "verdict": "<PASS|EXPAND|FAIL>",
        "issues": "<string describing any issues, or null>",
        "insight": "<brief encouraging or correcting insight>"
    }}
    
    Rules for verdict:
    - If reflection shows genuine effort and execution >= 70: PASS
    - If reflection is too brief or evasive (40-69): EXPAND
    - If completely misses the mark or looks fake/AI-generated (<40): FAIL
    """
    
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )
    
    try:
        data = json.loads(response.text)
        return data
    except:
        return {
            "integrity_score": 0, "aim_alignment_score": 0, 
            "verdict": "FAIL", "issues": "Failed to parse AI response", "insight": ""
        }
