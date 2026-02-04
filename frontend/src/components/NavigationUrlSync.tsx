// src/components/NavigationUrlSync.tsx
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigationContext } from '../contexts/NavigationContext';

/**
 * Component that syncs NavigationContext activeFilters with browser URL
 * Breadcrumbs now read directly from URL, so this only handles filter sync
 * Must be placed inside BrowserRouter
 */
export const NavigationUrlSync: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeFilters, updateFilters } = useNavigationContext();
  
  // Track if we're updating from URL to prevent loops
  const isUpdatingFromUrlRef = useRef(false);
  const isUpdatingUrlRef = useRef(false);
  const prevUrlRef = useRef<string>('');

  // Read URL params and sync to activeFilters (handles browser back/forward, direct URL navigation, refresh)
  useEffect(() => {
    const currentUrl = `${location.pathname}${location.search}`;
    
    // Skip if URL hasn't actually changed (prevent unnecessary updates)
    if (currentUrl === prevUrlRef.current) {
      return;
    }
    
    // Skip if we just updated URL programmatically (to prevent loop)
    if (isUpdatingUrlRef.current) {
      isUpdatingUrlRef.current = false;
      prevUrlRef.current = currentUrl;
      return;
    }

    isUpdatingFromUrlRef.current = true;
    const searchParams = new URLSearchParams(location.search);
    
    // Build filters from URL params
    const filters: Partial<typeof activeFilters> = {};
    const grId = searchParams.get('gr');
    const workId = searchParams.get('work');
    const tsId = searchParams.get('technical_sanction');
    const tenderId = searchParams.get('tender');

    if (grId) filters.gr_id = parseInt(grId);
    else filters.gr_id = null;

    if (workId) filters.work_id = parseInt(workId);
    else filters.work_id = null;

    if (tsId) filters.technical_sanction_id = parseInt(tsId);
    else filters.technical_sanction_id = null;

    if (tenderId) filters.tender_id = parseInt(tenderId);
    else filters.tender_id = null;

    // Update filters in context (only if different to avoid loops)
    const currentFilters = activeFilters;
    const filtersChanged = 
      (filters.gr_id ?? null) !== (currentFilters.gr_id ?? null) ||
      (filters.work_id ?? null) !== (currentFilters.work_id ?? null) ||
      (filters.technical_sanction_id ?? null) !== (currentFilters.technical_sanction_id ?? null) ||
      (filters.tender_id ?? null) !== (currentFilters.tender_id ?? null);

    if (filtersChanged) {
      updateFilters(filters);
    }

    isUpdatingFromUrlRef.current = false;
    prevUrlRef.current = currentUrl;
  }, [location.pathname, location.search]); // Sync when URL changes (browser back/forward, direct nav, refresh)

  // Update URL when activeFilters change programmatically (but not from URL)
  useEffect(() => {
    // Skip if we're updating from URL (to prevent loop)
    if (isUpdatingFromUrlRef.current) {
      return;
    }

    // Build query params from activeFilters
    const params = new URLSearchParams();
    if (activeFilters.gr_id) params.set('gr', activeFilters.gr_id.toString());
    if (activeFilters.work_id) params.set('work', activeFilters.work_id.toString());
    if (activeFilters.technical_sanction_id) params.set('technical_sanction', activeFilters.technical_sanction_id.toString());
    if (activeFilters.tender_id) params.set('tender', activeFilters.tender_id.toString());

    const newUrl = `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    const currentUrl = `${location.pathname}${location.search}`;

    // Only update URL if it's different from current
    if (newUrl !== currentUrl) {
      isUpdatingUrlRef.current = true;
      prevUrlRef.current = newUrl;
      // Use replace to avoid adding to history when syncing
      navigate(newUrl, { replace: true });
    }
  }, [activeFilters, location.pathname, navigate]); // Update URL when filters change

  // This component doesn't render anything
  return null;
};
