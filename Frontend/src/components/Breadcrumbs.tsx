import React, { useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { flushSync } from 'react-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigationContext } from '../contexts/NavigationContext';

export const Breadcrumbs: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { updateFilters } = useNavigationContext();

  // Get current page name from route
  const getCurrentPageName = () => {
    const path = location.pathname;
    const routeLabels: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/works': 'Works',
      '/technical-sanctions': 'Technical Sanctions',
      '/tenders': 'Tenders',
      '/bills': 'Bills',
      '/status': 'Status',
      '/final-bills': 'Final Bills',
      '/grs': 'Government Resolutions'
    };
    return routeLabels[path] || 'Page';
  };

  // Build breadcrumb path directly from URL params - always accurate, no sync needed
  const breadcrumbItems = useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());
    const grId = params.gr;
    const workId = params.work;
    const tsId = params.technical_sanction;
    const tenderId = params.tender;
    const currentPage = getCurrentPageName();

    const path: Array<{
      name: string;
      href: string;
      params: Record<string, string>;
      gr_id?: number;
      work_id?: number;
      technical_sanction_id?: number;
      tender_id?: number;
    }> = [];

    // Always start with Dashboard
    path.push({ name: 'Dashboard', href: '/dashboard', params: {} });

    // Handle Status page separately (top-level branch)
    if (currentPage === 'Status') {
      if (grId) {
        path.push({
          name: 'Status',
          href: '/status',
          params: { gr: grId },
          gr_id: parseInt(grId)
        });
      } else {
        path.push({ name: 'Status', href: '/status', params: {} });
      }
      return path;
    }

    // For Works hierarchy: Build complete path based on which params are present
    // Add Works level if grId is present
    if (grId) {
      path.push({
        name: 'Works',
        href: '/works',
        params: { gr: grId },
        gr_id: parseInt(grId)
      });
    }

    // Add Technical Sanctions level if workId is present
    if (workId && grId) {
      path.push({
        name: 'Technical Sanctions',
        href: '/technical-sanctions',
        params: { gr: grId, work: workId },
        gr_id: parseInt(grId),
        work_id: parseInt(workId)
      });
    }

    // Add Tenders level if tsId is present
    if (tsId && workId && grId) {
      path.push({
        name: 'Tenders',
        href: '/tenders',
        params: { gr: grId, work: workId, technical_sanction: tsId },
        gr_id: parseInt(grId),
        work_id: parseInt(workId),
        technical_sanction_id: parseInt(tsId)
      });
    }

    // Add Bills level if tenderId is present
    if (tenderId && tsId && workId && grId) {
      path.push({
        name: 'Bills',
        href: '/bills',
        params: { gr: grId, work: workId, technical_sanction: tsId, tender: tenderId },
        gr_id: parseInt(grId),
        work_id: parseInt(workId),
        technical_sanction_id: parseInt(tsId),
        tender_id: parseInt(tenderId)
      });
    }

    // If current page is not in path (e.g., navigating to a page without params),
    // add it at the end
    if (currentPage && currentPage !== 'Dashboard' && !path.some(p => p.name === currentPage)) {
      const currentPageParams: Record<string, string> = {};
      if (grId) currentPageParams.gr = grId;
      if (workId) currentPageParams.work = workId;
      if (tsId) currentPageParams.technical_sanction = tsId;
      if (tenderId) currentPageParams.tender = tenderId;

      const routeMap: Record<string, string> = {
        'Works': '/works',
        'Technical Sanctions': '/technical-sanctions',
        'Tenders': '/tenders',
        'Bills': '/bills'
      };

      path.push({
        name: currentPage,
        href: routeMap[currentPage] || location.pathname,
        params: currentPageParams,
        ...(grId ? { gr_id: parseInt(grId) } : {}),
        ...(workId ? { work_id: parseInt(workId) } : {}),
        ...(tsId ? { technical_sanction_id: parseInt(tsId) } : {}),
        ...(tenderId ? { tender_id: parseInt(tenderId) } : {})
      });
    }

    return path;
  }, [location.pathname, location.search, searchParams]);

  const currentPageName = getCurrentPageName();

  // Handle breadcrumb segment click
  // Extract cumulative params up to clicked item and clear deeper filters
  const handleBreadcrumbClick = (index: number, item: typeof breadcrumbItems[0]) => {
    // Don't navigate if clicking current page
    if (index === breadcrumbItems.length - 1) return;

    // Build query string from item params
    const query = new URLSearchParams(item.params).toString();
    const targetUrl = `${item.href}${query ? `?${query}` : ''}`;

    // Determine which filters to clear based on hierarchy
    if (item.name === 'Dashboard') {
      flushSync(() => {
        updateFilters({ gr_id: null, work_id: null, technical_sanction_id: null, tender_id: null });
      });
      navigate('/dashboard');
      return;
    }

    // Extract filter values for clearing deeper levels
    const grId = item.gr_id || null;
    const workId = item.work_id || null;
    const tsId = item.technical_sanction_id || null;
    const tenderId = item.tender_id || null;

    // Clear filters based on which level we're navigating to
    if (item.name === 'Works') {
      flushSync(() => {
        updateFilters({
          gr_id: grId,
          work_id: null,
          technical_sanction_id: null,
          tender_id: null
        });
      });
    } else if (item.name === 'Technical Sanctions') {
      flushSync(() => {
        updateFilters({
          gr_id: grId,
          work_id: workId,
          technical_sanction_id: null,
          tender_id: null
        });
      });
    } else if (item.name === 'Tenders') {
      flushSync(() => {
        updateFilters({
          gr_id: grId,
          work_id: workId,
          technical_sanction_id: tsId,
          tender_id: null
        });
      });
    } else if (item.name === 'Bills') {
      flushSync(() => {
        updateFilters({
          gr_id: grId,
          work_id: workId,
          technical_sanction_id: tsId,
          tender_id: tenderId
        });
      });
    } else if (item.name === 'Status') {
      flushSync(() => {
        updateFilters({
          gr_id: grId,
          work_id: null,
          technical_sanction_id: null,
          tender_id: null
        });
      });
    }

    navigate(targetUrl);
  };

  return (
    <nav>
      <ol className="flex items-center space-x-2">
        <li>
          <button
            onClick={() => {
              flushSync(() => {
                updateFilters({ gr_id: null, work_id: null, technical_sanction_id: null, tender_id: null });
              });
              navigate('/dashboard');
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Home"
          >
            <Home className="w-4 h-4" />
          </button>
        </li>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const isCurrentPage = item.name === currentPageName;
          const isActiveSegment = isLast || isCurrentPage;

          return (
            <React.Fragment key={index}>
              <li>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </li>
              <li>
                {isActiveSegment ? (
                  // Current page - highlighted/bold, not clickable
                  <span className="text-sm font-bold text-gray-900">
                    {item.name}
                  </span>
                ) : (
                  // Previous segment - clickable link
                  <button
                    onClick={() => handleBreadcrumbClick(index, item)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors hover:underline"
                  >
                    {item.name}
                  </button>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
