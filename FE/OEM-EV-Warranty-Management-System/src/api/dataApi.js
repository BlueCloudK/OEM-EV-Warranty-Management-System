import apiClient from './apiClient';

export const dataApi = {
  // Customers
  getAllCustomers: (params = {}) => apiClient(`/api/customers?${new URLSearchParams(params)}`),
  getCustomerById: (id) => apiClient(`/api/customers/${id}`),
  createCustomer: (data) => apiClient('/api/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => apiClient(`/api/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id) => apiClient(`/api/customers/${id}`, { method: 'DELETE' }),
  registerCustomerByStaff: (data) => apiClient('/api/auth/staff/register-customer', { method: 'POST', body: JSON.stringify(data) }),

  // Vehicles
  getAllVehicles: (params = {}) => apiClient(`/api/vehicles?${new URLSearchParams(params)}`),
  getVehicleById: (id) => apiClient(`/api/vehicles/${id}`),
  createVehicle: (data) => apiClient('/api/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  updateVehicle: (id, data) => apiClient(`/api/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVehicle: (id) => apiClient(`/api/vehicles/${id}`, { method: 'DELETE' }),
  getVehiclesByCustomerId: (customerId, page = 0, size = 10) => apiClient(`/api/vehicles/by-customer/${customerId}?page=${page}&size=${size}`),
  getVehicleByVin: (vin) => apiClient(`/api/vehicles/by-vin?vin=${vin}`),
  searchVehicles: (params = {}) => apiClient(`/api/vehicles/search?${new URLSearchParams(params)}`),

  // Parts
  getAllParts: (params = {}) => apiClient(`/api/parts?${new URLSearchParams(params)}`),
  getPartById: (id) => apiClient(`/api/parts/${id}`),
  createPart: (data) => apiClient('/api/parts', { method: 'POST', body: JSON.stringify(data) }),
  updatePart: (id, data) => apiClient(`/api/parts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePart: (id) => apiClient(`/api/parts/${id}`, { method: 'DELETE' }),

  // Installed Parts
  getAllInstalledParts: (params = {}) => apiClient(`/api/installed-parts?${new URLSearchParams(params)}`),
  createInstalledPart: (data) => apiClient('/api/installed-parts', { method: 'POST', body: JSON.stringify(data) }),
  updateInstalledPart: (id, data) => apiClient(`/api/installed-parts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteInstalledPart: (id) => apiClient(`/api/installed-parts/${id}`, { method: 'DELETE' }),
  getInstalledPartsByVehicle: (vehicleId, page = 0, size = 10) => apiClient(`/api/installed-parts/by-vehicle/${vehicleId}?page=${page}&size=${size}`),
  getInstalledPartsByPart: (partId, page = 0, size = 10) => apiClient(`/api/installed-parts/by-part/${partId}?page=${page}&size=${size}`),

  // Warranty Claims
  getAllWarrantyClaims: (params = {}) => apiClient(`/api/warranty-claims?${new URLSearchParams(params)}`),
  getWarrantyClaimById: (id) => apiClient(`/api/warranty-claims/${id}`),
  createWarrantyClaim: (data) => apiClient('/api/warranty-claims', { method: 'POST', body: JSON.stringify(data) }),
  updateWarrantyClaim: (id, data) => apiClient(`/api/warranty-claims/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteWarrantyClaim: (id) => apiClient(`/api/warranty-claims/${id}`, { method: 'DELETE' }),
  getClaimsByStatus: (status, params = {}) => apiClient(`/api/warranty-claims/by-status/${status}?${new URLSearchParams(params)}`),
  updateWarrantyClaimStatus: (id, statusData) => apiClient(`/api/warranty-claims/${id}/status`, { method: 'PATCH', body: JSON.stringify(statusData) }),
  adminAcceptClaim: (id, note) => apiClient(`/api/warranty-claims/${id}/admin-accept`, { method: 'PATCH', body: note }),
  adminRejectClaim: (id, reason) => apiClient(`/api/warranty-claims/${id}/admin-reject?reason=${reason}`, { method: 'PATCH' }),
  getAdminPendingClaims: (params = {}) => apiClient(`/api/warranty-claims/admin-pending?${new URLSearchParams(params)}`),
  getTechPendingClaims: (params = {}) => apiClient(`/api/warranty-claims/tech-pending?${new URLSearchParams(params)}`),
  techStartClaim: (id, note) => apiClient(`/api/warranty-claims/${id}/tech-start`, { method: 'PATCH', body: note }),
  techCompleteClaim: (id, completionNote) => apiClient(`/api/warranty-claims/${id}/tech-complete?completionNote=${encodeURIComponent(completionNote)}`, { method: 'PATCH' }),

  // Service Histories
  getAllServiceHistories: (params = {}) => apiClient(`/api/service-histories?${new URLSearchParams(params)}`),
  getServiceHistoryById: (id) => apiClient(`/api/service-histories/${id}`),
  createServiceHistory: (data) => apiClient('/api/service-histories', { method: 'POST', body: JSON.stringify(data) }),
  updateServiceHistory: (id, data) => apiClient(`/api/service-histories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteServiceHistory: (id) => apiClient(`/api/service-histories/${id}`, { method: 'DELETE' }),
  getServiceHistoriesByVehicle: (vehicleId, params = {}) => apiClient(`/api/service-histories/by-vehicle/${vehicleId}?${new URLSearchParams(params)}`),
  getServiceHistoriesByPart: (partId, params = {}) => apiClient(`/api/service-histories/by-part/${partId}?${new URLSearchParams(params)}`),
  getServiceHistoriesByDateRange: (params = {}) => apiClient(`/api/service-histories/by-date-range?${new URLSearchParams(params)}`),

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
  getMyDailyStats: () => apiClient('/api/work-logs/my-daily-stats'),

  // Part Requests (Assumed endpoints based on UI needs)
  getAllPartRequests: (params = {}) => apiClient(`/api/part-requests?${new URLSearchParams(params)}`),
  createPartRequest: (data) => apiClient('/api/part-requests', { method: 'POST', body: JSON.stringify(data) }),

  // Recall Campaigns (Assumed endpoints)
  getRecallCampaignProgress: () => apiClient('/api/recalls/progress'),
  getRecallFunnel: () => apiClient('/api/recalls/funnel'),
  getRecallCampaignStatus: () => apiClient('/api/recalls/status'),
};

export default dataApi;
