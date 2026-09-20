"""
HyperCrop — Reports API Routes
"""

from flask import Blueprint, request, jsonify
from models import Report, init_db
from utils.evidence import (
    calculate_image_confidence,
    calculate_evidence_score,
    classify_verification_status,
)
from utils.inference import predict_from_bytes, is_model_ready
from datetime import datetime, timezone
import base64

reports_bp = Blueprint('reports', __name__)
_, Session = init_db()


@reports_bp.route('/reports', methods=['GET'])
def get_reports():
    session = Session()
    try:
        reports = session.query(Report).all()
        return jsonify([r.to_dict() for r in reports])
    finally:
        session.close()


@reports_bp.route('/reports/<report_id>', methods=['GET'])
def get_report(report_id):
    session = Session()
    try:
        report = session.query(Report).filter_by(id=report_id).first()
        if not report:
            return jsonify({'error': 'Report not found'}), 404
        return jsonify(report.to_dict())
    finally:
        session.close()


@reports_bp.route('/reports', methods=['POST'])
def create_report():
    session = Session()
    try:
        # Support both JSON and multipart/form-data
        if request.content_type and 'multipart/form-data' in request.content_type:
            data = request.form.to_dict()
            image_file = request.files.get('image')
        else:
            data = request.json or {}
            image_file = None

        # Generate ID
        count = session.query(Report).count()
        report_id = f'HC-{1001 + count}'

        # ── CNN inference (if model is ready and image provided) ──────────
        cnn_result     = None
        cnn_confidence = None
        detected_issue = data.get('suspectedIssue', '')

        if image_file:
            image_bytes = image_file.read()
            if image_bytes and is_model_ready():
                cnn_result     = predict_from_bytes(image_bytes)
                cnn_confidence = cnn_result['confidence'] if cnn_result['model_used'] else None
                # Use CNN-detected issue if farmer didn't specify one
                if not detected_issue and cnn_result.get('issue'):
                    detected_issue = cnn_result['issue']

        # ── Evidence metrics ──────────────────────────────────────────────
        image_url = data.get('imageUrl', '')
        img_conf  = calculate_image_confidence(
            image_url,
            data.get('crop', ''),
            detected_issue,
            cnn_confidence=cnn_confidence,
        )
        geo_indep  = 0.5 + (hash(f"{data.get('latitude', 0)}{data.get('longitude', 0)}") % 45) / 100
        temp_cons  = 0.7 + (hash(str(datetime.now())) % 25) / 100
        dup_sim    = 0.05 + (hash(data.get('imageUrl', '')) % 20) / 100

        ev_score = calculate_evidence_score(img_conf, geo_indep, temp_cons)
        status   = classify_verification_status(ev_score, dup_sim, img_conf)

        report = Report(
            id=report_id,
            farmer_name=data.get('farmerName', 'Field Reporter'),
            crop=data.get('crop', detected_issue and cnn_result and cnn_result.get('crop') or 'Unknown'),
            suspected_issue=detected_issue or 'Unknown',
            latitude=float(data.get('latitude', 0)),
            longitude=float(data.get('longitude', 0)),
            village=data.get('village', 'Unknown'),
            image_url=image_url,
            notes=data.get('notes', ''),
            timestamp=datetime.now(timezone.utc),
            image_confidence=img_conf,
            duplicate_similarity=dup_sim,
            geographic_independence=geo_indep,
            temporal_consistency=temp_cons,
            evidence_score=ev_score,
            verification_status=status,
        )

        session.add(report)
        session.commit()

        response = report.to_dict()
        # Include CNN result in response if available
        if cnn_result:
            response['cnnAnalysis'] = cnn_result

        return jsonify(response), 201
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        session.close()
