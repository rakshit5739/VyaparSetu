import api from './api';

export const register = async (userData) => {
  const response = await api.post('/users/register', userData);
  return response.data;
};

export const login = async (userData) => {
  const response = await api.post('/users/login', userData);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const updateProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

export default { register, login, getProfile, updateProfile };
