import axios from 'axios';
import { GR, Work } from '../data/mockData';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const grService = {
  // Existing: Fetch all GRs
  getAllGRs: async (): Promise<GR[]> => {
    const response = await api.get('/grs/');
    return response.data;
  },

  // Existing: Fetch single GR
  getGRById: async (id: number): Promise<GR> => {
    const response = await api.get(`/grs/${id}/`);
    return response.data;
  },

  // NEW: Create GR
  createGR: async (grData: { grNumber: string; grDate: string }): Promise<GR> => {
    const response = await api.post('/grs/', grData);
    return response.data;
  },

  // NEW: Update GR
  updateGR: async (id: string, grData: Partial<GR>): Promise<GR> => {
    const response = await api.put(`/grs/${id}/`, grData);
    return response.data;
  },

  // NEW: Delete GR
  deleteGR: async (id: string): Promise<void> => {
    await api.delete(`/grs/${id}/`);
  },
};

export const workService = {
  // Create Work
  createWork: async (grId: string, workData: { workName: string; AA: number; RA: number }): Promise<Work> => {
    const response = await api.post('/works/', {
      gr_id: grId,
      ...workData,
    });
    return response.data;
  },

  // Update Work
  updateWork: async (id: string, workData: Partial<Work>): Promise<Work> => {
    const response = await api.put(`/works/${id}/`, workData);
    return response.data;
  },

  // Delete Work
  deleteWork: async (id: string): Promise<void> => {
    await api.delete(`/works/${id}/`);
  },
};
