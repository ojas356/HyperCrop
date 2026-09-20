"""
HyperCrop — Alerts API Routes
"""

from flask import Blueprint, jsonify
from models import Alert, init_db

alerts_bp = Blueprint('alerts', __name__)
_, Session = init_db()


@alerts_bp.route('/alerts', methods=['GET'])
def get_alerts():
    session = Session()
    try:
        alerts = session.query(Alert).order_by(Alert.created_at.desc()).all()
        return jsonify([a.to_dict() for a in alerts])
    finally:
        session.close()
