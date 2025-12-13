import api from './api';

export const tenderService = {
  // Get all tenders
  fetchAllTenders: async () => {
    const response = await api.get('/tenders/');
    return response.data;
  },

  // Get tender by ID
  fetchTenderById: async (id: string) => {
    const response = await api.get(`/tenders/${id}/`);
    return response.data;
  },

  // ✅ NEW: Get all tenders for a specific work
  fetchTendersByWork: async (workId: string) => {
    const response = await api.get(`/tenders/?work=${workId}`);
    return response.data;
  },

  // Create new tender
  createTender: async (tenderData: { 
    tender_id: string; 
    agency_name: string; 
    date?: string; 
    work: number;
  }) => {
    const response = await api.post('/tenders/', tenderData);
    return response.data;
  },

  // Update tender
  updateTender: async (id: string, tenderData: any) => {
    const response = await api.patch(`/tenders/${id}/`, tenderData);
    return response.data;
  },

  // Delete tender
  deleteTender: async (id: string) => {
    await api.delete(`/tenders/${id}/`);
  },
};
