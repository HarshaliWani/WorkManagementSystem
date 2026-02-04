import api from './api';
import demoApi from './demoApi';

const getApi = (isDemoMode: boolean) => isDemoMode ? demoApi : api;

export const grService = {
  // Get all GRs
  fetchAllGRs: async (isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.get('/grs/');
    return response.data;
  },

  // Get GR by ID
  fetchGRById: async (id: string, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.get(`/grs/${id}/`);
    return response.data;
  },

  // ✅ NEW: Get all works for a specific GR
  fetchWorksByGR: async (grId: string, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.get(`/works/?gr=${grId}`);
    return response.data;
  },

    // ✅ NEW: Get GRs by Work ID
  fetchGRsByWork: async (workId: string, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.get(`/grs/?work=${workId}`);
    return response.data;
  },

  // Create new GR
  createGR: async (formData: FormData, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.post('/grs/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  updateGR: async (id: number, formData: FormData, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.patch(`/grs/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete GR
  deleteGR: async (id: string, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    await apiInstance.delete(`/grs/${id}/`);
  },
};
