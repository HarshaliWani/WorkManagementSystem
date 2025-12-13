import api from './api';

export const grService = {
  // Get all GRs
  fetchAllGRs: async () => {
    const response = await api.get('/grs/');
    return response.data;
  },

  // Get GR by ID
  fetchGRById: async (id: string) => {
    const response = await api.get(`/grs/${id}/`);
    return response.data;
  },

  // ✅ NEW: Get all works for a specific GR
  fetchWorksByGR: async (grId: string) => {
    const response = await api.get(`/works/?gr=${grId}`);
    return response.data;
  },

    // ✅ NEW: Get GRs by Work ID
  fetchGRsByWork: async (workId: string) => {
    const response = await api.get(`/grs/?work=${workId}`);
    return response.data;
  },

  // Create new GR
  createGR: async (formData: FormData) => {
    const response = await api.post('/grs/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  updateGR: async (id: number, formData: FormData) => {
    const response = await api.patch(`/grs/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Delete GR
  deleteGR: async (id: string) => {
    await api.delete(`/grs/${id}/`);
  },
};
