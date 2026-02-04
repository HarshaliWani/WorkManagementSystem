import api from './api';
import demoApi from './demoApi';

const getApi = (isDemoMode: boolean) => isDemoMode ? demoApi : api;

export const spillService = {
  // Get all spills
  fetchAllSpills: async (isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.get('/spills/');
    return response.data;
  },

  // Get spill by ID
  fetchSpillById: async (id: string, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.get(`/spills/${id}/`);
    return response.data;
  },

  // ✅ NEW: Get all spills for a specific work
  fetchSpillsByWork: async (workId: string, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.get(`/spills/?work=${workId}`);
    return response.data;
  },

  // Create new spill
  createSpill: async (spillData: { 
    work_id: number;
    ara: number;
  }, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.post('/spills/', spillData);
    return response.data;
  },

  // Update spill
  updateSpill: async (id: string, spillData: { 
    ara?: number; 
  }, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.patch(`/spills/${id}/`, spillData);
    return response.data;
  },

  // Delete spill
  deleteSpill: async (id: string, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    await apiInstance.delete(`/spills/${id}/`);
  },
};
