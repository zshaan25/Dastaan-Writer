import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dastaan_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Health Check
export const checkApiHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Auth API Calls
export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const getAuthMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// User Profile API Calls
export const getUserProfile = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const updateUserProfile = async (data) => {
  const response = await api.put('/users/me', data);
  return response.data;
};

// Conversation API Calls
export const createConversation = async (data = {}) => {
  const response = await api.post('/conversations', data);
  return response.data;
};

export const getConversations = async () => {
  const response = await api.get('/conversations');
  return response.data;
};

export const getConversationById = async (id) => {
  const response = await api.get(`/conversations/${id}`);
  return response.data;
};

export const deleteConversation = async (id) => {
  const response = await api.delete(`/conversations/${id}`);
  return response.data;
};

export const sendConversationMessage = async (id, message) => {
  const response = await api.post(`/conversations/${id}/messages`, { message });
  return response.data;
};

// Post API Calls
export const generatePost = async (data) => {
  const response = await api.post('/posts/generate', data);
  return response.data;
};

export const refinePost = async (data) => {
  const response = await api.post('/posts/refine', data);
  return response.data;
};

export const generatePostAlternatives = async (postId) => {
  const response = await api.post('/posts/alternatives', { postId });
  return response.data;
};

export const getPosts = async () => {
  const response = await api.get('/posts');
  return response.data;
};

export const getPostById = async (id) => {
  const response = await api.get(`/posts/${id}`);
  return response.data;
};

export const updatePost = async (id, data) => {
  const response = await api.put(`/posts/${id}`, data);
  return response.data;
};

export const getPostByConversation = async (conversationId) => {
  const response = await api.get(`/posts/conversation/${conversationId}`);
  return response.data;
};

export const approvePost = async (id) => {
  const response = await api.post(`/posts/${id}/approve`);
  return response.data;
};

export const deletePost = async (id) => {
  const response = await api.delete(`/posts/${id}`);
  return response.data;
};

// Email API Calls (Resend)
export const sendTestEmail = async (data) => {
  const response = await api.post('/email/test', data);
  return response.data;
};

export const sendPostEmail = async (postId) => {
  const response = await api.post('/email/send-post', { postId });
  return response.data;
};

export default api;
