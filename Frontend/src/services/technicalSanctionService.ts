import api from './api';

export interface TechnicalSanction {
  id: number;
  work: number;
  work_name: string;

  subName: string;
  gr_id: number;
  gr_name: string;
  aa: string;
  
  // Work cancellation status
  work_is_cancelled?: boolean;
  work_cancel_reason?: string | null;
  work_cancel_details?: string | null;
  
  // Read fields (camelCase - from API)
  workPortion: string;
  workPortionTotal: string;
  gstAmount: string;
  gstPercentage: string;
  grandTotal: string;
  contingencyAmount: string;
  contingencyPercentage: string;
  labourInsuranceAmount: string;
  labourInsurancePercentage: string;
  finalTotal: string;
  
  // Base fields (from API response - capitalized read-only fields)
  Royalty?: string;
  Testing?: string;
  Consultancy?: string;
  // Also support lowercase for backward compatibility
  work_portion?: string;
  royalty?: string;
  testing?: string;
  consultancy?: string;
  
  // Status
  noting: boolean;
  order: boolean;
  notingDate: string | null;
  orderDate: string | null;
  
  created_at: string;
  updated_at: string;
}

import demoApi from './demoApi';

const getApi = (isDemoMode: boolean) => isDemoMode ? demoApi : api;

export const technicalSanctionService = {
  // Get all technical sanctions
  fetchAllTechnicalSanctions: async (isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.get('/technical-sanctions/');
    return response.data;
  },

  // Get technical sanction by ID
  fetchTechnicalSanctionById: async (id: number | string, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.get(`/technical-sanctions/${id}/`);
    return response.data;
  },

  // ✅ NEW: Get all technical sanctions for a specific work
  fetchTechnicalSanctionsByWork: async (workId: string, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.get(`/technical-sanctions/?work=${workId}`);
    return response.data;
  },

  // Create new technical sanction
  createTechnicalSanction: async (tsData: {
    work: number;
    sub_name: string;
    work_portion: number;
    royalty: number;
    testing: number;
    consultancy?: number;
    gst_percentage?: number;
    contingency_percentage?: number;
    labour_insurance_percentage?: number;
    noting?: boolean;
    order?: boolean;
    noting_date?: string | null; 
    order_date?: string | null;

    // override fields:
    work_portion_total?: number;
    gst?: number;
    grand_total?: number;
    contingency?: number;
    labour_insurance?: number;
    final_total?: number;
  }, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.post('/technical-sanctions/', tsData);
    return response.data;
  },

  // Update technical sanction
  updateTechnicalSanction: async (id: number | string, tsData: {
    sub_name?: string;
    work_portion?: number;
    royalty?: number;
    testing?: number;
    consultancy?: number;
    gst_percentage?: number;
    contingency_percentage?: number;
    labour_insurance_percentage?: number;
    noting?: boolean;
    order?: boolean;
    noting_date?: string | null;
    order_date?: string | null;

    // override fields:
    work_portion_total?: number;
    gst?: number;
    grand_total?: number;
    contingency?: number;
    labour_insurance?: number;
    final_total?: number;
  }, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    const response = await apiInstance.patch(`/technical-sanctions/${id}/`, tsData);
    return response.data;
  },

  // Delete technical sanction
  deleteTechnicalSanction: async (id: number | string, isDemoMode: boolean = false) => {
    const apiInstance = getApi(isDemoMode);
    await apiInstance.delete(`/technical-sanctions/${id}/`);
  },
};
