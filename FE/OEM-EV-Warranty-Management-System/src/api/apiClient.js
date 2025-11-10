const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Public API Client - Không gửi token (cho trang chủ, public endpoints)
export const publicApiClient = async (endpoint, options = {}) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config = {
      method: options.method || 'GET',
      headers,
      ...options,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      let errorMessage = 'Đã xảy ra lỗi khi kết nối';

      try {
        const errorText = await response.text();

        console.error(`❌ Public API Error (${endpoint}):`, {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });

        // Provide specific error messages based on status codes
        if (response.status === 400) {
          errorMessage = errorText || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập.';
        } else if (response.status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (response.status === 403) {
          errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
        } else if (response.status === 404) {
          errorMessage = errorText || 'Không tìm thấy dữ liệu. Vui lòng kiểm tra lại.';
        } else if (response.status === 409) {
          errorMessage = errorText || 'Dữ liệu đã tồn tại hoặc xung đột. Vui lòng kiểm tra lại.';
        } else if (response.status === 422) {
          errorMessage = errorText || 'Dữ liệu không đúng định dạng. Vui lòng kiểm tra lại thông tin.';
        } else if (response.status === 500) {
          errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.';
        } else if (response.status === 503) {
          errorMessage = 'Hệ thống đang bảo trì. Vui lòng thử lại sau.';
        } else if (errorText) {
          errorMessage = errorText;
        } else {
          errorMessage = `Lỗi kết nối (Mã lỗi: ${response.status}). Vui lòng thử lại.`;
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
        errorMessage = `Lỗi kết nối (Mã lỗi: ${response.status}). Vui lòng thử lại.`;
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`❌ Public API Client Error (${endpoint}):`, error);
    // If it's a network error, provide a clear message
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.');
    }
    throw error;
  }
};

// Lấy tokens từ localStorage
const getAuthTokens = () => ({
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
});

// Lưu tokens vào localStorage
const setAuthTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

// Xóa tokens khi logout hoặc refresh thất bại
const clearAuthTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // Chuyển hướng về trang đăng nhập
  window.location.href = '/login';
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const apiClient = async (endpoint, options = {}) => {
  try {
    let { accessToken, refreshToken } = getAuthTokens();

    // Thiết lập headers mặc định
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Thực hiện yêu cầu API ban đầu
    let response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

    // Nếu token hết hạn (401) và có refreshToken
    if (response.status === 401 && refreshToken) {
      if (isRefreshing) {
        // Nếu đang có một yêu cầu refresh token khác, hãy đợi nó hoàn thành
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(newAccessToken => {
          headers['Authorization'] = `Bearer ${newAccessToken}`;
          return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        });
      } else {
        isRefreshing = true;
        try {
          // Gọi API để làm mới token trực tiếp
          const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (!refreshResponse.ok) {
            throw new Error('Failed to refresh token');
          }

          const newTokens = await refreshResponse.json();
          const newAccessToken = newTokens.accessToken;
          const newRefreshToken = newTokens.refreshToken;

          // Lưu token mới
          setAuthTokens(newAccessToken, newRefreshToken);
          processQueue(null, newAccessToken);

          // Thử lại yêu cầu ban đầu với token mới
          headers['Authorization'] = `Bearer ${newAccessToken}`;
          response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          processQueue(refreshError, null);
          clearAuthTokens(); // Đăng xuất người dùng nếu refresh thất bại
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    }

    // Xử lý response cuối cùng
    if (!response.ok) {
      let errorMessage = 'Đã xảy ra lỗi khi xử lý yêu cầu';

      try {
        const errorData = await response.text();

        // Provide specific error messages based on status codes
        if (response.status === 400) {
          errorMessage = errorData || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập.';
        } else if (response.status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (response.status === 403) {
          errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
        } else if (response.status === 404) {
          errorMessage = errorData || 'Không tìm thấy dữ liệu. Vui lòng kiểm tra lại.';
        } else if (response.status === 409) {
          errorMessage = errorData || 'Dữ liệu đã tồn tại hoặc xung đột. Vui lòng kiểm tra lại.';
        } else if (response.status === 422) {
          errorMessage = errorData || 'Dữ liệu không đúng định dạng. Vui lòng kiểm tra lại thông tin.';
        } else if (response.status === 500) {
          errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.';
        } else if (response.status === 503) {
          errorMessage = 'Hệ thống đang bảo trì. Vui lòng thử lại sau.';
        } else if (errorData) {
          errorMessage = errorData;
        } else {
          errorMessage = `Lỗi kết nối (Mã lỗi: ${response.status}). Vui lòng thử lại.`;
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
        errorMessage = `Lỗi kết nối (Mã lỗi: ${response.status}). Vui lòng thử lại.`;
      }

      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return null; // Cho các yêu cầu không trả về JSON (ví dụ: DELETE)

  } catch (error) {
    console.error(`❌ API Client Error (${options.method || 'GET'} ${endpoint}):`, error);
    // If it's a network error, provide a clear message
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.');
    }
    throw error;
  }
};

export default apiClient;
