import apiClient from "./apiClient";

/**
 * @description Refactored Service Histories API to use the central apiClient.
 */
export const serviceHistoriesApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/api/service-histories?${query}`);
  },

  getById: (id) => {
    return apiClient(`/api/service-histories/${id}`);
  },

  create: (payload) => {
    return apiClient(`/api/service-histories`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update: (id, payload) => {
    return apiClient(`/api/service-histories/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  remove: (id) => {
    return apiClient(`/api/service-histories/${id}`, { method: "DELETE" });
  },

  getByVehicle: (vehicleId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/api/service-histories/by-vehicle/${vehicleId}?${query}`);
  },

  getByCustomer: (customerId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/api/service-histories/by-customer/${customerId}?${query}`);
  },

  getMyHistories: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient(`/api/service-histories/my-histories?${query}`);
  },
};

export default serviceHistoriesApi;
