import api from './api';
import demoApi from './demoApi';

const getApi = (isDemoMode: boolean) => isDemoMode ? demoApi : api;

export const billService = {
  // Get all bills
  fetchAllBills: async (isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.get('/bills/');
    return response.data;
  },

  // Get bill by ID
  fetchBillById: async (id: string, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.get(`/bills/${id}/`);
    return response.data;
  },

  // ✅ NEW: Get all bills for a specific tender
  fetchBillsByTender: async (tenderId: string, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.get(`/bills/?tender=${tenderId}`);
    return response.data;
  },

  // Create new bill
  createBill: async (billData: FormData | any, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const config = billData instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await apiInstance.post('/bills/', billData, config);
    return response.data;
  },

  // Update bill
  updateBill: async (id: string, billData: FormData | any, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const config = billData instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await apiInstance.patch(`/bills/${id}/`, billData, config);
    return response.data;
  },

  // Delete bill
  deleteBill: async (id: string, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    await apiInstance.delete(`/bills/${id}/`);
  },
};
