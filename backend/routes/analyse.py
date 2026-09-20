"""
HyperCrop — Image Analysis Route
POST /api/analyse-image

Accepts a multipart/form-data upload with an "image" field,
runs the CNN inference, and returns the predicted crop issue.

Falls back gracefully to prototype scores if the model isn't trained yet.
"""

from flask import Blueprint, request, jsonify
from utils.inference import predict_from_bytes, is_model_ready

analyse_bp = Blueprint("analyse", __name__)


@analyse_bp.route("/analyse-image", methods=["POST"])
def analyse_image():
    """
    Request (multipart/form-data):
        image   — image file (JPEG / PNG / WebP)

    Response 200:
    {
        "model_used":  true,
        "crop":        "Tomato",
        "issue":       "Early Blight",
        "confidence":  0.91,
        "is_healthy":  false,
        "top5": [
            { "crop": "Tomato", "issue": "Early Blight", "confidence": 0.91 },
            ...
        ],
        "model_status": "ready" | "fallback"
    }

    Response 400:  no image provided
    Response 500:  unexpected server error
    """
    if "image" not in request.files:
        return jsonify({"error": "No image file provided. Send as multipart field 'image'."}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "Empty filename."}), 400

    try:
        image_bytes = file.read()
        if len(image_bytes) == 0:
            return jsonify({"error": "Empty file."}), 400

        result = predict_from_bytes(image_bytes)
        result["model_status"] = "ready" if result["model_used"] else "fallback"

        return jsonify(result), 200

    except Exception as exc:
        return jsonify({"error": f"Analysis failed: {str(exc)}"}), 500


@analyse_bp.route("/analyse-image/status", methods=["GET"])
def model_status():
    """Quick health check — tells the frontend whether the CNN is loaded."""
    ready = is_model_ready()
    return jsonify({
        "model_ready": ready,
        "message": "CNN model loaded and ready." if ready
                   else "Model not trained yet. Run backend/train_model.py first.",
    })
