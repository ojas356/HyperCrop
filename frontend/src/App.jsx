import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import Reports from './pages/Reports';
import ReportDetails from './pages/ReportDetails';
import Clusters from './pages/Clusters';
import Alerts from './pages/Alerts';
import 'leaflet/dist/leaflet.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<><Navbar /><Dashboard /></>} />
        <Route path="/report" element={<><Navbar /><ReportIssue /></>} />
        <Route path="/reports" element={<><Navbar /><Reports /></>} />
        <Route path="/report/:id" element={<><Navbar /><ReportDetails /></>} />
        <Route path="/clusters" element={<><Navbar /><Clusters /></>} />
        <Route path="/alerts" element={<><Navbar /><Alerts /></>} />
      </Routes>
    </BrowserRouter>
  );
}
