import { useState } from 'react';
import { Camera, MapPin, Upload, CheckCircle2, Loader2 } from 'lucide-react';

const CROPS = ['Tomato', 'Rice', 'Cotton', 'Soybean'];
const ISSUES = ['Early Blight', 'Leaf Curl', 'Stem Borer', 'Powdery Mildew', 'Other / Unsure'];

export default function ReportIssue() {
  const [step, setStep] = useState('form'); // 'form' | 'submitting' | 'done'
  const [form, setForm] = useState({
    crop: '',
    issue: '',
    image: null,
    imagePreview: '',
    notes: '',
  });

  // Simulated location
  const location = {
    village: 'Kharpada Village',
    lat: 19.1250 + (Math.random() * 0.01 - 0.005),
    lng: 73.4580 + (Math.random() * 0.01 - 0.005),
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setForm(f => ({ ...f, image: file, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.crop || !form.issue) return;
    setStep('submitting');
    setTimeout(() => setStep('done'), 1500);
  };

  if (step === 'done') {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-8 max-w-md w-full text-center animate-scale-in">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Report received</h2>
          <p className="text-[14px] text-slate-500 mb-4 leading-relaxed">
            Your report has been added to the local evidence network.
          </p>
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Evidence status</div>
            <div className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[13px] font-semibold text-slate-600">Pending verification</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              AI-assisted analysis and duplicate check will process shortly.
            </p>
          </div>
          <button
            onClick={() => { setStep('form'); setForm({ crop: '', issue: '', image: null, imagePreview: '', notes: '' }); }}
            className="w-full bg-emerald-600 text-white rounded-lg py-2.5 text-sm font-semibold
                       hover:bg-emerald-700 transition-colors"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-900">Report a Crop Issue</h1>
          <p className="text-[13px] text-slate-400 mt-1">Submit a report to the local evidence network</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Crop */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Select Crop</label>
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
                  {crop}
                </button>
              ))}
            </div>
          </div>

          {/* Photo */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Add Photo</label>
            {form.imagePreview ? (
              <div className="relative rounded-lg overflow-hidden border border-slate-200">
                <img src={form.imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, image: null, imagePreview: '' }))}
                  className="absolute top-2 right-2 bg-white/90 rounded-md px-2 py-1 text-[11px] font-medium
                             text-slate-600 hover:bg-white transition-colors"
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

          {/* Issue */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Suspected Issue</label>
            <div className="flex flex-wrap gap-2">
              {ISSUES.map(issue => (
                <button
                  type="button"
                  key={issue}
                  onClick={() => setForm(f => ({ ...f, issue }))}
                  className={`text-[12px] font-medium rounded-full border py-1.5 px-3 transition-colors
                    ${form.issue === issue
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                >
                  {issue}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Location</label>
            <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-3 border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <div className="text-[13px] font-medium text-slate-700">Location detected</div>
                <div className="text-[11px] text-slate-400">
                  {location.village} · {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[12px] font-semibold text-slate-600 mb-1.5">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Any additional details about the issue..."
              rows={3}
              className="w-full text-[13px] border border-slate-200 rounded-lg px-3 py-2.5
                         focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400
                         resize-none text-slate-700 placeholder:text-slate-300"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!form.crop || !form.issue || step === 'submitting'}
            className="w-full bg-emerald-600 text-white rounded-lg py-3 text-sm font-semibold
                       hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
          >
            {step === 'submitting' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Submit Report
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
