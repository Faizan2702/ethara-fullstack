import axios from 'axios';

const API_URL = 'ethara-fullstack-production.up.railway.app/api'; 
const handleApiError = (error) => {
  console.error("API Error Details:", error);
  if (error.message === "Network Error") {
    alert("🚨 NETWORK ERROR: The React frontend cannot reach the Node.js backend. Make sure your backend terminal is running 'npm start' and the API_URL is correct!");
  } else {
    alert(`🚨 ERROR: ${error.response?.data?.error || error.message}`);
  }
  throw error;
};

export const loginUser = (data) => axios.post(`${API_URL}/auth/login`, data).catch(handleApiError);
export const registerUser = (data) => axios.post(`${API_URL}/auth/register`, data).catch(handleApiError);

export const getProjects = () => axios.get(`${API_URL}/projects`).catch(handleApiError);
export const createProject = (data) => axios.post(`${API_URL}/projects`, data).catch(handleApiError);

export const getTasks = () => axios.get(`${API_URL}/tasks`).catch(handleApiError);
export const createTask = (data) => axios.post(`${API_URL}/tasks`, data).catch(handleApiError);
export const updateTaskStatus = (id, status) => axios.put(`${API_URL}/tasks/${id}`, { status }).catch(handleApiError);

export const getUsers = () => axios.get(`${API_URL}/users`).catch(handleApiError);
