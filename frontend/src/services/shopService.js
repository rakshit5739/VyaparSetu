import api from './api';

export const getAllShops = async (params = {}) => {
  const response = await api.get('/shops', { params });
  return response.data;
};

export const getShopById = async (id) => {
  const response = await api.get(`/shops/${id}`);
  return response.data;
};

export const createShop = async (shopData) => {
  const response = await api.post('/shops', shopData);
  return response.data;
};

export const updateShop = async (id, shopData) => {
  const response = await api.put(`/shops/${id}`, shopData);
  return response.data;
};

export const deleteShop = async (id) => {
  const response = await api.delete(`/shops/${id}`);
  return response.data;
};

export default { getAllShops, getShopById, createShop, updateShop, deleteShop };
