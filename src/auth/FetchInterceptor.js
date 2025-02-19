import axios from 'axios';
import { API_BASE_URL, AUTH_TOKEN } from 'configs/AppConfig';
import { signOutSuccess } from 'store/slices/authSlice';
import store from '../store';
import { notification } from 'antd';

const unauthorizedCode = [400, 401, 403];

const service = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Enable cookies for cross-origin requests
});

// Config
const TOKEN_PAYLOAD_KEY = 'Authorization';

// API Request interceptor
service.interceptors.request.use(config => {
    try {
        const jwtToken = localStorage.getItem(AUTH_TOKEN);
        if (jwtToken) {
            console.log('Token found:', jwtToken);
            config.headers[TOKEN_PAYLOAD_KEY] = `Bearer ${jwtToken}`;
        } else {
            console.warn('No token found in local storage.');
        }
    } catch (error) {
        console.error('Error retrieving token from localStorage:', error);
    }

    console.log('Request headers:', config.headers);
    return config;
}, error => {
    notification.error({
        message: 'Request Error',
        description: 'An error occurred while making the request.'
    });
    return Promise.reject(error);
});

// API Response interceptor
service.interceptors.response.use(response => {
    return response.data;
}, error => {
    let notificationParam = {
        message: 'Error',
        description: ''
    };

    if (unauthorizedCode.includes(error.response?.status)) {
        notificationParam.message = 'Authentication Failed';
        notificationParam.description = 'Please log in again.';
        localStorage.removeItem(AUTH_TOKEN);
        store.dispatch(signOutSuccess());
    }

    if (error.response?.status === 404) {
        notificationParam.message = 'Not Found';
        notificationParam.description = 'The requested resource was not found.';
    } else if (error.response?.status === 500) {
        notificationParam.message = 'Internal Server Error';
        notificationParam.description = 'An error occurred on the server.';
    } else if (error.response?.status === 508) {
        notificationParam.message = 'Timeout';
        notificationParam.description = 'The request timed out.';
    }

    notification.error(notificationParam);
    return Promise.reject(error);
});

export default service;
