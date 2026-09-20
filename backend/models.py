"""
HyperCrop Database Models
SQLAlchemy models for Report, Cluster, and Alert entities.
"""

from datetime import datetime, timezone
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

Base = declarative_base()


class Report(Base):
    __tablename__ = 'reports'

    id = Column(String(20), primary_key=True)  # e.g. HC-1042
    farmer_name = Column(String(100), default='Demo Farmer')
    crop = Column(String(50), nullable=False)
    suspected_issue = Column(String(100), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    village = Column(String(100), nullable=False)
    image_url = Column(String(500), default='')
    notes = Column(Text, default='')
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # AI-assisted analysis scores (prototype — replace with real ML inference)
    image_confidence = Column(Float, default=0.5)
    duplicate_similarity = Column(Float, default=0.0)
    geographic_independence = Column(Float, default=0.5)
    temporal_consistency = Column(Float, default=0.5)
    evidence_score = Column(Float, default=0.5)

    # Classification
    verification_status = Column(String(30), default='unconfirmed')
    # Possible: independent, confirmed, unconfirmed, similar, duplicate
    status = Column(String(20), default='active')

    # Cluster association
    cluster_id = Column(String(20), ForeignKey('clusters.id'), nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'farmerName': self.farmer_name,
            'crop': self.crop,
            'suspectedIssue': self.suspected_issue,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'village': self.village,
            'imageUrl': self.image_url,
            'notes': self.notes,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'imageConfidence': self.image_confidence,
            'duplicateSimilarity': self.duplicate_similarity,
            'geographicIndependence': self.geographic_independence,
            'temporalConsistency': self.temporal_consistency,
            'evidenceScore': self.evidence_score,
            'verificationStatus': self.verification_status,
            'status': self.status,
            'clusterId': self.cluster_id,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


class Cluster(Base):
    __tablename__ = 'clusters'

    id = Column(String(20), primary_key=True)  # e.g. CL-07
    crop = Column(String(50), nullable=False)
    issue = Column(String(100), nullable=False)
    village = Column(String(100), nullable=False)
    center_latitude = Column(Float, nullable=False)
    center_longitude = Column(Float, nullable=False)
    radius_km = Column(Float, default=1.0)

    total_reports = Column(Integer, default=0)
    independent_reports = Column(Integer, default=0)
    confirmed_reports = Column(Integer, default=0)
    unconfirmed_reports = Column(Integer, default=0)
    duplicate_reports = Column(Integer, default=0)

    risk_level = Column(String(20), default='low')
    # Possible: low, watch, elevated, high

    first_detected = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    reports = relationship('Report', backref='cluster', lazy='dynamic')

    def to_dict(self):
        return {
            'id': self.id,
            'crop': self.crop,
            'issue': self.issue,
            'village': self.village,
            'centerLatitude': self.center_latitude,
            'centerLongitude': self.center_longitude,
            'radiusKm': self.radius_km,
            'totalReports': self.total_reports,
            'independentReports': self.independent_reports,
            'confirmedReports': self.confirmed_reports,
            'unconfirmedReports': self.unconfirmed_reports,
            'duplicateReports': self.duplicate_reports,
            'riskLevel': self.risk_level,
            'firstDetected': self.first_detected.isoformat() if self.first_detected else None,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None,
        }


class Alert(Base):
    __tablename__ = 'alerts'

    id = Column(Integer, primary_key=True, autoincrement=True)
    cluster_id = Column(String(20), ForeignKey('clusters.id'), nullable=False)
    severity = Column(String(20), nullable=False)  # low, watch, elevated, high
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(20), default='active')
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    cluster = relationship('Cluster', backref='alerts')

    def to_dict(self):
        return {
            'id': self.id,
            'clusterId': self.cluster_id,
            'severity': self.severity,
            'title': self.title,
            'message': self.message,
            'status': self.status,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
        }


def init_db(db_path='hypercrop.db'):
    """Initialize the database and return engine + session."""
    engine = create_engine(f'sqlite:///{db_path}', echo=False)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    return engine, Session
