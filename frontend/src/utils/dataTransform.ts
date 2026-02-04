// src/utils/dataTransform.ts
import { Work, GR } from '../data/mockData';

// Transform API work data to frontend format
export const transformApiWorkToFrontend = (apiWork: any): Work => {
  return {
    id: apiWork.id,
    workName: apiWork.name_of_work || apiWork.workName,  // Handle both formats
    AA: apiWork.aa || apiWork.AA,  // Handle both formats
    RA: apiWork.ra || apiWork.RA,  // Handle both formats
    spills: apiWork.spills || []
  };
};

// Transform array of API works
export const transformApiWorksToFrontend = (apiWorks: any[]): Work[] => {
  return apiWorks.map(transformApiWorkToFrontend);
};

// Transform API GR data to frontend format
export const transformApiGRToFrontend = (apiGR: any): GR => {
  return {
    grNumber: apiGR.gr_number || apiGR.grNumber,
    grDate: apiGR.gr_date || apiGR.grDate,
    works: apiGR.works ? transformApiWorksToFrontend(apiGR.works) : []
  };
};

// Transform array of API GRs
export const transformApiGRsToFrontend = (apiGRs: any[]): GR[] => {
  return apiGRs.map(transformApiGRToFrontend);
};
