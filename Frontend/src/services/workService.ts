import api from './api';

export const workService = {
  // Get all works
  fetchAllWorks: async () => {
    const response = await api.get('/works/');
    return response.data;
  },

  // Get work by ID (includes spills in response)
  fetchWorkById: async (id: string) => {
    const response = await api.get(`/works/${id}/`);
    return response.data;
  },

  // Create new work
  // ✅ NEW: Create work
  createWork: async (workData: any) => {
    const response = await api.post('/works/', workData);
    return response.data;
  },

  // ✅ NEW: Update work
  updateWork: async (id: number, workData: any) => {
    const response = await api.patch(`/works/${id}/`, workData);
    return response.data;
  },

  // ✅ NEW: Delete work
  deleteWork: async (id: number) => {
    await api.delete(`/works/${id}/`);
  },
};
