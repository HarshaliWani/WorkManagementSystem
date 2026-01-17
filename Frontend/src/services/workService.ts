import api from './api';
import demoApi from './demoApi';

const getApi = (isDemoMode: boolean) => isDemoMode ? demoApi : api;

export const workService = {
  // Get all works
  fetchAllWorks: async (isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.get('/works/');
    return response.data;
  },

  // Get work by ID (includes spills in response)
  fetchWorkById: async (id: string, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.get(`/works/${id}/`);
    return response.data;
  },

  // Create new work
  createWork: async (workData: any, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.post('/works/', workData);
    return response.data;
  },

  // Update work
  updateWork: async (id: number, workData: any, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.patch(`/works/${id}/`, workData);
    return response.data;
  },

  // Delete work
  deleteWork: async (id: number, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    await apiInstance.delete(`/works/${id}/`);
  },
};
