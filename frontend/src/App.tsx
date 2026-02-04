import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { Sidebar } from './components/Sidebar';
import { Breadcrumbs } from './components/Breadcrumbs';
import { NavigationUrlSync } from './components/NavigationUrlSync';
import { ModeToggle } from './components/ModeToggle';
import UserMenu from './components/UserMenu';
import ProtectedRoute from './components/ProtectedRoute';
import RootRedirect from './components/RootRedirect';
import Dashboard from './pages/Dashboard';
import { PlaceholderPage } from './pages/PlaceholderPage';
import WorkListPage from './pages/WorkListPage';
import { TechnicalSanctionPage } from './pages/TechnicalSanctionPage';
import TenderPage from './pages/TendersPage';
import BillsPage from './pages/BillsPage';
import StatusPage from './pages/StatusPage';
import Login from './pages/Login';
import Register from './pages/Register';

function AppContent() {
  const [isEditMode, setIsEditMode] = useState(false);

  const navigate = useNavigate();
  const { isLoading: authLoading } = useAuth();


  // Render all routes
  return (
    <Routes>
      {/* Public routes (accessible to guests) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Root redirect: /dashboard if authenticated, /login otherwise */}
      <Route path="/" element={<RootRedirect />} />
      
      {/* Routes with layout (dashboard accessible in demo mode, others require auth) */}
      <Route
        path="/*"
        element={
          authLoading ? (
            <div className="flex items-center justify-center h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            </div>
          ) : (
            <div className="flex h-screen bg-gray-50">
              <Sidebar
                grs={[]}
                selectedGR={null}
                onGRSelect={() => {}}
                isEditMode={isEditMode}
              />

            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <Breadcrumbs />
                </div>
                <div className="flex items-center gap-4">
                  <ModeToggle isEditMode={isEditMode} onToggle={() => setIsEditMode(!isEditMode)} />
                  <UserMenu />
                </div>
              </div>

              <main className="flex-1 overflow-y-auto p-6">
                <Routes>
                  {/* Dashboard is accessible in both demo and authenticated modes */}
                  <Route 
                    path="/dashboard" 
                    element={<Dashboard isEditMode={isEditMode} />}
                  />
                  {/* Other routes require authentication */}
                  <Route 
                    path="/works" 
                    element={
                      <ProtectedRoute>
                        <WorkListPage isEditMode={isEditMode} />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/technical-sanctions" 
                    element={
                      <ProtectedRoute>
                        <TechnicalSanctionPage 
                          onBack={() => navigate('/dashboard')}
                          isEditMode={isEditMode} 
                        />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/tenders" 
                    element={
                      <ProtectedRoute>
                        <TenderPage isEditMode={isEditMode} />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/bills" 
                    element={
                      <ProtectedRoute>
                        <BillsPage isEditMode={isEditMode} />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/status" 
                    element={
                      <ProtectedRoute>
                        <StatusPage isEditMode={isEditMode} />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/final-bills" 
                    element={
                      <ProtectedRoute>
                        <PlaceholderPage
                          title="Final Bills"
                          description="Process final bills and utilization certificates."
                          icon="✅"
                        />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/grs" 
                    element={
                      <ProtectedRoute>
                        <PlaceholderPage
                          title="Government Resolutions"
                          description="View and manage all GRs."
                          icon="📜"
                        />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </main>
            </div>
          </div>
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <BrowserRouter>
          <NavigationUrlSync />
          <AppContent />
        </BrowserRouter>
      </NavigationProvider>
    </AuthProvider>
  );
}

export default App;
