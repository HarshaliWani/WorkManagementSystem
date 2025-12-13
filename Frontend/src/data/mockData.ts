import type { Work, Spill } from '../types/work';  
export type { Work, Spill }; 

export interface GR {
  id: string;
  grNumber: string;
  grDate: string;
  works: Work[];
}

export interface TechnicalSanction {
  id: string;  // Added optional id field
  tsName: string;  // Changed from tsNumber to match existing data
  workPortion: WorkPortionItem[];  // Changed to match existing data
  consultancy: number;
  contingency: number;
  laborInsurance: number;
  notingDone: boolean;  // Changed from hasNoting to match existing data
  orderDone: boolean;   // Changed from hasOrder to match existing data
  tenders: Tender[];
  totalAmount: number; // Optional total amount field
}

export interface WorkPortionItem {
  item: string;
  cost: number;
  royalty?: number;        // ✅ Make optional (not in mock data)
  testing?: number;        // ✅ Make optional (not in mock data)
  subTotal?: number;       // ✅ Make optional (not in mock data)
  gst?: number;            // ✅ Make optional (not in mock data)
  total?: number;   
}

export interface Tender {
  id?: string | number;
  tenderNumber: string;
  tenderName: string;
  openingDate?: string;
  status?: string;
  technicalSanctionId?: number;
  workOrderUrl?: string;
  onlineOffline?: boolean;
  onlineOfflineDate?: string;
  technicalVerification?: boolean;
  technicalVerificationDate?: string;
  financialVerification?: boolean;
  financialVerificationDate?: string;
  loa?: boolean;
  loaDate?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkOrder {
  date: string;
  agency: string;
  pdfFile: string;
}

export interface Bill {
  id?: string | number;
  billType: string;
  billDate: string;
  pdfFile: string;
  UC?: string;
}