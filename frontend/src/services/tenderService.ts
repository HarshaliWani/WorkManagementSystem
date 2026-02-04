import api from './api';
import demoApi from './demoApi';

const getApi = (isDemoMode: boolean) => isDemoMode ? demoApi : api;

export const tenderService = {
  // Get all tenders
  fetchAllTenders: async (isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.get('/tenders/');
    return response.data;
  },

  // Get tender by ID
  fetchTenderById: async (id: string, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.get(`/tenders/${id}/`);
    return response.data;
  },

  // ✅ NEW: Get all tenders for a specific work
  fetchTendersByWork: async (workId: string, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.get(`/tenders/?work=${workId}`);
    return response.data;
  },

  // Create new tender
  createTender: async (tenderData: FormData | { 
    tender_id: string; 
    agency_name: string; 
    date?: string; 
    work: number;
    work_order_tick: boolean;
    work_order_tick_date?: string;
    emd_supporting: boolean;
    supporting_date?: string;
    emd_awarded: boolean;
    awarded_date?: string;
    work_order?: File;
    technical_verification: boolean;
    technical_verification_date?: string;
    financial_verification: boolean;
    financial_verification_date?: string;
    loa: boolean;
    loa_date?: string;
    online: boolean;
    online_date?: string;
    offline: boolean;
    offline_date?: string;
    
  }, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.post('/tenders/', tenderData, {
      headers: tenderData instanceof FormData 
        ? { 'Content-Type': 'multipart/form-data' }
        : undefined
    });
    return response.data;
  },

  // Update tender
  updateTender: async (id: string, tenderData: FormData | any, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.patch(`/tenders/${id}/`, tenderData, {
      headers: tenderData instanceof FormData 
        ? { 'Content-Type': 'multipart/form-data' }
        : undefined
    });
    return response.data;
  },

  // Delete tender
  deleteTender: async (id: string, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    await apiInstance.delete(`/tenders/${id}/`);
  },
};
