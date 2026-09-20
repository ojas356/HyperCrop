"""
HyperCrop — Clusters API Routes
"""

from flask import Blueprint, jsonify
from models import Cluster, init_db

clusters_bp = Blueprint('clusters', __name__)
_, Session = init_db()


@clusters_bp.route('/clusters', methods=['GET'])
def get_clusters():
    session = Session()
    try:
        clusters = session.query(Cluster).all()
        return jsonify([c.to_dict() for c in clusters])
    finally:
        session.close()


@clusters_bp.route('/clusters/<cluster_id>', methods=['GET'])
def get_cluster(cluster_id):
    session = Session()
    try:
        cluster = session.query(Cluster).filter_by(id=cluster_id).first()
        if not cluster:
            return jsonify({'error': 'Cluster not found'}), 404
        return jsonify(cluster.to_dict())
    finally:
        session.close()
