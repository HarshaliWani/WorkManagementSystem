import React, { useState, useEffect } from 'react';
import { mockData } from './data/mockData'; // Keep as fallback
import { Sidebar } from './components/Sidebar';
import { Breadcrumbs } from './components/Breadcrumbs';
import { ModeToggle } from './components/ModeToggle';
import { Dashboard } from './pages/Dashboard';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { WorkListPage } from './pages/WorkListPage';
import { grService } from './services/grService'; // Add this import
import { GR } from './data/mockData'; // Add this import

type AppView = 'dashboard' | 'work-list' | 'technical-sanctions' | 'work-orders' | 'bills' | 'final-bills';

function App() {
  // Add these new state variables for API data
  const [grs, setGrs] = useState<GR[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Your existing state
  const [selectedGR, setSelectedGR] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  // Add this useEffect to fetch data from Django backend
  useEffect(() => {
    const fetchGRs = async () => {
      try {
        setLoading(true);
        const data = await grService.getAllGRs();
        setGrs(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching GRs:', err);
        setError('Failed to load GR data. Using mock data instead.');
        // Fallback to mock data if API fails
        setGrs(mockData.GRs);
      } finally {
        setLoading(false);
      }
    };

    fetchGRs();
  }, []);

  // All your existing functions remain the same
  const handleGRSelect = (grNumber: string) => {
    setSelectedGR(grNumber);
  };

  const handleStageClick = (stage: string) => {
    setCurrentView(stage as AppView);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const getBreadcrumbItems = () => {
    const items = [{ label: 'Dashboard' }];

    if (currentView !== 'dashboard') {
      const viewLabels = {
        'work-list': 'Work List',
        'technical-sanctions': 'Technical Sanctions',
        'work-orders': 'Work Orders',
        'bills': 'Bills Management',
        'final-bills': 'Final Bills'
      };
      items.push({
        label: viewLabels[currentView as keyof typeof viewLabels] || currentView
      });
    }

    return items;
  };

  const getPageTitle = () => {
    switch (currentView) {
      case 'work-list':
        return 'Work List';
      case 'technical-sanctions':
        return 'Technical Sanctions';
      case 'work-orders':
        return 'Work Orders';
      case 'bills':
        return 'Bills Management';
      case 'final-bills':
        return 'Final Bills';
      default:
        return 'Dashboard';
    }
  };

  const refreshGRData = async () => {
    try {
      const data = await grService.getAllGRs();
      setGrs(data);
    } catch (err) {
      console.error('Error refreshing GR data:', err);
    }
  };

  const getPageDescription = () => {
    switch (currentView) {
      case 'work-list':
        return 'Comprehensive table view of all government works with expandable spill details and management capabilities.';
      case 'technical-sanctions':
        return 'Manage technical sanctions for all government works. This section will include detailed TS management capabilities.';
      case 'work-orders':
        return 'Overview of all work orders and their current status. Track tender processes and work order generation.';
      case 'bills':
        return 'Comprehensive bill management system for tracking payments and financial processes.';
      case 'final-bills':
        return 'Final bill processing and utilization certificate management for completed works.';
      default:
        return '';
    }
  };

  // Add loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading GR data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Show error message if API failed but continue with fallback data */}
      {error && (
        <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50">
          {error}
        </div>
      )}

      <Sidebar
        grs={grs} // Changed from mockData.GRs to grs
        selectedGR={selectedGR}
        onGRSelect={handleGRSelect}
        isEditMode={isEditMode}        
        onDataUpdate={refreshGRData}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <Breadcrumbs items={getBreadcrumbItems()} />
          <ModeToggle isEditMode={isEditMode} onToggle={() => setIsEditMode(!isEditMode)} />
        </div>

        <div className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' ? (
            <Dashboard grs={grs} onStageClick={handleStageClick} /> {/* Changed from mockData.GRs */}
          ) : currentView === 'work-list' ? (
          <WorkListPage
            grs={grs}
            selectedGR={selectedGR}
            isEditMode={isEditMode}
            onBack={handleBackToDashboard}
            onDataUpdate={refreshGRData}  // Add this prop
          />
          ) : currentView === 'technical-sanctions' ? (
          <TechnicalSanctionPage
            isEditMode={isEditMode}
            onBack={handleBackToDashboard}
          />
          ) : (
          <PlaceholderPage
            title={getPageTitle()}
            description={getPageDescription()}
            onBack={handleBackToDashboard}
          />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
