// src/contexts/NavigationContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// Navigation path item interface
export interface NavigationPathItem {
  name: string;
  id: number | null;
  gr_id?: number | null;
  work_id?: number | null;
  technical_sanction_id?: number | null;
  tender_id?: number | null;
}

// Active filters interface
export interface NavigationFilters {
  gr_id?: number | null;
  work_id?: number | null;
  technical_sanction_id?: number | null;
  tender_id?: number | null;
}

// NavigationContextType interface
interface NavigationContextType {
  navigationPath: NavigationPathItem[];
  activeFilters: NavigationFilters;
  setNavigationPath: (path: NavigationPathItem[]) => void;
  updateFilters: (filters: Partial<NavigationFilters>) => void;
  clearNavigation: () => void;
  addToPath: (item: NavigationPathItem) => void;
  removeFromPath: (index: number) => void;
}

// Create context
const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

// NavigationProvider component props
interface NavigationProviderProps {
  children: ReactNode;
}

// Default navigation path (Dashboard)
const defaultPath: NavigationPathItem[] = [
  { name: 'Dashboard', id: null }
];

// NavigationProvider component
export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const [navigationPath, setNavigationPathState] = useState<NavigationPathItem[]>(defaultPath);
  const [activeFilters, setActiveFilters] = useState<NavigationFilters>({});

  // Set the entire navigation path
  const setNavigationPath = useCallback((path: NavigationPathItem[]) => {
    setNavigationPathState(path);
  }, []);

  // Update filters (merges with existing filters, removes null/undefined values)
  const updateFilters = useCallback((filters: Partial<NavigationFilters>) => {
    setActiveFilters(prev => {
      const updated = { ...prev };
      // Update with new filter values
      Object.entries(filters).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          // Remove the key if value is null/undefined
          delete updated[key as keyof NavigationFilters];
        } else {
          // Set the value
          updated[key as keyof NavigationFilters] = value as any;
        }
      });
      return updated;
    });
  }, []);

  // Clear navigation (reset to default)
  const clearNavigation = useCallback(() => {
    setNavigationPathState(defaultPath);
    setActiveFilters({});
  }, []);

  // Add item to navigation path
  const addToPath = useCallback((item: NavigationPathItem) => {
    setNavigationPathState(prev => [...prev, item]);
  }, []);

  // Remove item from navigation path (and all items after it)
  const removeFromPath = useCallback((index: number) => {
    setNavigationPathState(prev => prev.slice(0, index + 1));
  }, []);

  const value: NavigationContextType = {
    navigationPath,
    activeFilters,
    setNavigationPath,
    updateFilters,
    clearNavigation,
    addToPath,
    removeFromPath,
  };

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
};

// useNavigationContext hook
export const useNavigationContext = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigationContext must be used within a NavigationProvider');
  }
  return context;
};

