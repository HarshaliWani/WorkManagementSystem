import api from './api';
import demoApi from './demoApi';

const getApi = (isDemoMode: boolean) => isDemoMode ? demoApi : api;

export interface StatusData {
  total_grs: number;
  active_works: number;
  technical_sanctions?: number;
  tenders?: number;
  bills?: number;
  works_status: Record<string, number>;
  ts_status: Record<string, number>;
  tenders_status: Record<string, number>;
  bills_status: Record<string, number>;
  gr_filter?: number;
  work_filter?: number;
}

export const statusService = {
  // Get status dashboard data
  // Uses demoApi when in demo mode (calls /api/demo/status/), authenticated api otherwise (calls /api/status/)
  fetchStatus: async (isDemoMode: boolean = false, params?: { gr?: number; work?: number; page?: string }) => {
    const apiInstance = getApi(isDemoMode);
    const queryParams = new URLSearchParams();
    
    // Add query parameters
    if (params?.gr) {
      queryParams.append('gr', params.gr.toString());
    }
    if (params?.work) {
      queryParams.append('work', params.work.toString());
    }
    if (params?.page) {
      queryParams.append('page', params.page);
    }
    
    const queryString = queryParams.toString();
    // Use /status/ for authenticated API (baseURL: /api), /status/ for demo API (baseURL: /api/demo)
    const url = `/status/${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiInstance.get(url);
    return response.data as StatusData;
  },
};

