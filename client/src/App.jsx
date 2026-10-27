import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Report from './pages/Report';
import Education from './pages/Education';
import Legal from './pages/Legal';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report" element={<Report />} />
        <Route path="/education" element={<Education />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Layout>
  );
}
