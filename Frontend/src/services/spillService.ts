import api from './api';

export const spillService = {
  // Get all spills
  fetchAllSpills: async () => {
    const response = await api.get('/spills/');
    return response.data;
  },

  // Get spill by ID
  fetchSpillById: async (id: string) => {
    const response = await api.get(`/spills/${id}/`);
    return response.data;
  },

  // ✅ NEW: Get all spills for a specific work
  fetchSpillsByWork: async (workId: string) => {
    const response = await api.get(`/spills/?work=${workId}`);
    return response.data;
  },

  // Create new spill
  createSpill: async (spillData: { 
    work_id: number;
    ara: number;
  }) => {
    const response = await api.post('/spills/', spillData);
    return response.data;
  },

  // Update spill
  updateSpill: async (id: string, spillData: { 
    ara?: number; 
  }) => {
    const response = await api.patch(`/spills/${id}/`, spillData);
    return response.data;
  },

  // Delete spill
  deleteSpill: async (id: string) => {
    await api.delete(`/spills/${id}/`);
  },
};
