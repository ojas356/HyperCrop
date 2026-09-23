import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import ReportConfirmation from './pages/ReportConfirmation';
import Reports from './pages/Reports';
import ReportDetails from './pages/ReportDetails';
import Clusters from './pages/Clusters';
import Alerts from './pages/Alerts';
import 'leaflet/dist/leaflet.css';

// Wraps officer-only routes — redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public — farmer-facing */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/report" element={<ReportIssue />} />
          <Route path="/report/confirmation/:id" element={<ReportConfirmation />} />

          {/* Protected — officer-only */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div className="flex flex-col h-screen">
                <Navbar /><Dashboard />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/reports" element={
            <ProtectedRoute>
              <div className="flex flex-col h-screen">
                <Navbar /><Reports />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/report/:id" element={
            <ProtectedRoute>
              <div className="flex flex-col h-screen">
                <Navbar /><ReportDetails />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/clusters" element={
            <ProtectedRoute>
              <div className="flex flex-col h-screen">
                <Navbar /><Clusters />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/alerts" element={
            <ProtectedRoute>
              <div className="flex flex-col h-screen">
                <Navbar /><Alerts />
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
