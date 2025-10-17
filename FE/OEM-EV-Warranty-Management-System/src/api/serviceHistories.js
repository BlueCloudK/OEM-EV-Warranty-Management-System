import { http } from "./httpClient";

const base = "/api/service-histories";

const normalizeHistory = (raw) => {
  if (!raw || typeof raw !== "object") return {};
  const vehicle = raw.vehicle || {};
  const customer = raw.customer || vehicle.customer || {};
  return {
    ...raw,
    id: raw.id ?? raw.serviceHistoryId,
    vehicleVin: raw.vehicleVin || vehicle.vehicleVin || vehicle.vin,
    customerName: raw.customerName || customer.name || vehicle.customerName,
    customerPhone: raw.customerPhone || customer.phone || "",
    serviceType: raw.serviceType || "MAINTENANCE",
    description: raw.description || "",
    serviceDate: raw.serviceDate || raw.createdAt || new Date().toISOString(),
    serviceCenter: raw.serviceCenter || raw.center || "",
    technician: raw.technician || "",
    partsUsed: raw.partsUsed || "",
    laborHours: raw.laborHours ?? null,
    totalCost: raw.totalCost ?? null,
    status: raw.status || "COMPLETED",
    notes: raw.notes || "",
    nextServiceDate: raw.nextServiceDate || null,
    mileage: raw.mileage ?? null,
    warrantyInfo: raw.warrantyInfo || "",
    createdAt: raw.createdAt || raw.serviceDate,
  };
};

const normalizeListOrPage = (data) => {
  if (Array.isArray(data)) return data.map(normalizeHistory);
  if (Array.isArray(data?.content)) {
    return { ...data, content: data.content.map(normalizeHistory) };
  }
  return data;
};

export const serviceHistoriesApi = {
  list: async ({ page, size } = {}) => {
    const params = new URLSearchParams();
    if (page !== undefined) params.set("page", page);
    if (size !== undefined) params.set("size", size);
    const { data } = await http.get(
      `${base}${params.toString() ? `?${params}` : ""}`
    );
    return normalizeListOrPage(data);
  },
  getById: async (id) => {
    const { data } = await http.get(`${base}/${id}`);
    return normalizeHistory(data);
  },
  create: async (payload) => {
    const { data } = await http.post(base, payload);
    return normalizeHistory(data);
  },
  update: async (id, payload) => {
    const { data } = await http.put(`${base}/${id}`, payload);
    return normalizeHistory(data);
  },
  delete: async (id) => {
    const { data } = await http.delete(`${base}/${id}`);
    return data;
  },
};
// ===========================================================================================
// Service Histories API - Quản lý Lịch sử Bảo dưỡng
// ===========================================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Helper function để lấy token từ localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function để tạo headers với authentication
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function để xử lý response
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  return null; // For DELETE requests
};

export const serviceHistoriesApi = {
  // ===========================================================================================
  // GET ALL SERVICE HISTORIES - Lấy danh sách tất cả lịch sử bảo dưỡng
  // ===========================================================================================
  getAllServiceHistories: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Thêm các query parameters
      if (params.page !== undefined) queryParams.append('page', params.page);
      if (params.size !== undefined) queryParams.append('size', params.size);
      if (params.search) queryParams.append('search', params.search);
      if (params.vehicleId) queryParams.append('vehicleId', params.vehicleId);
      if (params.status) queryParams.append('status', params.status);
      
      const url = `${API_BASE_URL}/api/service-histories${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Error getting service histories:', error);
      throw error;
    }
  },

  // ===========================================================================================
  // GET SERVICE HISTORY BY ID - Lấy thông tin lịch sử bảo dưỡng theo ID
  // ===========================================================================================
  getServiceHistoryById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/service-histories/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`❌ Error getting service history ${id}:`, error);
      throw error;
    }
  },

  // ===========================================================================================
  // CREATE SERVICE HISTORY - Tạo lịch sử bảo dưỡng mới
  // ===========================================================================================
  createServiceHistory: async (serviceHistoryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/service-histories`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(serviceHistoryData)
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Error creating service history:', error);
      throw error;
    }
  },

  // ===========================================================================================
  // UPDATE SERVICE HISTORY - Cập nhật lịch sử bảo dưỡng
  // ===========================================================================================
  updateServiceHistory: async (id, serviceHistoryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/service-histories/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(serviceHistoryData)
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`❌ Error updating service history ${id}:`, error);
      throw error;
    }
  },

  // ===========================================================================================
  // DELETE SERVICE HISTORY - Xóa lịch sử bảo dưỡng
  // ===========================================================================================
  deleteServiceHistory: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/service-histories/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`❌ Error deleting service history ${id}:`, error);
      throw error;
    }
  },

  // ===========================================================================================
  // GET SERVICE HISTORIES BY VEHICLE ID - Lấy lịch sử bảo dưỡng theo xe
  // ===========================================================================================
  getServiceHistoriesByVehicle: async (vehicleId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page !== undefined) queryParams.append('page', params.page);
      if (params.size !== undefined) queryParams.append('size', params.size);
      
      const url = `${API_BASE_URL}/api/service-histories/by-vehicle/${vehicleId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`❌ Error getting service histories for vehicle ${vehicleId}:`, error);
      throw error;
    }
  },

  // ===========================================================================================
  // GET SERVICE HISTORIES BY CUSTOMER - Lấy lịch sử bảo dưỡng theo khách hàng
  // ===========================================================================================
  getServiceHistoriesByCustomer: async (customerId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page !== undefined) queryParams.append('page', params.page);
      if (params.size !== undefined) queryParams.append('size', params.size);
      
      const url = `${API_BASE_URL}/api/service-histories/by-customer/${customerId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`❌ Error getting service histories for customer ${customerId}:`, error);
      throw error;
    }
  },

  // ===========================================================================================
  // GET MY SERVICE HISTORIES (Customer Self-Service) - Khách hàng xem lịch sử của mình
  // ===========================================================================================
  getMyServiceHistories: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page !== undefined) queryParams.append('page', params.page);
      if (params.size !== undefined) queryParams.append('size', params.size);
      
      const url = `${API_BASE_URL}/api/service-histories/my-histories${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Error getting my service histories:', error);
      throw error;
    }
  }
};

export default serviceHistoriesApi;
