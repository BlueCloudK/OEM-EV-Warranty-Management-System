import apiClient from "./apiClient";

/**
 * =================================================================
 * 🚗 Vehicles API - Quản lý xe điện
 * =================================================================
 * - Full CRUD operations cho vehicles
 * - Search by VIN, customer
 * - My vehicles (customer self-service)
 */

export const vehiclesApi = {
  /**
   * Lấy danh sách tất cả vehicles (ADMIN/STAFF)
   * Endpoint: GET /api/vehicles
   * @param {object} params - Query params (page, size, sort, search)
   * @returns {Promise<object>} Paged response of vehicles
   */
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: 0,
      size: 10,
      ...params
    }).toString();
    return apiClient(`/api/vehicles?${queryParams}`);
  },

  /**
   * Lấy thông tin vehicle theo ID
   * Endpoint: GET /api/vehicles/{id}
   * @param {number} id - Vehicle ID
   * @returns {Promise<object>} Vehicle details
   */
  getById: (id) => {
    return apiClient(`/api/vehicles/${id}`);
  },

  /**
   * Tạo vehicle mới
   * Endpoint: POST /api/vehicles
   * @param {object} vehicleData - Vehicle data (vehicleVin, vehicleName, model, year, customerId, etc.)
   * @returns {Promise<object>} Created vehicle
   */
  create: (vehicleData) => {
    return apiClient('/api/vehicles', {
      method: 'POST',
      body: JSON.stringify(vehicleData),
    });
  },

  /**
   * Cập nhật vehicle
   * Endpoint: PUT /api/vehicles/{id}
   * @param {number} id - Vehicle ID
   * @param {object} vehicleData - Updated vehicle data
   * @returns {Promise<object>} Updated vehicle
   */
  update: (id, vehicleData) => {
    return apiClient(`/api/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  },

  /**
   * Xóa vehicle
   * Endpoint: DELETE /api/vehicles/{id}
   * @param {number} id - Vehicle ID
   * @returns {Promise<void>}
   */
  delete: (id) => {
    return apiClient(`/api/vehicles/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Lấy vehicles theo customer ID (ADMIN/STAFF)
   * Endpoint: GET /api/vehicles/by-customer/{customerId}
   * @param {string} customerId - Customer UUID
   * @param {object} params - Pagination params
   * @returns {Promise<object>} Paged response of customer's vehicles
   */
  getByCustomer: (customerId, params = {}) => {
    const queryParams = new URLSearchParams({
      page: 0,
      size: 10,
      ...params
    }).toString();
    return apiClient(`/api/vehicles/by-customer/${customerId}?${queryParams}`);
  },

  /**
   * Lấy vehicles của chính mình (CUSTOMER)
   * Endpoint: GET /api/vehicles/my-vehicles
   * Security: Backend tự lấy username từ JWT token
   * @param {object} params - Pagination params
   * @returns {Promise<object>} Paged response of my vehicles
   */
  getMyVehicles: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: 0,
      size: 10,
      ...params
    }).toString();
    return apiClient(`/api/vehicles/my-vehicles?${queryParams}`);
  },

  /**
   * Tìm vehicle theo VIN
   * Endpoint: GET /api/vehicles/by-vin?vin={vin}
   * @param {string} vin - Vehicle Identification Number
   * @returns {Promise<object>} Vehicle details
   */
  getByVin: (vin) => {
    return apiClient(`/api/vehicles/by-vin?vin=${encodeURIComponent(vin)}`);
  },

  /**
   * Tìm kiếm vehicles
   * Endpoint: GET /api/vehicles/search
   * @param {object} searchParams - Search criteria (vin, model, year, customerName, etc.)
   * @returns {Promise<object>} Paged response of matching vehicles
   */
  search: (searchParams = {}) => {
    const queryParams = new URLSearchParams(searchParams).toString();
    return apiClient(`/api/vehicles/search?${queryParams}`);
  },
};

export default vehiclesApi;
