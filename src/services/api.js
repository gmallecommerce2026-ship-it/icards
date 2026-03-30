import axios from 'axios';

// 1. Cấu hình Instance cơ bản
const api = axios.create({
  // baseURL: 'http://localhost:5000/api', // Dùng khi dev local
  baseURL: 'https://api.icards.com.vn/api',
  headers: {
    'Bypass-Tunnel-Reminder': 'true',
    'Content-Type': 'application/json'
  },
  withCredentials: true, // Quan trọng để gửi Cookie/Session
});

// 2. Response Interceptor (Xử lý lỗi toàn cục)
// Giúp bạn debug dễ hơn và không bị crash app khi API lỗi
api.interceptors.response.use(
  (response) => {
    // Trả về data trực tiếp nếu muốn, hoặc trả về full response
    return response;
  },
  (error) => {
    // Log lỗi ra console để dev dễ thấy
    console.error("❌ API Error:", error?.response?.data?.message || error.message);
    // Ví dụ: Tự động logout nếu token hết hạn (401)
    if (error.response && error.response.status === 401) {
        // window.location.href = '/login'; // Redirect nếu cần
    }
    return Promise.reject(error);
  }
);

// --- 3. CÁC HÀM SERVICE CHUYÊN BIỆT (HELPER FUNCTIONS) ---

/**
 * Lấy danh sách Blog (Tin tức, Bài viết)
 * Tự động filter isBlog = true
 */
export const getBlogs = async (params = {}) => {
    const defaultParams = {
        isBlog: true,
        isPublished: true,
        sort: '-createdAt', // Mới nhất lên đầu
        limit: 10,
        page: 1,
        ...params // Cho phép override các tham số này từ UI
    };
    return api.get('/pages', { params: defaultParams });
};

/**
 * Lấy danh sách Trang tĩnh (Giới thiệu, Liên hệ, Chính sách)
 * Tự động filter isBlog = false
 */
export const getStaticPages = async () => {
    return api.get('/pages', { 
        params: { 
            isBlog: false, 
            isPublished: true,
            sort: 'title' 
        } 
    });
};

/**
 * Lấy chi tiết trang theo Slug
 * Dùng chung cho cả Blog và Page tĩnh
 */
export const getPageBySlug = async (slug) => {
    // Endpoint này cần match với route backend của bạn (ví dụ: /public/pages/:slug)
    return api.get(`/public/pages/${slug}`); 
};

/**
 * Lấy danh mục bài viết
 */
export const getCategories = async () => {
    return api.get('/public/page-categories');
};

/**
 * Lấy Topics / Tags / Keywords
 */
export const getTopics = async () => {
    return api.get('/public/topics');
};

// Export mặc định instance để vẫn dùng được api.get() / api.post() kiểu cũ
export default api;