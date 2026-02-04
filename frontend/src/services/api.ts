// src/services/api.ts
// Re-export authenticated axios instance for backward compatibility
// All services can continue importing from './api'
export { authenticatedApi as default } from './axiosConfig';
