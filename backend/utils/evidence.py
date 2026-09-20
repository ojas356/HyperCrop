"""
HyperCrop — Evidence Scoring Utilities

Prototype implementation of evidence scoring for pest/disease reports.
These functions use deterministic/rule-based logic for the MVP.
Each function is structured so a real ML model can replace it later.
"""

import math


def calculate_image_confidence(image_url: str, crop: str, issue: str,
                               cnn_confidence: float = None) -> float:
    """
    Returns the image confidence score for evidence weighting.

    When the CNN model is trained and available, `cnn_confidence` is the
    softmax probability of the top predicted class returned by
    utils.inference.predict_from_bytes(). Pass it in directly.

    Falls back to a rule-based prototype when the model isn't ready.
    """
    if cnn_confidence is not None:
        # Real CNN confidence — clamp to [0.10, 0.99]
        return round(min(0.99, max(0.10, float(cnn_confidence))), 4)

    # ── Prototype fallback (no model trained yet) ──────────────────────────
    if not image_url:
        return 0.15  # No photo — very low confidence
    # Deterministic heuristic: 0.70–0.94
    return 0.70 + (hash(image_url) % 25) / 100.0


def calculate_image_similarity(image_a: str, image_b: str) -> float:
    """
    Prototype implementation.
    Replace with a perceptual hashing or embedding-based similarity model
    (e.g., CLIP embeddings cosine similarity) for production.

    For MVP: returns deterministic similarity based on string comparison.
    """
    if not image_a or not image_b:
        return 0.0
    if image_a == image_b:
        return 0.98
    # Simulate similarity based on hash proximity
    h = abs(hash(image_a) - hash(image_b)) % 100
    return max(0.05, min(0.95, 1.0 - h / 100.0))


def calculate_geographic_independence(lat: float, lng: float,
                                       cluster_reports: list) -> float:
    """
    Prototype implementation.
    Measures how geographically distinct a report is from existing reports
    in its cluster. Higher = more independent (from a different field).

    Replace with proper spatial analysis using PostGIS or similar
    for production deployments.
    """
    if not cluster_reports:
        return 1.0  # First report is fully independent

    min_distance = float('inf')
    for report in cluster_reports:
        dist = _haversine(lat, lng, report['latitude'], report['longitude'])
        if dist < min_distance:
            min_distance = dist

    # Score: 0m apart = 0.1, 100m = 0.5, 500m+ = 0.9+
    if min_distance < 0.01:  # < 10m
        return 0.10
    elif min_distance < 0.05:  # < 50m
        return 0.25
    elif min_distance < 0.1:  # < 100m
        return 0.50
    elif min_distance < 0.3:  # < 300m
        return 0.75
    elif min_distance < 0.5:  # < 500m
        return 0.85
    else:
        return 0.95


def calculate_temporal_consistency(timestamp_str: str,
                                    cluster_reports: list) -> float:
    """
    Prototype implementation.
    Reports that arrive in a natural temporal spread (not all at once after
    an alert) score higher for temporal consistency.

    Replace with a proper temporal analysis model for production.
    """
    # For MVP, returns a pre-seeded or deterministic value
    return 0.70 + (hash(timestamp_str) % 25) / 100.0  # 0.70–0.94


def calculate_evidence_score(image_confidence: float,
                              geographic_independence: float,
                              temporal_consistency: float,
                              verification_weight: float = 1.0) -> float:
    """
    Proposed prototype scoring model.
    Evidence Score = Photo Confidence × Geographic Independence
                    × Temporal Consistency × Verification Weight

    This is NOT a scientifically validated formula. It is a prototype
    scoring model designed to demonstrate evidence-weighted classification.
    """
    score = (image_confidence
             * geographic_independence
             * temporal_consistency
             * verification_weight)
    return round(min(1.0, max(0.0, score)), 2)


def classify_verification_status(evidence_score: float,
                                  duplicate_similarity: float,
                                  image_confidence: float) -> str:
    """
    Classify a report's verification status based on evidence metrics.

    Returns one of: 'independent', 'confirmed', 'unconfirmed', 'similar', 'duplicate'
    """
    if duplicate_similarity > 0.85:
        return 'duplicate'
    if duplicate_similarity > 0.60:
        return 'similar'
    if image_confidence < 0.30:
        return 'unconfirmed'
    if evidence_score > 0.60 and image_confidence > 0.70:
        return 'independent'
    if image_confidence > 0.50:
        return 'confirmed'
    return 'unconfirmed'


def classify_cluster_risk(independent_reports: int,
                           confirmed_reports: int,
                           total_reports: int,
                           avg_evidence_score: float) -> str:
    """
    Classify cluster risk level based on evidence-weighted logic.
    NOT simply: 10 reports = high risk.
    Instead: sufficient independent evidence across multiple fields.

    Returns one of: 'low', 'watch', 'elevated', 'high'
    """
    if independent_reports >= 6 and confirmed_reports >= 4 and avg_evidence_score > 0.55:
        return 'high'
    if independent_reports >= 4 and avg_evidence_score > 0.45:
        return 'elevated'
    if independent_reports >= 2 or total_reports >= 5:
        return 'watch'
    return 'low'


def _haversine(lat1, lon1, lat2, lon2):
    """Calculate distance in km between two lat/lng points."""
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c
