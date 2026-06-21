from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import io
import os
from coach import analyse_profile, load_profile, save_profile, list_profiles
from export import generate_pdf
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

@app.route("/api/profiles/<profile_id>", methods=["DELETE"])
def delete_profile(profile_id):
    """Delete a profile by ID."""
    path = os.path.join(PROFILES_DIR, f"{profile_id}.json")
    if not os.path.exists(path):
        return jsonify({"error": "Profile not found"}), 404
    os.remove(path)
    return jsonify({"status": "deleted", "profile_id": profile_id})

# --- Analysis endpoint ---

@app.route("/api/analyse", methods=["POST"])
def analyse():
    """Run Career Compass Map analysis on a profile."""
    data = request.json
    profile = data.get("profile")
    if not profile:
        return jsonify({"error": "No profile provided"}), 400
    result = analyse_profile(profile)
    return jsonify(result)

# --- Export endpoint ---

@app.route("/api/export", methods=["POST"])
def export():
    """Generate and return a PDF export of the analysis."""
    data = request.json
    profile = data.get("profile")
    analysis = data.get("analysis")
    if not profile or not analysis:
        return jsonify({"error": "Profile and analysis required"}), 400

    pdf_bytes = generate_pdf(profile, analysis)
    name = profile.get("name", "profile").replace(" ", "_")
    filename = f"career-compass-{name}.pdf"

    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename
    )

if __name__ == "__main__":
    os.makedirs(PROFILES_DIR, exist_ok=True)
    app.run(debug=True, port=5001)