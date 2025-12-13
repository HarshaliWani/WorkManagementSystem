import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Breadcrumbs } from './components/Breadcrumbs';
import { ModeToggle } from './components/ModeToggle';
import Dashboard from './pages/Dashboard';
import { PlaceholderPage } from './pages/PlaceholderPage';
import WorkListPage from './pages/WorkListPage';
import { TechnicalSanctionPage } from './pages/TechnicalSanctionPage';
import { grService } from './services/grService';
import type { GR } from './data/mockData';
import TenderPage from './pages/TendersPage';
import BillsPage from './pages/BillsPage';

function AppContent() {
  const [grs, setGrs] = useState<GR[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGR, setSelectedGR] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchGRs = async () => {
      try {
        setLoading(true);
        const grsData = await grService.fetchAllGRs();

        // Fetch works for each GR
        const grsWithWorks = await Promise.all(
          grsData.map(async (gr: any) => {
            try {
              const works = await grService.fetchWorksByGR(gr.id.toString());
              return { ...gr, works: works || [] };
            } catch (err) {
              return { ...gr, works: [] };
            }
          })
        );

        setGrs(grsWithWorks);
        setError(null);
      } catch (err) {
        console.error('Error fetching GRs:', err);
        setError('Failed to load GR data');
      } finally {
        setLoading(false);
      }
    };

    fetchGRs();
  }, []);

  const handleGRSelect = (grNumber: string) => {
    setSelectedGR(grNumber);
  };

  const getBreadcrumbItems = () => {
    const path = location.pathname;
    const items = [{ label: 'Dashboard' }];

    const routeLabels: Record<string, string> = {
      '/works': 'Work List',
      '/technical-sanctions': 'Technical Sanctions',
      '/tenders': 'Tenders',
      '/bills': 'Bills Management',
      '/final-bills': 'Final Bills',
      '/grs': 'Government Resolutions'
    };

    if (path !== '/' && path !== '/dashboard') {
      items.push({ label: routeLabels[path] || 'Page' });
    }

    return items;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* ✅ FIXED: Removed onStageClick - not needed, Sidebar doesn't use it */}
      <Sidebar
        grs={grs}
        selectedGR={selectedGR}
        onGRSelect={handleGRSelect}
        isEditMode={isEditMode}  
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            {/* ✅ FIXED: Breadcrumbs only needs items prop */}
            <Breadcrumbs items={getBreadcrumbItems()} />
          </div>
          <ModeToggle isEditMode={isEditMode} onToggle={() => setIsEditMode(!isEditMode)} />
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/works" element={<WorkListPage isEditMode={isEditMode} />} />

            {/* ✅ FIXED: Added onBack prop */}
            <Route path="/technical-sanctions" element={
              <TechnicalSanctionPage onBack={() => navigate('/dashboard')} />
            } />

            {/* ✅ FIXED: Added icon prop to PlaceholderPage */}
            <Route path="/tenders" element={<TenderPage />} />
            
            <Route path="/bills" element={<BillsPage/>} />
            <Route path="/final-bills" element={
              <PlaceholderPage
                title="Final Bills"
                description="Process final bills and utilization certificates."
                icon="✅"
              />
            } />
            <Route path="/grs" element={
              <PlaceholderPage
                title="Government Resolutions"
                description="View and manage all GRs."
                icon="📜"
              />
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
