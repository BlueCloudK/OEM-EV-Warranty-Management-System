// ===========================================================================================
// Warranty Claims API - Quản lý Warranty Claims
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

export const warrantyClaimsApi = {
  // ===========================================================================================
  // GET ALL WARRANTY CLAIMS - Lấy danh sách tất cả warranty claims
  // ===========================================================================================
  getAllWarrantyClaims: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      // Thêm các query parameters
      if (params.page !== undefined) queryParams.append('page', params.page);
      if (params.size !== undefined) queryParams.append('size', params.size);
      if (params.search) queryParams.append('search', params.search);
      if (params.status) queryParams.append('status', params.status);
      if (params.vehicleId) queryParams.append('vehicleId', params.vehicleId);
      
      const url = `${API_BASE_URL}/api/warranty-claims${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Error getting warranty claims:', error);
      throw error;
    }
  },

  // ===========================================================================================
  // GET WARRANTY CLAIM BY ID - Lấy thông tin warranty claim theo ID
  // ===========================================================================================
  getWarrantyClaimById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/warranty-claims/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`❌ Error getting warranty claim ${id}:`, error);
      throw error;
    }
  },

  // ===========================================================================================
  // CREATE WARRANTY CLAIM - Tạo warranty claim mới
  // ===========================================================================================
  createWarrantyClaim: async (claimData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/warranty-claims`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(claimData)
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Error creating warranty claim:', error);
      throw error;
    }
  },

  // ===========================================================================================
  // UPDATE WARRANTY CLAIM - Cập nhật warranty claim
  // ===========================================================================================
  updateWarrantyClaim: async (id, claimData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/warranty-claims/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(claimData)
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`❌ Error updating warranty claim ${id}:`, error);
      throw error;
    }
  },

  // ===========================================================================================
  // DELETE WARRANTY CLAIM - Xóa warranty claim
  // ===========================================================================================
  deleteWarrantyClaim: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/warranty-claims/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`❌ Error deleting warranty claim ${id}:`, error);
      throw error;
    }
  },

  // ===========================================================================================
  // APPROVE WARRANTY CLAIM - Phê duyệt warranty claim
  // ===========================================================================================
  approveWarrantyClaim: async (id, approvalData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/warranty-claims/${id}/approve`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(approvalData)
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`❌ Error approving warranty claim ${id}:`, error);
      throw error;
    }
  },

  // ===========================================================================================
  // REJECT WARRANTY CLAIM - Từ chối warranty claim
  // ===========================================================================================
  rejectWarrantyClaim: async (id, rejectionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/warranty-claims/${id}/reject`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(rejectionData)
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`❌ Error rejecting warranty claim ${id}:`, error);
      throw error;
    }
  },

  // ===========================================================================================
  // GET WARRANTY CLAIMS BY VEHICLE - Lấy warranty claims theo xe
  // ===========================================================================================
  getWarrantyClaimsByVehicle: async (vehicleId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page !== undefined) queryParams.append('page', params.page);
      if (params.size !== undefined) queryParams.append('size', params.size);
      
      const url = `${API_BASE_URL}/api/warranty-claims/by-vehicle/${vehicleId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`❌ Error getting warranty claims for vehicle ${vehicleId}:`, error);
      throw error;
    }
  },

  // ===========================================================================================
  // GET WARRANTY CLAIMS BY CUSTOMER - Lấy warranty claims theo khách hàng
  // ===========================================================================================
  getWarrantyClaimsByCustomer: async (customerId, params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page !== undefined) queryParams.append('page', params.page);
      if (params.size !== undefined) queryParams.append('size', params.size);
      
      const url = `${API_BASE_URL}/api/warranty-claims/by-customer/${customerId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`❌ Error getting warranty claims for customer ${customerId}:`, error);
      throw error;
    }
  },

  // ===========================================================================================
  // GET MY WARRANTY CLAIMS (Customer Self-Service) - Khách hàng xem claims của mình
  // ===========================================================================================
  getMyWarrantyClaims: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page !== undefined) queryParams.append('page', params.page);
      if (params.size !== undefined) queryParams.append('size', params.size);
      
      const url = `${API_BASE_URL}/api/warranty-claims/my-claims${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ Error getting my warranty claims:', error);
      throw error;
    }
  }
};

export default warrantyClaimsApi;