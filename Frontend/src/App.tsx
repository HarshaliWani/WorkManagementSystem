import React, { useState } from 'react';
import { mockData } from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Breadcrumbs } from './components/Breadcrumbs';
import { ModeToggle } from './components/ModeToggle';
import { Dashboard } from './pages/Dashboard';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { WorkListPage } from './pages/WorkListPage';

type AppView = 'dashboard' | 'work-list' | 'technical-sanctions' | 'work-orders' | 'bills' | 'final-bills';

function App() {
  const [selectedGR, setSelectedGR] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        grs={mockData.GRs} 
        selectedGR={selectedGR}
        onGRSelect={handleGRSelect}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <Breadcrumbs items={getBreadcrumbItems()} />
          <ModeToggle isEditMode={isEditMode} onToggle={() => setIsEditMode(!isEditMode)} />
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' ? (
            <Dashboard grs={mockData.GRs} onStageClick={handleStageClick} />
          ) : currentView === 'work-list' ? (
            <WorkListPage 
              grs={mockData.GRs} 
              selectedGR={selectedGR}
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