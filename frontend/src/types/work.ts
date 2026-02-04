// src/types/work.ts

export interface Spill {
  id: number;
  work_id: number;
  ARA: number;
  created_at: string;   // keep this since WorkTable expects it
}

export interface Work {
  id: number;
  workName: string;
  workDate: string;
  AA: number;
  RA: number;
  gr: number;  // ✅ This is the GR's DATABASE ID (foreign key), NOT the GR number
  spills: Spill[];
  grNumber?: string; // Optional: to hold GR number if needed
  isCancelled?: boolean;
  cancelReason?: string | null;
  cancelDetails?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface GR {
  id: number;              // ✅ Database ID (e.g., 1, 2, 3, 4, 5)
  grNumber: string;        // ✅ The actual GR number (e.g., "125GRQ", "56G37A", "125G3ts")
  grDate: string;
  document?: string;
  works?: Work[];
  created_at?: string;
  updated_at?: string;
}