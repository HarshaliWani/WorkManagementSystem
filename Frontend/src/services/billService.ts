import axios from 'axios';
import { Bill } from '../data/mockData';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const billService = {
  // Get all bills
  getAllBills: async (): Promise<Bill[]> => {
    const response = await api.get('/bills/');
    return response.data;
  },

  // Get bills by tender
  getBillsByTender: async (tenderId: string): Promise<Bill[]> => {
    const response = await api.get(`/bills/?tender=${tenderId}`);
    return response.data;
  },

  // Create bill
  createBill: async (tenderId: string, billData: Partial<Bill>): Promise<Bill> => {
    const response = await api.post('/bills/', {
      tender_id: tenderId,
      ...billData,
    });
    return response.data;
  },

  // Update bill
  updateBill: async (id: string, billData: Partial<Bill>): Promise<Bill> => {
    const response = await api.put(`/bills/${id}/`, billData);
    return response.data;
  },

  // Delete bill
  deleteBill: async (id: string): Promise<void> => {
    await api.delete(`/bills/${id}/`);
  },
};
