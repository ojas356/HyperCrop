"""
HyperCrop — Dashboard Stats API Routes
"""

from flask import Blueprint, jsonify
from models import Report, Cluster, Alert, init_db

dashboard_bp = Blueprint('dashboard', __name__)
_, Session = init_db()


@dashboard_bp.route('/dashboard/stats', methods=['GET'])
def get_stats():
    session = Session()
    try:
        total_reports = session.query(Report).count()
        independent = session.query(Report).filter(
            Report.verification_status.in_(['independent', 'confirmed'])
        ).count()
        duplicates = session.query(Report).filter(
            Report.verification_status.in_(['duplicate', 'similar'])
        ).count()
        active_alerts = session.query(Alert).filter_by(status='active').count()
        high_risk = session.query(Cluster).filter_by(risk_level='high').count()

        return jsonify({
            'totalReports': total_reports,
            'independentEvidence': independent,
            'reportsSuppressed': duplicates,
            'activeAlerts': active_alerts,
            'highRiskClusters': high_risk,
        })
    finally:
        session.close()
