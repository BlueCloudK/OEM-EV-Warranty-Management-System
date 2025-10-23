const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

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
      const errorData = await response.text();
      throw new Error(errorData || `HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return null; // Cho các yêu cầu không trả về JSON (ví dụ: DELETE)

  } catch (error) {
    console.error(`❌ API Client Error (${options.method} ${endpoint}):`, error);
    throw error;
  }
};

export default apiClient;
