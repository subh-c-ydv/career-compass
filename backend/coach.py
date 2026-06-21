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

def load_profile(profile_id: str) -> dict | None:
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
    """Run the Mercedes Model analysis using Claude."""
    prompt_template = load_prompt("analysis_prompt")

    # Inject profile data into prompt
    domain_a = profile.get("domain_a", {})
    domain_b = profile.get("domain_b", {})
    domain_c = profile.get("domain_c", {})
    hub = profile.get("hub", {})

    prompt = prompt_template.format(
        name=profile.get("name", "the individual"),
        domain_a_label=domain_a.get("label", "Domain A"),
        domain_a_description=domain_a.get("description", ""),
        domain_a_years=domain_a.get("years", ""),
        domain_a_highlights="\n".join(domain_a.get("highlights", [])),
        domain_b_label=domain_b.get("label", "Domain B"),
        domain_b_description=domain_b.get("description", ""),
        domain_b_years=domain_b.get("years", ""),
        domain_b_highlights="\n".join(domain_b.get("highlights", [])),
        domain_c_label=domain_c.get("label", "Domain C"),
        domain_c_description=domain_c.get("description", ""),
        domain_c_years=domain_c.get("years", ""),
        domain_c_highlights="\n".join(domain_c.get("highlights", [])),
        hub_statement=hub.get("statement", ""),
        hub_values=", ".join(hub.get("values", [])),
    )

    message = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}]
    )

    raw = message.content[0].text

    # Parse structured JSON from Claude's response
    try:
        # Claude is instructed to return JSON — extract it
        start = raw.find("{")
        end = raw.rfind("}") + 1
        analysis = json.loads(raw[start:end])
    except Exception:
        analysis = {"raw": raw, "parse_error": True}

    return {"analysis": analysis, "profile_name": profile.get("name")}