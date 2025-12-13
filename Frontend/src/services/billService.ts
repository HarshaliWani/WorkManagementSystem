import api from './api';

export const billService = {
  // Get all bills
  fetchAllBills: async () => {
    const response = await api.get('/bills/');
    return response.data;
  },

  // Get bill by ID
  fetchBillById: async (id: string) => {
    const response = await api.get(`/bills/${id}/`);
    return response.data;
  },

  // ✅ NEW: Get all bills for a specific tender
  fetchBillsByTender: async (tenderId: string) => {
    const response = await api.get(`/bills/?tender=${tenderId}`);
    return response.data;
  },

  // Create new bill
  createBill: async (billData: {
    tender: number;
    bill_number: string;
    date?: string;
    work_portion: number;
    royalty_and_testing?: number;
    reimbursement_of_insurance?: number;
    security_deposit?: number;
    insurance?: number;
    royalty?: number;

    //  percentage fields:
    gst_percentage?: number;
    tds_percentage?: number;
    gst_on_workportion_percentage?: number;
    lwc_percentage?: number;

    //  override fields:
    gst?: number;
    bill_total?: number;
    tds?: number;
    gst_on_workportion?: number;
    lwc?: number;
    net_amount?: number;
  }) => {
    const response = await api.post('/bills/', billData);
    return response.data;
  },

  // Update bill
  updateBill: async (id: string, billData: any) => {
    const response = await api.patch(`/bills/${id}/`, billData);
    return response.data;
  },

  // Delete bill
  deleteBill: async (id: string) => {
    await api.delete(`/bills/${id}/`);
  },
};
