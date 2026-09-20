"""
HyperCrop — Database Seed Script
Creates ~50 realistic demo reports across 4 villages with a
believable outbreak scenario centered on Kharpada.

Run: python seed.py
"""

from datetime import datetime, timedelta, timezone
from models import Report, Cluster, Alert, init_db
import random

random.seed(42)  # Reproducible demo data

engine, Session = init_db()


def seed():
    session = Session()

    # Clear existing data
    session.query(Alert).delete()
    session.query(Report).delete()
    session.query(Cluster).delete()
    session.commit()

    now = datetime.now(timezone.utc)

    # ── Clusters ──────────────────────────────────────────────
    clusters = [
        Cluster(
            id='CL-07', crop='Tomato', issue='Early Blight',
            village='Kharpada',
            center_latitude=19.1250, center_longitude=73.4580,
            radius_km=1.7,
            total_reports=14, independent_reports=8,
            confirmed_reports=6, unconfirmed_reports=4,
            duplicate_reports=2, risk_level='high',
            first_detected=now - timedelta(minutes=42),
            created_at=now - timedelta(minutes=42),
            updated_at=now - timedelta(minutes=8),
        ),
        Cluster(
            id='CL-05', crop='Rice', issue='Stem Borer',
            village='Rajapur',
            center_latitude=19.0980, center_longitude=73.4820,
            radius_km=1.2,
            total_reports=9, independent_reports=4,
            confirmed_reports=3, unconfirmed_reports=4,
            duplicate_reports=1, risk_level='watch',
            first_detected=now - timedelta(hours=2),
            created_at=now - timedelta(hours=2),
            updated_at=now - timedelta(minutes=25),
        ),
        Cluster(
            id='CL-03', crop='Cotton', issue='Powdery Mildew',
            village='Dhanori',
            center_latitude=19.1420, center_longitude=73.4350,
            radius_km=0.9,
            total_reports=6, independent_reports=4,
            confirmed_reports=3, unconfirmed_reports=2,
            duplicate_reports=0, risk_level='elevated',
            first_detected=now - timedelta(hours=4),
            created_at=now - timedelta(hours=4),
            updated_at=now - timedelta(minutes=45),
        ),
        Cluster(
            id='CL-01', crop='Soybean', issue='Leaf Curl',
            village='Shivnagar',
            center_latitude=19.1100, center_longitude=73.4150,
            radius_km=0.6,
            total_reports=4, independent_reports=2,
            confirmed_reports=2, unconfirmed_reports=1,
            duplicate_reports=1, risk_level='low',
            first_detected=now - timedelta(hours=6),
            created_at=now - timedelta(hours=6),
            updated_at=now - timedelta(hours=1),
        ),
    ]
    for c in clusters:
        session.add(c)

    # ── Reports ───────────────────────────────────────────────
    reports = []
    report_counter = 1001

    # --- Kharpada (CL-07): 14 total, 8 independent, 6 confirmed, 4 unconfirmed, 2 duplicate ---
    kharpada_base_lat = 19.1250
    kharpada_base_lng = 73.4580

    # 8 Independent reports from distinct fields
    independent_offsets = [
        (0.0000, 0.0000), (0.0045, 0.0030), (-0.0038, 0.0052),
        (0.0062, -0.0041), (-0.0055, -0.0035), (0.0080, 0.0060),
        (-0.0072, 0.0045), (0.0030, -0.0065),
    ]
    for i, (dlat, dlng) in enumerate(independent_offsets):
        t = now - timedelta(minutes=random.randint(8, 42))
        conf = round(0.78 + random.uniform(0, 0.16), 2)
        geo = round(0.80 + random.uniform(0, 0.15), 2)
        temp = round(0.75 + random.uniform(0, 0.18), 2)
        ev = round(conf * geo * temp, 2)
        reports.append(Report(
            id=f'HC-{report_counter}', farmer_name=f'Demo Farmer {report_counter - 1000}',
            crop='Tomato', suspected_issue='Early Blight',
            latitude=round(kharpada_base_lat + dlat, 4),
            longitude=round(kharpada_base_lng + dlng, 4),
            village='Kharpada', image_url=f'/images/tomato_blight_{i+1}.jpg',
            timestamp=t,
            image_confidence=conf, duplicate_similarity=round(random.uniform(0.05, 0.22), 2),
            geographic_independence=geo, temporal_consistency=temp,
            evidence_score=ev,
            verification_status='independent',
            cluster_id='CL-07', status='active', created_at=t,
        ))
        report_counter += 1

    # 4 Unconfirmed (weak/no photo, but from somewhat distinct locations)
    for i in range(4):
        t = now - timedelta(minutes=random.randint(5, 30))
        dlat = random.uniform(-0.003, 0.003)
        dlng = random.uniform(-0.003, 0.003)
        conf = round(random.uniform(0.15, 0.45), 2)
        geo = round(random.uniform(0.40, 0.65), 2)
        temp = round(random.uniform(0.60, 0.80), 2)
        ev = round(conf * geo * temp, 2)
        reports.append(Report(
            id=f'HC-{report_counter}', farmer_name=f'Demo Farmer {report_counter - 1000}',
            crop='Tomato', suspected_issue='Early Blight',
            latitude=round(kharpada_base_lat + dlat, 4),
            longitude=round(kharpada_base_lng + dlng, 4),
            village='Kharpada', image_url='',
            timestamp=t,
            image_confidence=conf, duplicate_similarity=round(random.uniform(0.10, 0.35), 2),
            geographic_independence=geo, temporal_consistency=temp,
            evidence_score=ev,
            verification_status='unconfirmed',
            cluster_id='CL-07', status='active', created_at=t,
        ))
        report_counter += 1

    # 2 Duplicate/panic reports (same location, similar time, high similarity)
    for i in range(2):
        t = now - timedelta(minutes=random.randint(3, 15))
        reports.append(Report(
            id=f'HC-{report_counter}', farmer_name=f'Demo Farmer {report_counter - 1000}',
            crop='Tomato', suspected_issue='Early Blight',
            latitude=round(kharpada_base_lat + random.uniform(-0.0005, 0.0005), 4),
            longitude=round(kharpada_base_lng + random.uniform(-0.0005, 0.0005), 4),
            village='Kharpada',
            image_url=f'/images/tomato_blight_1.jpg',  # Same image as HC-1001
            timestamp=t,
            image_confidence=round(random.uniform(0.70, 0.88), 2),
            duplicate_similarity=round(random.uniform(0.85, 0.95), 2),
            geographic_independence=round(random.uniform(0.08, 0.18), 2),
            temporal_consistency=round(random.uniform(0.50, 0.65), 2),
            evidence_score=round(random.uniform(0.08, 0.18), 2),
            verification_status='duplicate',
            cluster_id='CL-07', status='active', created_at=t,
            notes='Saw the alert and checked my field too' if i == 0 else '',
        ))
        report_counter += 1

    # --- Rajapur (CL-05): 9 total, 4 independent, 3 confirmed, 4 unconfirmed, 1 duplicate ---
    rajapur_base_lat = 19.0980
    rajapur_base_lng = 73.4820

    for i in range(4):
        t = now - timedelta(minutes=random.randint(25, 120))
        dlat = random.uniform(-0.005, 0.005)
        dlng = random.uniform(-0.005, 0.005)
        conf = round(0.72 + random.uniform(0, 0.18), 2)
        geo = round(0.75 + random.uniform(0, 0.20), 2)
        temp = round(0.70 + random.uniform(0, 0.20), 2)
        ev = round(conf * geo * temp, 2)
        reports.append(Report(
            id=f'HC-{report_counter}', farmer_name=f'Demo Farmer {report_counter - 1000}',
            crop='Rice', suspected_issue='Stem Borer',
            latitude=round(rajapur_base_lat + dlat, 4),
            longitude=round(rajapur_base_lng + dlng, 4),
            village='Rajapur', image_url=f'/images/rice_stemborer_{i+1}.jpg',
            timestamp=t,
            image_confidence=conf,
            duplicate_similarity=round(random.uniform(0.05, 0.20), 2),
            geographic_independence=geo, temporal_consistency=temp,
            evidence_score=ev,
            verification_status='independent' if i < 4 else 'confirmed',
            cluster_id='CL-05', status='active', created_at=t,
        ))
        report_counter += 1

    for i in range(4):
        t = now - timedelta(minutes=random.randint(15, 90))
        dlat = random.uniform(-0.002, 0.002)
        dlng = random.uniform(-0.002, 0.002)
        conf = round(random.uniform(0.20, 0.50), 2)
        geo = round(random.uniform(0.30, 0.55), 2)
        temp = round(random.uniform(0.55, 0.75), 2)
        ev = round(conf * geo * temp, 2)
        reports.append(Report(
            id=f'HC-{report_counter}', farmer_name=f'Demo Farmer {report_counter - 1000}',
            crop='Rice', suspected_issue='Stem Borer',
            latitude=round(rajapur_base_lat + dlat, 4),
            longitude=round(rajapur_base_lng + dlng, 4),
            village='Rajapur', image_url='',
            timestamp=t,
            image_confidence=conf,
            duplicate_similarity=round(random.uniform(0.10, 0.30), 2),
            geographic_independence=geo, temporal_consistency=temp,
            evidence_score=ev,
            verification_status='unconfirmed',
            cluster_id='CL-05', status='active', created_at=t,
        ))
        report_counter += 1

    # 1 duplicate
    t = now - timedelta(minutes=random.randint(10, 30))
    reports.append(Report(
        id=f'HC-{report_counter}', farmer_name=f'Demo Farmer {report_counter - 1000}',
        crop='Rice', suspected_issue='Stem Borer',
        latitude=round(rajapur_base_lat + 0.0002, 4),
        longitude=round(rajapur_base_lng - 0.0001, 4),
        village='Rajapur', image_url='/images/rice_stemborer_1.jpg',
        timestamp=t,
        image_confidence=0.74,
        duplicate_similarity=0.91,
        geographic_independence=0.12,
        temporal_consistency=0.58,
        evidence_score=0.11,
        verification_status='duplicate',
        cluster_id='CL-05', status='active', created_at=t,
    ))
    report_counter += 1

    # --- Dhanori (CL-03): 6 total, 4 independent, 3 confirmed, 2 unconfirmed ---
    dhanori_base_lat = 19.1420
    dhanori_base_lng = 73.4350

    for i in range(4):
        t = now - timedelta(minutes=random.randint(45, 240))
        dlat = random.uniform(-0.004, 0.004)
        dlng = random.uniform(-0.004, 0.004)
        conf = round(0.68 + random.uniform(0, 0.22), 2)
        geo = round(0.78 + random.uniform(0, 0.17), 2)
        temp = round(0.72 + random.uniform(0, 0.18), 2)
        ev = round(conf * geo * temp, 2)
        reports.append(Report(
            id=f'HC-{report_counter}', farmer_name=f'Demo Farmer {report_counter - 1000}',
            crop='Cotton', suspected_issue='Powdery Mildew',
            latitude=round(dhanori_base_lat + dlat, 4),
            longitude=round(dhanori_base_lng + dlng, 4),
            village='Dhanori', image_url=f'/images/cotton_mildew_{i+1}.jpg',
            timestamp=t,
            image_confidence=conf,
            duplicate_similarity=round(random.uniform(0.05, 0.18), 2),
            geographic_independence=geo, temporal_consistency=temp,
            evidence_score=ev,
            verification_status='independent' if i < 4 else 'confirmed',
            cluster_id='CL-03', status='active', created_at=t,
        ))
        report_counter += 1

    for i in range(2):
        t = now - timedelta(minutes=random.randint(30, 180))
        dlat = random.uniform(-0.001, 0.001)
        dlng = random.uniform(-0.001, 0.001)
        conf = round(random.uniform(0.18, 0.42), 2)
        geo = round(random.uniform(0.35, 0.55), 2)
        temp = round(random.uniform(0.60, 0.78), 2)
        ev = round(conf * geo * temp, 2)
        reports.append(Report(
            id=f'HC-{report_counter}', farmer_name=f'Demo Farmer {report_counter - 1000}',
            crop='Cotton', suspected_issue='Powdery Mildew',
            latitude=round(dhanori_base_lat + dlat, 4),
            longitude=round(dhanori_base_lng + dlng, 4),
            village='Dhanori', image_url='',
            timestamp=t,
            image_confidence=conf,
            duplicate_similarity=round(random.uniform(0.10, 0.25), 2),
            geographic_independence=geo, temporal_consistency=temp,
            evidence_score=ev,
            verification_status='unconfirmed',
            cluster_id='CL-03', status='active', created_at=t,
        ))
        report_counter += 1

    # --- Shivnagar (CL-01): 4 total, 2 independent, 2 confirmed, 1 unconfirmed, 1 duplicate ---
    shivnagar_base_lat = 19.1100
    shivnagar_base_lng = 73.4150

    for i in range(2):
        t = now - timedelta(hours=random.randint(1, 6))
        dlat = random.uniform(-0.003, 0.003)
        dlng = random.uniform(-0.003, 0.003)
        conf = round(0.70 + random.uniform(0, 0.20), 2)
        geo = round(0.80 + random.uniform(0, 0.15), 2)
        temp = round(0.68 + random.uniform(0, 0.22), 2)
        ev = round(conf * geo * temp, 2)
        reports.append(Report(
            id=f'HC-{report_counter}', farmer_name=f'Demo Farmer {report_counter - 1000}',
            crop='Soybean', suspected_issue='Leaf Curl',
            latitude=round(shivnagar_base_lat + dlat, 4),
            longitude=round(shivnagar_base_lng + dlng, 4),
            village='Shivnagar', image_url=f'/images/soybean_leafcurl_{i+1}.jpg',
            timestamp=t,
            image_confidence=conf,
            duplicate_similarity=round(random.uniform(0.05, 0.18), 2),
            geographic_independence=geo, temporal_consistency=temp,
            evidence_score=ev,
            verification_status='independent',
            cluster_id='CL-01', status='active', created_at=t,
        ))
        report_counter += 1

    # 1 unconfirmed
    t = now - timedelta(hours=random.randint(2, 5))
    reports.append(Report(
        id=f'HC-{report_counter}', farmer_name=f'Demo Farmer {report_counter - 1000}',
        crop='Soybean', suspected_issue='Leaf Curl',
        latitude=round(shivnagar_base_lat + 0.001, 4),
        longitude=round(shivnagar_base_lng - 0.001, 4),
        village='Shivnagar', image_url='',
        timestamp=t,
        image_confidence=0.28,
        duplicate_similarity=0.15,
        geographic_independence=0.52,
        temporal_consistency=0.68,
        evidence_score=0.10,
        verification_status='unconfirmed',
        cluster_id='CL-01', status='active', created_at=t,
    ))
    report_counter += 1

    # 1 duplicate
    t = now - timedelta(hours=random.randint(1, 3))
    reports.append(Report(
        id=f'HC-{report_counter}', farmer_name=f'Demo Farmer {report_counter - 1000}',
        crop='Soybean', suspected_issue='Leaf Curl',
        latitude=round(shivnagar_base_lat + 0.0003, 4),
        longitude=round(shivnagar_base_lng + 0.0002, 4),
        village='Shivnagar', image_url='/images/soybean_leafcurl_1.jpg',
        timestamp=t,
        image_confidence=0.72,
        duplicate_similarity=0.88,
        geographic_independence=0.14,
        temporal_consistency=0.55,
        evidence_score=0.09,
        verification_status='duplicate',
        cluster_id='CL-01', status='active', created_at=t,
    ))
    report_counter += 1

    # --- Unclustered reports (scattered, various crops) ---
    scattered = [
        ('Tomato', 'Leaf Curl', 'Vijaynagar', 19.1350, 73.4700),
        ('Rice', 'Early Blight', 'Panchgani', 19.0850, 73.4450),
        ('Cotton', 'Stem Borer', 'Mandwa', 19.1500, 73.4650),
        ('Soybean', 'Powdery Mildew', 'Ambegaon', 19.1050, 73.4900),
        ('Tomato', 'Powdery Mildew', 'Sangvi', 19.1200, 73.5000),
        ('Rice', 'Leaf Curl', 'Taloja', 19.0900, 73.4100),
        ('Cotton', 'Early Blight', 'Karjat', 19.1600, 73.4200),
        ('Tomato', 'Stem Borer', 'Lonavala', 19.1000, 73.4550),
        ('Soybean', 'Early Blight', 'Wadgaon', 19.1150, 73.4750),
        ('Rice', 'Powdery Mildew', 'Shirwal', 19.0950, 73.4350),
        ('Tomato', 'Early Blight', 'Narayangaon', 19.1280, 73.4620),
        ('Cotton', 'Leaf Curl', 'Junnar', 19.1450, 73.4480),
        ('Soybean', 'Stem Borer', 'Alephata', 19.1080, 73.4280),
        ('Rice', 'Early Blight', 'Manchar', 19.0920, 73.4520),
        ('Tomato', 'Leaf Curl', 'Ozar', 19.1320, 73.4380),
        ('Cotton', 'Powdery Mildew', 'Chakan', 19.1550, 73.4550),
        ('Soybean', 'Leaf Curl', 'Rajgurunagar', 19.1030, 73.4680),
    ]

    for crop, issue, village, lat, lng in scattered:
        t = now - timedelta(hours=random.randint(1, 48))
        has_photo = random.random() > 0.4
        conf = round(random.uniform(0.55, 0.90), 2) if has_photo else round(random.uniform(0.10, 0.30), 2)
        geo = round(random.uniform(0.60, 0.95), 2)
        temp = round(random.uniform(0.55, 0.85), 2)
        dup = round(random.uniform(0.02, 0.25), 2)
        ev = round(conf * geo * temp, 2)
        status = 'independent' if ev > 0.40 and conf > 0.55 else ('confirmed' if conf > 0.50 else 'unconfirmed')

        reports.append(Report(
            id=f'HC-{report_counter}', farmer_name=f'Demo Farmer {report_counter - 1000}',
            crop=crop, suspected_issue=issue,
            latitude=round(lat + random.uniform(-0.003, 0.003), 4),
            longitude=round(lng + random.uniform(-0.003, 0.003), 4),
            village=village,
            image_url=f'/images/{crop.lower()}_{issue.lower().replace(" ", "_")}_{random.randint(1,3)}.jpg' if has_photo else '',
            timestamp=t,
            image_confidence=conf,
            duplicate_similarity=dup,
            geographic_independence=geo,
            temporal_consistency=temp,
            evidence_score=ev,
            verification_status=status,
            cluster_id=None,
            created_at=t,
        ))
        report_counter += 1

    for r in reports:
        session.add(r)

    # ── Alerts ────────────────────────────────────────────────
    alerts = [
        Alert(
            cluster_id='CL-07', severity='high',
            title='Early Blight detected — Kharpada Village',
            message='8 independent reports with 6 photo-confirmed across 3 distinct field zones within 1.7 km radius. Field verification recommended.',
            status='active',
            created_at=now - timedelta(minutes=8),
        ),
        Alert(
            cluster_id='CL-07', severity='elevated',
            title='Cluster CL-07 crossed independent evidence threshold',
            message='Growing geographically distributed evidence of Early Blight in Kharpada. 6 independent reports detected.',
            status='active',
            created_at=now - timedelta(minutes=18),
        ),
        Alert(
            cluster_id='CL-07', severity='watch',
            title='New geographically distinct report detected',
            message='A new report from a distinct field location has been added to cluster CL-07 in Kharpada.',
            status='active',
            created_at=now - timedelta(minutes=28),
        ),
        Alert(
            cluster_id='CL-03', severity='elevated',
            title='Powdery Mildew evidence growing — Dhanori',
            message='4 independent reports detected in Dhanori area. Cluster CL-03 upgraded to elevated risk.',
            status='active',
            created_at=now - timedelta(minutes=45),
        ),
        Alert(
            cluster_id='CL-05', severity='watch',
            title='Stem Borer reports clustering — Rajapur',
            message='Multiple reports of Stem Borer in Rajapur area. 4 independent reports, but insufficient evidence for elevated status.',
            status='active',
            created_at=now - timedelta(hours=1),
        ),
        Alert(
            cluster_id='CL-01', severity='low',
            title='Initial reports — Leaf Curl in Shivnagar',
            message='Small number of Leaf Curl reports in Shivnagar. Monitoring for additional evidence.',
            status='active',
            created_at=now - timedelta(hours=3),
        ),
    ]
    for a in alerts:
        session.add(a)

    session.commit()
    session.close()

    print(f'[OK] Seeded {len(reports)} reports, {len(clusters)} clusters, {len(alerts)} alerts')


if __name__ == '__main__':
    seed()
