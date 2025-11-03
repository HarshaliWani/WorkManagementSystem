import axios from 'axios';
import { Tender } from '../data/mockData';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const tenderService = {
  // Get all tenders
  getAllTenders: async (): Promise<Tender[]> => {
    const response = await api.get('/tenders/');
    return response.data;
  },

  // Get tenders by technical sanction
  getTendersByTS: async (tsId: string): Promise<Tender[]> => {
    const response = await api.get(`/tenders/?technical_sanction=${tsId}`);
    return response.data;
  },

  // Create tender
  createTender: async (tsId: string, tenderData: Partial<Tender>): Promise<Tender> => {
    const response = await api.post('/tenders/', {
      technical_sanction_id: tsId,
      ...tenderData,
    });
    return response.data;
  },

  // Update tender
  updateTender: async (id: string, tenderData: Partial<Tender>): Promise<Tender> => {
    const response = await api.put(`/tenders/${id}/`, tenderData);
    return response.data;
  },

  // Delete tender
  deleteTender: async (id: string): Promise<void> => {
    await api.delete(`/tenders/${id}/`);
  },
};
