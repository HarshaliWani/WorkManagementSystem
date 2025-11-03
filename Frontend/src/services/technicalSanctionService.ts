import axios from 'axios';
import { TechnicalSanction } from '../data/mockData';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const technicalSanctionService = {
  // Fetch all technical sanctions
  getAllTS: async (): Promise<TechnicalSanction[]> => {
    const response = await api.get('/technical-sanctions/');
    return response.data;
  },

  // Fetch technical sanctions for a specific work
  getTSByWork: async (workId: string): Promise<TechnicalSanction[]> => {
    const response = await api.get(`/technical-sanctions/?work=${workId}`);
    return response.data;
  },

  // Create new technical sanction
  createTS: async (tsData: Omit<TechnicalSanction, 'id'>): Promise<TechnicalSanction> => {
    const response = await api.post('/technical-sanctions/', tsData);
    return response.data;
  },

  // Update technical sanction
  updateTS: async (id: string, tsData: Partial<TechnicalSanction>): Promise<TechnicalSanction> => {
    const response = await api.put(`/technical-sanctions/${id}/`, tsData);
    return response.data;
  },

  // Delete technical sanction
  deleteTS: async (id: string): Promise<void> => {
    await api.delete(`/technical-sanctions/${id}/`);
  },
};
