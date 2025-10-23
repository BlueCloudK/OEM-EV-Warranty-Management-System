import apiClient from './apiClient';

export const dataApi = {
  // Customers
  getAllCustomers: (params = {}) => apiClient(`/api/customers?${new URLSearchParams(params)}`),
  getCustomerById: (id) => apiClient(`/api/customers/${id}`),
  createCustomer: (data) => apiClient('/api/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => apiClient(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id) => apiClient(`/api/customers/${id}`, { method: 'DELETE' }),

  // Vehicles
  getAllVehicles: (params = {}) => apiClient(`/api/vehicles?${new URLSearchParams(params)}`),
  getVehicleById: (id) => apiClient(`/api/vehicles/${id}`),
  createVehicle: (data) => apiClient('/api/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  updateVehicle: (id, data) => apiClient(`/api/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVehicle: (id) => apiClient(`/api/vehicles/${id}`, { method: 'DELETE' }),

  // Parts
  getAllParts: (params = {}) => apiClient(`/api/parts?${new URLSearchParams(params)}`),
  getPartById: (id) => apiClient(`/api/parts/${id}`),
  createPart: (data) => apiClient('/api/parts', { method: 'POST', body: JSON.stringify(data) }),
  updatePart: (id, data) => apiClient(`/api/parts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePart: (id) => apiClient(`/api/parts/${id}`, { method: 'DELETE' }),

  // Warranty Claims
  getAllWarrantyClaims: (params = {}) => apiClient(`/api/warranty-claims?${new URLSearchParams(params)}`),
  getWarrantyClaimById: (id) => apiClient(`/api/warranty-claims/${id}`),
  createWarrantyClaim: (data) => apiClient('/api/warranty-claims', { method: 'POST', body: JSON.stringify(data) }),
  updateWarrantyClaim: (id, data) => apiClient(`/api/warranty-claims/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWarrantyClaim: (id) => apiClient(`/api/warranty-claims/${id}`, { method: 'DELETE' }),
  updateWarrantyClaimStatus: (id, statusData) => apiClient(`/api/warranty-claims/${id}/status`, { method: 'PATCH', body: JSON.stringify(statusData) }),
  evmAcceptClaim: (id) => apiClient(`/api/warranty-claims/${id}/evm-accept`, { method: 'PATCH' }),
  evmRejectClaim: (id, reason) => apiClient(`/api/warranty-claims/${id}/evm-reject`, { method: 'PATCH', body: JSON.stringify(reason) }),
  techStartClaim: (id) => apiClient(`/api/warranty-claims/${id}/tech-start`, { method: 'PATCH' }),
  techCompleteClaim: (id, notes) => apiClient(`/api/warranty-claims/${id}/tech-complete`, { method: 'PATCH', body: JSON.stringify(notes) }),

  // Service Histories
  getAllServiceHistories: (params = {}) => apiClient(`/api/service-histories?${new URLSearchParams(params)}`),
  getServiceHistoryById: (id) => apiClient(`/api/service-histories/${id}`),
  createServiceHistory: (data) => apiClient('/api/service-histories', { method: 'POST', body: JSON.stringify(data) }),
  updateServiceHistory: (id, data) => apiClient(`/api/service-histories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteServiceHistory: (id) => apiClient(`/api/service-histories/${id}`, { method: 'DELETE' }),

  // Service Centers
  getAllServiceCenters: (params = {}) => apiClient(`/api/service-centers?${new URLSearchParams(params)}`),
  getServiceCenterById: (id) => apiClient(`/api/service-centers/${id}`),
  createServiceCenter: (data) => apiClient('/api/service-centers', { method: 'POST', body: JSON.stringify(data) }),
  updateServiceCenter: (id, data) => apiClient(`/api/service-centers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteServiceCenter: (id) => apiClient(`/api/service-centers/${id}`, { method: 'DELETE' }),

  // Feedbacks
  getAllFeedbacks: (params = {}) => apiClient(`/api/feedbacks?${new URLSearchParams(params)}`),
  getFeedbackById: (id) => apiClient(`/api/feedbacks/${id}`),
  createFeedback: (data) => apiClient('/api/feedbacks', { method: 'POST', body: JSON.stringify(data) }),
  updateFeedback: (id, data) => apiClient(`/api/feedbacks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFeedback: (id) => apiClient(`/api/feedbacks/${id}`, { method: 'DELETE' }),

  // Work Logs
  getAllWorkLogs: (params = {}) => apiClient(`/api/work-logs?${new URLSearchParams(params)}`),
  getWorkLogById: (id) => apiClient(`/api/work-logs/${id}`),
  createWorkLog: (data) => apiClient('/api/work-logs', { method: 'POST', body: JSON.stringify(data) }),
  updateWorkLog: (id, data) => apiClient(`/api/work-logs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWorkLog: (id) => apiClient(`/api/work-logs/${id}`, { method: 'DELETE' }),

  // Part Requests (Assumed endpoints based on UI needs)
  getAllPartRequests: (params = {}) => apiClient(`/api/part-requests?${new URLSearchParams(params)}`),
  createPartRequest: (data) => apiClient('/api/part-requests', { method: 'POST', body: JSON.stringify(data) }),
};

export default dataApi;
