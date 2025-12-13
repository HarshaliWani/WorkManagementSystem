import api from './api';

export interface TechnicalSanction {
  id: number;
  work: number;
  work_name: string;
  
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
  
  // Base fields
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

export const technicalSanctionService = {
  // Get all technical sanctions
  fetchAllTechnicalSanctions: async () => {
    const response = await api.get('/technical-sanctions/');
    return response.data;
  },

  // Get technical sanction by ID
  fetchTechnicalSanctionById: async (id: number | string) => {
    const response = await api.get(`/technical-sanctions/${id}/`);
    return response.data;
  },

  // ✅ NEW: Get all technical sanctions for a specific work
  fetchTechnicalSanctionsByWork: async (workId: string) => {
    const response = await api.get(`/technical-sanctions/?work=${workId}`);
    return response.data;
  },

  // Create new technical sanction
  createTechnicalSanction: async (tsData: {
    work: number;
    work_portion: number;
    royalty: number;
    testing: number;
    consultancy?: number;
    gst_percentage?: number;
    contingency_percentage?: number;
    labour_insurance_percentage?: number;
    noting?: boolean;
    order?: boolean;

    // override fields:
    work_portion_total?: number;
    gst?: number;
    grand_total?: number;
    contingency?: number;
    labour_insurance?: number;
    final_total?: number;
  }) => {
    const response = await api.post('/technical-sanctions/', tsData);
    return response.data;
  },

  // Update technical sanction
  updateTechnicalSanction: async (id: number | string, tsData: {
    work_portion?: number;
    royalty?: number;
    testing?: number;
    consultancy?: number;
    gst_percentage?: number;
    contingency_percentage?: number;
    labour_insurance_percentage?: number;
    noting?: boolean;
    order?: boolean;

    // override fields:
    work_portion_total?: number;
    gst?: number;
    grand_total?: number;
    contingency?: number;
    labour_insurance?: number;
    final_total?: number;
  }) => {
    const response = await api.patch(`/technical-sanctions/${id}/`, tsData);
    return response.data;
  },

  // Delete technical sanction
  deleteTechnicalSanction: async (id: number | string) => {
    await api.delete(`/technical-sanctions/${id}/`);
  },
};
