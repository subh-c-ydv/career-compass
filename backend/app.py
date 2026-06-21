from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from coach import analyse_profile, load_profile, save_profile, list_profiles
from config import PROFILES_DIR

app = Flask(__name__)
CORS(app)

# --- Profile endpoints ---

@app.route("/api/profiles", methods=["GET"])
def get_profiles():
    """List all saved profiles."""
    return jsonify(list_profiles())

@app.route("/api/profiles/<profile_id>", methods=["GET"])
def get_profile(profile_id):
    """Load a single profile by ID."""
    profile = load_profile(profile_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404
    return jsonify(profile)

@app.route("/api/profiles", methods=["POST"])
def create_profile():
    """Create or update a profile."""
    data = request.json
    profile_id = save_profile(data)
    return jsonify({"profile_id": profile_id, "status": "saved"})

# --- Analysis endpoint ---

@app.route("/api/analyse", methods=["POST"])
def analyse():
    """Run Mercedes Model analysis on a profile."""
    data = request.json
    profile = data.get("profile")
    if not profile:
        return jsonify({"error": "No profile provided"}), 400

    result = analyse_profile(profile)
    return jsonify(result)

if __name__ == "__main__":
    os.makedirs(PROFILES_DIR, exist_ok=True)
    app.run(debug=True, port=5000)