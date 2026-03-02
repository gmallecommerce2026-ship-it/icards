import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:5000/api',
  baseURL: 'https://api-icards.duckdns.org/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
});


export default api;