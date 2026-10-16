import api from './api';

export const compareProducts = async (productName) => {
  const response = await api.get('/compare', {
    params: { productName },
  });
  return response.data;
};

export default { compareProducts };
