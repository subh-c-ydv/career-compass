import anthropic
import json
import os
import uuid
from config import ANTHROPIC_API_KEY, MODEL, PROFILES_DIR

client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

# --- Prompt loader ---

def load_prompt(name: str) -> str:
    path = os.path.join(os.path.dirname(__file__), "prompts", f"{name}.txt")
    with open(path, "r") as f:
        return f.read()

# --- Profile I/O ---

def list_profiles() -> list:
    if not os.path.exists(PROFILES_DIR):
        return []
    profiles = []
    for fname in os.listdir(PROFILES_DIR):
        if fname.endswith(".json"):
            with open(os.path.join(PROFILES_DIR, fname)) as f:
                p = json.load(f)
                profiles.append({
                    "id": p.get("id"),
                    "name": p.get("name"),
                    "type": p.get("type", "client"),
                    "created_at": p.get("created_at")
                })
    return profiles

def load_profile(profile_id: str):
    path = os.path.join(PROFILES_DIR, f"{profile_id}.json")
    if not os.path.exists(path):
        return None
    with open(path) as f:
        return json.load(f)

def save_profile(data: dict) -> str:
    os.makedirs(PROFILES_DIR, exist_ok=True)
    if not data.get("id"):
        data["id"] = str(uuid.uuid4())[:8]
    path = os.path.join(PROFILES_DIR, f"{data['id']}.json")
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
    return data["id"]

# --- Core analysis ---

def analyse_profile(profile: dict) -> dict:
    """Run the Career Compass Map analysis using Claude."""
    prompt_template = load_prompt("analysis_prompt")

    dimensions = profile.get("dimensions", [])
    hub = profile.get("hub", {})

    # Build the dimensions block for the prompt
    dimensions_block_lines = []
    for i, dimension in enumerate(dimensions):
        label = dimension.get("label", f"Dimension {i+1}")
        description = dimension.get("description", "")
        years = dimension.get("years", "")
        highlights = "\n".join(f"- {h}" for h in dimension.get("highlights", []) if h.strip())
        dimensions_block_lines.append(
            f"DOMAIN {i+1} — {label}\n"
            f"Description: {description}\n"
            f"Years of experience: {years}\n"
            f"Key highlights:\n{highlights}"
        )
    dimensions_block = "\n\n".join(dimensions_block_lines)

    # Build the dimension_score_keys for the JSON schema in the prompt
    dimension_score_keys = ",\n    ".join(
        f'"dimension_{i+1}": <integer 1-10>'
        for i in range(len(dimensions))
    )

    prompt = prompt_template.format(
        name=profile.get("name", "the individual"),
        dimension_count=len(dimensions),
        dimensions_block=dimensions_block,
        hub_statement=hub.get("statement", ""),
        hub_values=", ".join(hub.get("values", [])),
        dimension_score_keys=dimension_score_keys,
    )

    message = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text

    # Parse structured JSON from Claude's response
    try:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        analysis = json.loads(raw[start:end])
    except Exception:
        analysis = {"raw": raw, "parse_error": True}

    return {"analysis": analysis, "profile_name": profile.get("name")}