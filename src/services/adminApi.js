// WebsiteFE/services/adminApi.js
import axios from 'axios';

const adminApi = axios.create({
  // URL này dành riêng cho backend của trang quản trị
  baseURL: 'https://adminapi.icards.com.vn/api/v1', 
  headers: {
    'Bypass-Tunnel-Reminder': 'true',
    'Content-Type': 'application/json'
  },
  withCredentials: true,
});

export default adminApi;