import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable cookies for cross-site requests
});

api.interceptors.request.use(config => {
    const storedToken = localStorage.getItem('AUTH_TOKEN');
    if (storedToken) {
        console.log('Token found:', storedToken);
        config.headers['Authorization'] = `Bearer ${storedToken}`; // No JSON.parse() needed
    } else {
        console.warn('No token found in local storage.');
    }
    return config;
}, error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
});

export default api;
