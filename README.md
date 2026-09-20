# HyperCrop

Hyperlocal agricultural outbreak intelligence — a prototype platform that detects and tracks crop pest and disease outbreaks at village level by scoring the **quality of evidence**, not just the volume of reports.

## The Problem

District-level alert systems aggregate data too coarsely, missing village-scale outbreaks until they spread. And once an alert goes out, they get flooded with duplicate "panic reports" that inflate risk numbers without adding real information.

HyperCrop's core idea: **count independent evidence, not reports**. Every farmer submission is scored across four dimensions — photo confidence, geographic independence, temporal consistency, and duplicate similarity — then classified accordingly. Risk levels are only escalated when there's sufficient *independent*, photo-confirmed evidence from geographically distinct fields.

---

## Features

- **Interactive outbreak map** — Leaflet-based map with cluster circles (color-coded by risk level) and individual report markers (color-coded by verification status). Filters apply live across the map, KPI strip, and cluster list simultaneously.
- **Evidence scoring pipeline** — each report gets a composite evidence score: `photo_confidence × geographic_independence × temporal_consistency × verification_weight`. Classification into `independent`, `confirmed`, `unconfirmed`, `similar`, or `duplicate`.
- **Cluster risk classification** — risk level (`low`, `watch`, `elevated`, `high`) is derived from counts of independent/confirmed evidence, not total reports.
- **Report submission** — form for farmers to submit pest/disease sightings with photo, GPS, crop type, and suspected issue. Evidence metrics are computed on the backend at submission time.
- **Report detail view** — deep-dive per report showing all four evidence metric bars, classification reasoning, and cluster relationship.
- **Alerts feed** — active notifications tied to clusters, sorted by severity and recency.
- **Demo mode** — the frontend falls back seamlessly to bundled static data if the Flask backend is unreachable. No backend required to explore the app.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, React Router DOM v7 |
| Styling | Tailwind CSS v4 (via Vite plugin, no config file) |
| Map | Leaflet 1.9, React-Leaflet v5 |
| Charts | Recharts v3 |
| Icons | Lucide React |
| Linter | oxlint (Rust-based, replaces ESLint) |
| Backend | Python, Flask 3.1.1, Flask-CORS 5.0.1 |
| ORM | SQLAlchemy 2.0.36 |
| Database | SQLite (`backend/hypercrop.db`) |

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+

### Backend

```bash
cd backend
pip install -r requirements.txt

# Optional: seed the database with demo data (~50 reports, 4 clusters, 6 alerts)
python seed.py

# Start the API server on http://localhost:5000
python app.py
```

Health check: `GET http://localhost:5000/api/health`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. If the backend isn't running, the app automatically uses built-in demo data — no configuration needed.

---

## API Reference

All routes are prefixed with `/api`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/reports` | List all reports |
| `GET` | `/reports/<id>` | Get a single report |
| `POST` | `/reports` | Submit a new report (runs evidence scoring) |
| `GET` | `/clusters` | List all clusters |
| `GET` | `/clusters/<id>` | Get a single cluster with its reports |
| `GET` | `/alerts` | List all alerts (newest first) |
| `GET` | `/dashboard/stats` | Aggregated KPI stats |

**POST `/api/reports` request body:**
```json
{
  "farmerName": "Demo Farmer",
  "crop": "tomato",
  "suspectedIssue": "early blight",
  "latitude": 19.1250,
  "longitude": 73.4580,
  "village": "Kharpada",
  "imageUrl": "https://...",
  "notes": "Optional field notes"
}
```

---

## Evidence Scoring

The scoring pipeline runs on both the backend (live mode) and frontend (demo mode fallback):

```
Evidence Score = photo_confidence × geographic_independence × temporal_consistency × verification_weight
```

| Metric | Range | Notes |
|--------|-------|-------|
| `image_confidence` | 0.15 – 0.94 | 0.15 if no photo; 0.70–0.94 with photo |
| `geographic_independence` | 0.10 – 0.95 | Based on Haversine distance to nearest cluster report |
| `temporal_consistency` | 0.70 – 0.94 | Prototype: deterministic; production: temporal spread model |
| `duplicate_similarity` | 0.0 – 1.0 | Prototype: hash-based; production: CLIP embeddings |

**Verification status thresholds:**

| Status | Condition |
|--------|-----------|
| `duplicate` | `duplicate_similarity > 0.85` |
| `similar` | `duplicate_similarity > 0.60` |
| `unconfirmed` | `image_confidence < 0.30` |
| `independent` | `evidence_score > 0.60` AND `image_confidence > 0.70` |
| `confirmed` | `image_confidence > 0.50` |

**Cluster risk levels:**

| Risk | Condition |
|------|-----------|
| `high` | ≥ 6 independent + ≥ 4 confirmed + avg evidence > 0.55 |
| `elevated` | ≥ 4 independent + avg evidence > 0.45 |
| `watch` | ≥ 2 independent OR ≥ 5 total reports |
| `low` | Otherwise |

> **Note:** All scoring functions are explicitly prototypes. Comments in `backend/utils/evidence.py` document where each function should be replaced with production ML inference (vision model for image confidence, CLIP embeddings for duplicate detection, DBSCAN + PostGIS for geographic clustering).

---

## Project Structure

```
HyperCorp/
├── backend/
│   ├── app.py                  # Flask app factory, blueprint registration, CORS
│   ├── models.py               # SQLAlchemy models: Report, Cluster, Alert
│   ├── seed.py                 # Demo dataset seeder
│   ├── requirements.txt
│   ├── hypercrop.db            # SQLite file (auto-created on first run)
│   ├── routes/
│   │   ├── reports.py          # Report CRUD + evidence scoring on POST
│   │   ├── clusters.py         # Cluster read endpoints
│   │   ├── alerts.py           # Alert feed
│   │   └── dashboard.py        # KPI aggregation
│   └── utils/
│       ├── evidence.py         # Scoring, classification, and Haversine logic
│       └── clustering.py       # Prototype greedy cluster detection
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx             # Route definitions (7 routes)
        ├── pages/
        │   ├── Landing.jsx     # Explainer / pipeline overview
        │   ├── Dashboard.jsx   # Map + KPIs + filters (main view)
        │   ├── ReportIssue.jsx # Farmer submission form
        │   ├── Reports.jsx     # Report list table
        │   ├── ReportDetails.jsx # Single report deep-dive
        │   ├── Clusters.jsx    # Cluster list
        │   └── Alerts.jsx      # Alert feed
        ├── components/         # MapView, FilterPanel, EvidencePanel, KpiCard, etc.
        ├── services/
        │   └── api.js          # API client with 3s timeout + demo data fallback
        ├── data/               # Bundled demo data (demoReports, demoClusters, demoAlerts)
        └── utils/
            ├── evidenceScore.js     # Mirrors backend scoring logic for demo mode
            ├── clustering.js        # Map display helpers (colors, radius, risk metadata)
            ├── duplicateDetection.js # Duplicate check + classification explanation text
            └── filters.js           # Filter functions, KPI computation, filter option constants
```

---

## Demo Dataset

Running `python seed.py` creates a realistic multi-cluster outbreak scenario:

| Cluster | Crop | Issue | Risk | Independent Reports |
|---------|------|-------|------|---------------------|
| CL-07 Kharpada | Tomato | Early Blight | **High** | 8 of 14 |
| CL-03 Dhanori | Cotton | Powdery Mildew | **Elevated** | 4 of 6 |
| CL-05 Rajapur | Rice | Stem Borer | **Watch** | 4 of 9 |
| CL-01 Shivnagar | Soybean | Leaf Curl | Low | 2 of 4 |

Plus 17 unclustered scattered reports and 6 active alerts across all clusters.

---

## Available Commands

### Backend
| Command | Description |
|---------|-------------|
| `python app.py` | Start Flask dev server on port 5000 |
| `python seed.py` | Seed database with demo data |

### Frontend
| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run oxlint |

---

## Prototype Status

This is a hackathon prototype. The following components are explicitly flagged for replacement in production:

- **Image confidence** → replace hash-based heuristic with a fine-tuned crop disease vision model
- **Duplicate detection** → replace string-comparison with CLIP embedding cosine similarity
- **Temporal consistency** → replace deterministic hash with real temporal spread analysis
- **Geographic clustering** → replace greedy distance grouping with DBSCAN + PostGIS
- **Database** → replace SQLite with PostgreSQL + PostGIS for spatial queries at scale
