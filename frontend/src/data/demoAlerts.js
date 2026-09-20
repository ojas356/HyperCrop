/**
 * HyperCrop — Demo Alerts Data
 * Alert timeline entries linked to clusters.
 * DEMO DATASET.
 */

const now = new Date();
const mins = (m) => new Date(now.getTime() - m * 60000).toISOString();
const hrs = (h) => new Date(now.getTime() - h * 3600000).toISOString();

const demoAlerts = [
  {
    id: 1,
    clusterId: 'CL-07',
    severity: 'high',
    title: 'Early Blight detected — Kharpada Village',
    message: '8 independent reports with 6 photo-confirmed across 3 distinct field zones within 1.7 km radius. Field verification recommended.',
    status: 'active',
    createdAt: mins(8),
  },
  {
    id: 2,
    clusterId: 'CL-07',
    severity: 'elevated',
    title: 'Cluster CL-07 crossed independent evidence threshold',
    message: 'Growing geographically distributed evidence of Early Blight in Kharpada. 6 independent reports detected.',
    status: 'active',
    createdAt: mins(18),
  },
  {
    id: 3,
    clusterId: 'CL-07',
    severity: 'watch',
    title: 'New geographically distinct report detected',
    message: 'A new report from a distinct field location has been added to cluster CL-07 in Kharpada.',
    status: 'active',
    createdAt: mins(28),
  },
  {
    id: 4,
    clusterId: 'CL-03',
    severity: 'elevated',
    title: 'Powdery Mildew evidence growing — Dhanori',
    message: '4 independent reports detected in Dhanori area. Cluster CL-03 upgraded to elevated risk.',
    status: 'active',
    createdAt: mins(45),
  },
  {
    id: 5,
    clusterId: 'CL-05',
    severity: 'watch',
    title: 'Stem Borer reports clustering — Rajapur',
    message: 'Multiple reports of Stem Borer in Rajapur area. 4 independent reports, but insufficient evidence for elevated status.',
    status: 'active',
    createdAt: hrs(1),
  },
  {
    id: 6,
    clusterId: 'CL-01',
    severity: 'low',
    title: 'Initial reports — Leaf Curl in Shivnagar',
    message: 'Small number of Leaf Curl reports in Shivnagar. Monitoring for additional evidence.',
    status: 'active',
    createdAt: hrs(3),
  },
];

export default demoAlerts;
