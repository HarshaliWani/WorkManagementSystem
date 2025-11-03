import axios from 'axios';
import { Spill } from '../data/mockData';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const spillService = {
  // Create a new spill
  createSpill: async (workId: string, ara: number): Promise<Spill> => {
    const response = await api.post('/spills/', {
      work_id: workId,
      ARA: ara,
    });
    return response.data;
  },

  // Update spill
  updateSpill: async (id: string, ara: number): Promise<Spill> => {
    const response = await api.patch(`/spills/${id}/`, {
      ARA: ara,
    });
    return response.data;
  },

  // Delete spill
  deleteSpill: async (id: string): Promise<void> => {
    await api.delete(`/spills/${id}/`);
  },

  // Get spills for a work
  getSpillsByWork: async (workId: string): Promise<Spill[]> => {
    const response = await api.get(`/spills/?work=${workId}`);
    return response.data;
  },
};
