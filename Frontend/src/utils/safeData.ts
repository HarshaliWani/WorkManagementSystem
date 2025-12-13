export const makeSafeGRs = (grs: any[]): any[] => {
  if (!Array.isArray(grs)) return [];
  
  return grs.map(gr => ({
    ...gr,
    works: Array.isArray(gr.works) 
      ? gr.works.map((work: any) => ({
          ...work,
          AA: work.AA || 0,
          RA: work.RA || 0,
          spills: Array.isArray(work.spills)
            ? work.spills.map((spill: any) => ({
                ...spill,
                ARA: spill.ARA || 0,
                technicalSanctions: Array.isArray(spill.technicalSanctions) ? spill.technicalSanctions : [],
              }))
            : [],
        }))
      : [],
  }));
};

export const getSafeValue = <T>(value: T | null | undefined, fallback: T = "N/A" as T): T => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }
  return value;
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

export const getSafeNumber = (value: number | null | undefined, fallback: number = 0): number => {
  if (value === null || value === undefined || isNaN(value)) {
    return fallback;
  }
  return value;
};
