// WebsiteFE/services/adminApi.js
import axios from 'axios';

const adminApi = axios.create({
  // URL này dành riêng cho backend của trang quản trị
  baseURL: 'https://splendid-dog-92.loca.lt/api/v1', 
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
});

export default adminApi;