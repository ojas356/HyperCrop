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
from datetime import datetime, timezone

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
        data = request.json

        # Generate ID
        count = session.query(Report).count()
        report_id = f'HC-{1001 + count}'

        # Calculate evidence metrics (prototype)
        img_conf = calculate_image_confidence(
            data.get('imageUrl', ''),
            data.get('crop', ''),
            data.get('suspectedIssue', '')
        )
        geo_indep = 0.5 + (hash(f"{data.get('latitude', 0)}{data.get('longitude', 0)}") % 45) / 100
        temp_cons = 0.7 + (hash(str(datetime.now())) % 25) / 100
        dup_sim = 0.05 + (hash(data.get('imageUrl', '')) % 20) / 100

        ev_score = calculate_evidence_score(img_conf, geo_indep, temp_cons)
        status = classify_verification_status(ev_score, dup_sim, img_conf)

        report = Report(
            id=report_id,
            farmer_name=data.get('farmerName', 'Field Reporter'),
            crop=data['crop'],
            suspected_issue=data['suspectedIssue'],
            latitude=data['latitude'],
            longitude=data['longitude'],
            village=data.get('village', 'Unknown'),
            image_url=data.get('imageUrl', ''),
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

        return jsonify(report.to_dict()), 201
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        session.close()
