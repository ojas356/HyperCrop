"""
HyperCrop — Clustering Utilities

Prototype clustering and risk classification logic.
Replace with DBSCAN, HDBSCAN, or a custom spatio-temporal
clustering algorithm for production deployments.
"""

import math
from .evidence import _haversine, classify_cluster_risk


def detect_clusters(reports: list, distance_threshold_km: float = 2.0) -> list:
    """
    Prototype cluster detection using simple distance-based grouping.

    Replace with DBSCAN or HDBSCAN with spatio-temporal features
    for production-grade clustering.

    Args:
        reports: List of report dicts with latitude, longitude, crop, suspectedIssue
        distance_threshold_km: Maximum distance to consider reports in the same cluster

    Returns:
        List of cluster dicts
    """
    if not reports:
        return []

    # Group by crop + issue first
    groups = {}
    for r in reports:
        key = f"{r['crop']}|{r['suspected_issue']}"
        if key not in groups:
            groups[key] = []
        groups[key].append(r)

    clusters = []
    cluster_id = 1

    for key, group_reports in groups.items():
        crop, issue = key.split('|')
        # Simple greedy clustering by distance
        assigned = set()

        for i, report in enumerate(group_reports):
            if i in assigned:
                continue

            cluster_members = [report]
            assigned.add(i)

            for j, other in enumerate(group_reports):
                if j in assigned:
                    continue
                dist = _haversine(
                    report['latitude'], report['longitude'],
                    other['latitude'], other['longitude']
                )
                if dist <= distance_threshold_km:
                    cluster_members.append(other)
                    assigned.add(j)

            if len(cluster_members) >= 2:
                cluster = _build_cluster(
                    f'CL-{cluster_id:02d}',
                    crop, issue, cluster_members
                )
                clusters.append(cluster)
                cluster_id += 1

    return clusters


def _build_cluster(cluster_id: str, crop: str, issue: str,
                   members: list) -> dict:
    """Build a cluster dict from its member reports."""
    lats = [m['latitude'] for m in members]
    lngs = [m['longitude'] for m in members]
    center_lat = sum(lats) / len(lats)
    center_lng = sum(lngs) / len(lngs)

    # Calculate radius
    max_dist = 0
    for m in members:
        d = _haversine(center_lat, center_lng, m['latitude'], m['longitude'])
        if d > max_dist:
            max_dist = d
    radius = round(max_dist + 0.1, 1)  # Add small buffer

    # Count by status
    independent = sum(1 for m in members
                      if m.get('verification_status') == 'independent')
    confirmed = sum(1 for m in members
                    if m.get('verification_status') in ('confirmed', 'independent'))
    unconfirmed = sum(1 for m in members
                      if m.get('verification_status') == 'unconfirmed')
    duplicate = sum(1 for m in members
                    if m.get('verification_status') in ('duplicate', 'similar'))

    scores = [m.get('evidence_score', 0.5) for m in members]
    avg_score = sum(scores) / len(scores) if scores else 0.5

    risk = classify_cluster_risk(independent, confirmed, len(members), avg_score)

    # Determine village from most common
    villages = [m.get('village', 'Unknown') for m in members]
    village = max(set(villages), key=villages.count)

    return {
        'id': cluster_id,
        'crop': crop,
        'issue': issue,
        'village': village,
        'center_latitude': round(center_lat, 4),
        'center_longitude': round(center_lng, 4),
        'radius_km': radius,
        'total_reports': len(members),
        'independent_reports': independent,
        'confirmed_reports': confirmed,
        'unconfirmed_reports': unconfirmed,
        'duplicate_reports': duplicate,
        'risk_level': risk,
        'avg_evidence_score': round(avg_score, 2),
    }
