import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera, MapPin, Upload, Loader2, Radio, AlertCircle,
  ShieldCheck, RefreshCw, CheckCircle2, HelpCircle, Leaf,
} from 'lucide-react';

// These match what the current trained model can detect
const CROPS = ['Tomato', 'Potato', 'Pepper'];

// Manual override options — covers all classes in the current model
const ISSUES = [
  'Early Blight', 'Late Blight', 'Bacterial Spot',
  'Leaf Mold', 'Septoria Leaf Spot', 'Spider Mites',
  'Target Spot', 'Leaf Curl Virus', 'Mosaic Virus',
  'Healthy', 'Other / Unsure',
];

const API_BASE = 'http://localhost:5000/api';

function generateTrackingNumber() {
  return `HC-${1001 + Math.floor(Math.random() * 9000)}`;
}

async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const d = await r.json();
    const a = d.address || {};
    return a.village || a.hamlet || a.suburb || a.town || a.city || a.county || 'Unknown location';
  } catch {
    return 'Unknown location';
  }
}

// Confidence pill colour
function confidenceColor(conf) {
  if (conf >= 0.80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (conf >= 0.55) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-red-700 bg-red-50 border-red-200';
}

export default function ReportIssue() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ crop: '', notes: '' });
  const [imageFile, setImageFile]     = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting]   = useState(false);

  // CNN analysis state
  const [analysis, setAnalysis] = useState(null);
  // { crop, issue, confidence, is_healthy, top5, model_used, fallback_reason }
  const [analysing, setAnalysing]     = useState(false);
  const [analyseError, setAnalyseError] = useState('');
  const [override, setOverride]       = useState(false); // farmer chose to override

  // Location state
  const [location, setLocation] = useState({
    status: 'idle', lat: null, lng: null, village: '', error: '',
  });

  // Request GPS on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(l => ({ ...l, status: 'error', error: 'GPS not supported on this device.' }));
      return;
    }
    setLocation(l => ({ ...l, status: 'loading' }));
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        const village = await reverseGeocode(lat, lng);
        setLocation({ status: 'ok', lat, lng, village, error: '' });
      },
      (err) => {
        const msg =
          err.code === 1 ? 'Location permission denied. Please allow location access and reload.'
          : err.code === 2 ? 'Location unavailable. Check your GPS signal.'
          : 'Location request timed out.';
        setLocation({ status: 'error', lat: null, lng: null, village: '', error: msg });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // ── Auto-analyse whenever a new image is selected ──────────────────────
  const runAnalysis = async (file) => {
    if (!file) return;
    setAnalysis(null);
    setAnalyseError('');
    setOverride(false);
    setAnalysing(true);

    try {
      const body = new FormData();
      body.append('image', file);

      const res = await fetch(`${API_BASE}/analyse-image`, {
        method: 'POST',
        body,
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const data = await res.json();
      setAnalysis(data);

      // Auto-fill crop if the CNN detected one and farmer hasn't picked yet
      if (data.crop && !form.crop) {
        const matched = CROPS.find(c => c.toLowerCase() === data.crop.toLowerCase());
        if (matched) setForm(f => ({ ...f, crop: matched }));
      }
    } catch (err) {
      // Backend unreachable — use client-side fallback
      setAnalysis({
        model_used: false,
        crop: null,
        issue: null,
        confidence: 0.75,
        is_healthy: null,
        top5: [],
        fallback_reason: 'Backend offline — manual issue selection required.',
      });
      setAnalyseError('');
      setOverride(true); // force manual selection in offline mode
    } finally {
      setAnalysing(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setImageFile(file);
    runAnalysis(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    setAnalysis(null);
    setAnalyseError('');
    setOverride(false);
  };

  // Resolved issue: override selection or CNN result
  const resolvedIssue = override
    ? (form.overrideIssue || '')
    : (analysis?.issue || '');

  const canSubmit =
    form.crop &&
    resolvedIssue &&
    !submitting &&
    !analysing;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    const trackingId = generateTrackingNumber();

    const report = {
      id: trackingId,
      crop: form.crop,
      suspectedIssue: resolvedIssue,
      notes: form.notes,
      imagePreview: imagePreview || null,
      hasPhoto: !!imageFile,
      latitude: location.lat,
      longitude: location.lng,
      village: location.village || 'Unknown',
      timestamp: new Date().toISOString(),
      // Evidence
      imageConfidence: analysis?.confidence ?? (imageFile ? 0.75 : 0.15),
      evidenceScore: analysis?.confidence ? analysis.confidence * 0.6 : 0.10,
      verificationStatus: 'unconfirmed',
      status: 'pending',
      // CNN
      cnnAnalysis: analysis || null,
    };

    try {
      const existing = JSON.parse(localStorage.getItem('hc_my_reports') || '[]');
      existing.unshift(report);
      localStorage.setItem('hc_my_reports', JSON.stringify(existing));
    } catch { /* ignore */ }

    setTimeout(() => navigate(`/report/confirmation/${trackingId}`), 600);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Minimal header */}
      <header className="bg-white border-b border-slate-200 h-14 flex items-center px-5 gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
          <Radio className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-bold text-slate-900 tracking-tight">HyperCrop</span>
        <span className="text-slate-300 text-sm ml-1">/</span>
        <span className="text-[13px] text-slate-500">Report an Issue</span>
      </header>

      <div className="flex items-start justify-center p-6 pt-10">
        <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full">
          <div className="p-6 border-b border-slate-100">
            <h1 className="text-xl font-bold text-slate-900">Report a Crop Issue</h1>
            <p className="text-[13px] text-slate-400 mt-1">
              Take a photo — our AI will identify the issue automatically.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">

            {/* ── Photo upload (first, most important) ── */}
            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                Photo of Affected Crop{' '}
                <span className="text-[11px] font-normal text-emerald-600">
                  (AI will detect the disease)
                </span>
              </label>

              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden border border-slate-200">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-white/90 rounded-md px-2 py-1 text-[11px]
                               font-medium text-slate-600 hover:bg-white transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed
                                  border-slate-200 rounded-lg cursor-pointer hover:border-emerald-300
                                  hover:bg-emerald-50/30 transition-colors">
                  <Camera className="w-8 h-8 text-slate-300 mb-2" />
                  <span className="text-[13px] font-medium text-slate-500">Take a photo</span>
                  <span className="text-[11px] text-slate-400 mt-0.5">or upload from device</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>

            {/* ── CNN Analysis result card ── */}
            {imageFile && (
              <div className={`rounded-lg border p-4 transition-all
                ${analysing ? 'bg-slate-50 border-slate-200'
                  : analysis?.model_used ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-amber-50 border-amber-200'}`}
              >
                {analysing && (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 text-slate-500 animate-spin shrink-0" />
                    <div>
                      <div className="text-[13px] font-semibold text-slate-700">
                        Analysing image…
                      </div>
                      <div className="text-[11px] text-slate-400">
                        CNN model identifying crop disease
                      </div>
                    </div>
                  </div>
                )}

                {!analysing && analysis && !override && (
                  <>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        {analysis.model_used ? (
                          <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                        ) : (
                          <HelpCircle className="w-5 h-5 text-amber-500 shrink-0" />
                        )}
                        <div>
                          <div className="text-[13px] font-semibold text-slate-800">
                            {analysis.model_used
                              ? 'AI Detection Result'
                              : 'Model offline — select manually'}
                          </div>
                          {analysis.fallback_reason && (
                            <div className="text-[11px] text-amber-600">
                              {analysis.fallback_reason}
                            </div>
                          )}
                        </div>
                      </div>
                      {analysis.model_used && (
                        <span className={`text-[11px] font-bold border rounded-full px-2 py-0.5 shrink-0
                          ${confidenceColor(analysis.confidence)}`}
                        >
                          {Math.round(analysis.confidence * 100)}% confident
                        </span>
                      )}
                    </div>

                    {analysis.model_used && (
                      <>
                        <div className="flex gap-4 mb-3">
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                              Crop
                            </div>
                            <div className="text-[14px] font-bold text-slate-900 flex items-center gap-1.5">
                              <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                              {analysis.crop}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                              Detected Issue
                            </div>
                            <div className="text-[14px] font-bold text-slate-900">
                              {analysis.is_healthy
                                ? <span className="text-emerald-600">Plant looks healthy ✓</span>
                                : analysis.issue
                              }
                            </div>
                          </div>
                        </div>

                        {/* Top 3 alternatives */}
                        {analysis.top5?.length > 1 && (
                          <div className="mb-3">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              Other possibilities
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {analysis.top5.slice(1, 4).map((t, i) => (
                                <button
                                  type="button"
                                  key={i}
                                  onClick={() => {
                                    setAnalysis(a => ({ ...a, issue: t.issue, crop: t.crop, confidence: t.confidence }));
                                    const matched = CROPS.find(c => c.toLowerCase() === t.crop.toLowerCase());
                                    if (matched) setForm(f => ({ ...f, crop: matched }));
                                  }}
                                  className="text-[11px] border border-slate-200 rounded-full px-2.5 py-1
                                             bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700
                                             transition-colors"
                                >
                                  {t.issue} ({Math.round(t.confidence * 100)}%)
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => setOverride(true)}
                      className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-700
                                 font-medium transition-colors mt-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Not right? Select manually
                    </button>
                  </>
                )}

                {/* Manual override picker */}
                {!analysing && override && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[13px] font-semibold text-slate-700">
                        Select the issue manually
                      </div>
                      {analysis?.model_used && (
                        <button
                          type="button"
                          onClick={() => { setOverride(false); setForm(f => ({ ...f, overrideIssue: '' })); }}
                          className="text-[11px] text-emerald-600 font-medium hover:underline"
                        >
                          ← Use AI result
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ISSUES.map(issue => (
                        <button
                          type="button"
                          key={issue}
                          onClick={() => setForm(f => ({ ...f, overrideIssue: issue }))}
                          className={`text-[12px] font-medium rounded-full border py-1.5 px-3 transition-colors
                            ${form.overrideIssue === issue
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                        >
                          {issue}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Crop selector ── */}
            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                Select Crop <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CROPS.map(crop => (
                  <button
                    type="button"
                    key={crop}
                    onClick={() => setForm(f => ({ ...f, crop }))}
                    className={`text-[13px] font-medium rounded-lg border py-2.5 px-3 transition-colors
                      ${form.crop === crop
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                  >
                    {form.crop === crop && (
                      <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 text-emerald-500" />
                    )}
                    {crop}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Location ── */}
            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                Your Location
              </label>
              <div className={`rounded-lg p-3 flex items-center gap-3 border
                ${location.status === 'ok' ? 'bg-slate-50 border-slate-200'
                  : location.status === 'error' ? 'bg-red-50 border-red-200'
                  : 'bg-slate-50 border-slate-200'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
                  ${location.status === 'ok' ? 'bg-emerald-50'
                    : location.status === 'error' ? 'bg-red-50' : 'bg-slate-100'}`}
                >
                  {location.status === 'error' ? <AlertCircle className="w-4 h-4 text-red-500" />
                    : location.status === 'loading' ? <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                    : <MapPin className="w-4 h-4 text-emerald-500" />}
                </div>
                <div>
                  {location.status === 'loading' && (
                    <><div className="text-[13px] font-medium text-slate-500">Detecting location…</div>
                    <div className="text-[11px] text-slate-400">Allow location access if prompted</div></>
                  )}
                  {location.status === 'ok' && (
                    <><div className="text-[13px] font-medium text-slate-700">{location.village}</div>
                    <div className="text-[11px] text-slate-400">
                      {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
                    </div></>
                  )}
                  {location.status === 'error' && (
                    <><div className="text-[13px] font-medium text-red-700">Location unavailable</div>
                    <div className="text-[11px] text-red-500">{location.error}</div></>
                  )}
                  {location.status === 'idle' && (
                    <div className="text-[13px] text-slate-400">Waiting for GPS…</div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Notes ── */}
            <div>
              <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">
                Notes{' '}
                <span className="text-[11px] font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Any additional details about the issue…"
                rows={3}
                className="w-full text-[13px] border border-slate-200 rounded-lg px-3 py-2.5
                           focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400
                           resize-none text-slate-700 placeholder:text-slate-300"
              />
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-semibold
                         hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Processing…</>
              ) : (
                <><Upload className="w-4 h-4" />Submit Report</>
              )}
            </button>

            {!canSubmit && !submitting && imageFile && !analysing && (
              <p className="text-center text-[11px] text-slate-400">
                {!form.crop && 'Select a crop. '}
                {!resolvedIssue && 'An issue must be identified or selected.'}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
