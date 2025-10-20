export const mockData = {
  "GRs": [
    {
      "grNumber": "GR-2025-001",
      "grDate": "2025-09-21",
      "works": [
        {
          "workName": "Beachside Development",
          "AA": 5000000,
          "RA": 2000000,
          "spills": [
            {
              "ARA": 500000,
              "technicalSanctions": [
                {
                  "tsName": "TS-001",
                  "workPortion": [
                    {"item": "Excavation", "cost": 100000},
                    {"item": "Concrete", "cost": 200000}
                  ],
                  "consultancy": 50000,
                  "contingency": 30000,
                  "laborInsurance": 20000,
                  "notingDone": true,
                  "orderDone": false,
                  "tenders": [
                    {
                      "tenderName": "Tender-Online-001",
                      "type": "Online",
                      "uploadDate": "2025-09-15",
                      "technicalVerification": true,
                      "financialScrutiny": false,
                      "LOADate": false,
                      "workOrder": {
                        "date": "2025-09-20",
                        "agency": "XYZ Constructions",
                        "pdfFile": "work_order_001.pdf"
                      },
                      "EMDReturn": null,
                      "bills": [
                        {
                          "billType": "RA1",
                          "billDate": "2025-09-22",
                          "pdfFile": "bill_ra1.pdf"
                        },
                        {
                          "billType": "Final",
                          "billDate": "2025-09-30",
                          "pdfFile": "bill_final.pdf",
                          "UC": "uc_final.pdf"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "workName": "Museum Renovation",
          "AA": 3000000,
          "RA": 1500000,
          "spills": []
        }
      ]
    },
    {
      "grNumber": "GR-2025-002",
      "grDate": "2025-09-20",
      "works": [
        {
          "workName": "City Park Upgrade",
          "AA": 2000000,
          "RA": 1000000,
          "spills": []
        },
        {
          "workName": "Highway Construction Phase 1",
          "AA": 8000000,
          "RA": 3000000,
          "spills": [
            {
              "ARA": 1000000,
              "technicalSanctions": [
                {
                  "tsName": "TS-002",
                  "workPortion": [
                    {"item": "Road Base", "cost": 300000},
                    {"item": "Asphalt", "cost": 500000}
                  ],
                  "consultancy": 80000,
                  "contingency": 50000,
                  "laborInsurance": 30000,
                  "notingDone": true,
                  "orderDone": true,
                  "tenders": [
                    {
                      "tenderName": "Tender-Offline-002",
                      "type": "Offline",
                      "uploadDate": "2025-09-10",
                      "technicalVerification": true,
                      "financialScrutiny": true,
                      "LOADate": true,
                      "workOrder": {
                        "date": "2025-09-18",
                        "agency": "ABC Infrastructure",
                        "pdfFile": "work_order_002.pdf"
                      },
                      "bills": [
                        {
                          "billType": "RA1",
                          "billDate": "2025-09-25",
                          "pdfFile": "bill_ra1_002.pdf"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "grNumber": "GR-2025-003",
      "grDate": "2025-09-19",
      "works": [
        {
          "workName": "School Building Extension",
          "AA": 4500000,
          "RA": 2200000,
          "spills": []
        },
        {
          "workName": "Highway Construction Phase 1",
          "AA": 8000000,
          "RA": 3000000,
          "spills": [
            {
              "ARA": 1000000,
              "technicalSanctions": [
                {
                  "tsName": "TS-002",
                  "workPortion": [
                    {"item": "Road Base", "cost": 300000},
                    {"item": "Asphalt", "cost": 500000}
                  ],
                  "consultancy": 80000,
                  "contingency": 50000,
                  "laborInsurance": 30000,
                  "notingDone": true,
                  "orderDone": true,
                  "tenders": [
                    {
                      "tenderName": "Tender-Offline-002",
                      "type": "Offline",
                      "uploadDate": "2025-09-10",
                      "technicalVerification": true,
                      "financialScrutiny": true,
                      "LOADate": true,
                      "workOrder": {
                        "date": "2025-09-18",
                        "agency": "ABC Infrastructure",
                        "pdfFile": "work_order_002.pdf"
                      },
                      "bills": [
                        {
                          "billType": "RA1",
                          "billDate": "2025-09-25",
                          "pdfFile": "bill_ra1_002.pdf"
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "grNumber": "GR-2025-003",
      "grDate": "2025-09-19",
      "works": [
        {
          "workName": "School Building Extension",
          "AA": 4500000,
          "RA": 2200000,
          "spills": []
        }
      ]
    }
  ]
};

export interface GR {
  grNumber: string;
  grDate: string;
  works: Work[];
}

export interface Work {
  workName: string;
  AA: number;
  RA: number;
  spills: Spill[];
}

export interface Spill {
  ARA: number;
  technicalSanctions: TechnicalSanction[];
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
  royalty: number;
  testing: number;
  subTotal: number;
  gst: number;
  total: number;
}

export interface Tender {
  tenderName: string;
  type: 'Online' | 'Offline';
  uploadDate: string;
  technicalVerification: boolean;
  financialScrutiny: boolean;
  LOADate: boolean;
  workOrder?: WorkOrder;
  EMDReturn?: string | null;
  bills: Bill[];
}

export interface WorkOrder {
  date: string;
  agency: string;
  pdfFile: string;
}

export interface Bill {
  billType: string;
  billDate: string;
  pdfFile: string;
  UC?: string;
}