# HyperCrop

A hyperlocal crop outbreak detection platform. Farmers submit pest/disease reports with photos and GPS; the app clusters them geographically and scores each one by evidence quality — not just report count — to surface real outbreaks without noise.

![Stack](https://img.shields.io/badge/React-19-blue) ![Stack](https://img.shields.io/badge/Flask-3.1-green) ![Stack](https://img.shields.io/badge/SQLite-gray)

---

## Stack

- **Frontend** — React 19, Vite 8, Tailwind CSS v4, Leaflet, Recharts
- **Backend** — Flask 3, SQLAlchemy 2, SQLite

---

## Running locally

**Backend**
```bash
cd backend
pip install -r requirements.txt
python seed.py   # optional: loads demo data
python app.py    # http://localhost:5000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev      # http://localhost:5173
```

> The frontend falls back to bundled demo data if the backend isn't running, so you can explore the UI without setting up anything.

---

## How it works

Each submitted report gets scored across four dimensions:

| Metric | What it measures |
|--------|-----------------|
| Photo confidence | Whether a photo exists and how clear it is |
| Geographic independence | How far the report is from others in the same cluster |
| Temporal consistency | Whether reports arrived in a natural spread |
| Duplicate similarity | Whether the photo looks like an existing report |

Those scores combine into a single **evidence score** and a verification status: `independent`, `confirmed`, `unconfirmed`, `similar`, or `duplicate`. Cluster risk (`low` → `watch` → `elevated` → `high`) is derived from independent report counts, not totals.

> The scoring functions are rule-based prototypes. Each one is annotated with what to replace it with in production (vision model, CLIP embeddings, DBSCAN, PostGIS).

---

## API

Base URL: `http://localhost:5000/api`

```
GET  /reports              list all reports
GET  /reports/:id          single report
POST /reports              submit a report (triggers evidence scoring)
GET  /clusters             list clusters
GET  /clusters/:id         single cluster
GET  /alerts               alert feed
GET  /dashboard/stats      KPI summary
```

---

## Project layout

```
HyperCorp/
├── backend/
│   ├── app.py
│   ├── models.py          # Report, Cluster, Alert
│   ├── seed.py
│   ├── routes/            # reports, clusters, alerts, dashboard, analyse
│   └── utils/
│       ├── evidence.py    # scoring + classification logic
│       └── clustering.py
└── frontend/
    └── src/
        ├── pages/         # Dashboard, Reports, ReportDetails, Clusters, Alerts, ReportIssue
        ├── components/    # MapView, FilterPanel, EvidencePanel, KpiCard, ...
        ├── services/api.js
        └── utils/         # evidenceScore, filters, clustering, duplicateDetection
```
