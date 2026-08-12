import api from './api';

export const getTransformers = async (params = {}) => {
  const res = await api.get('/transformers', { params });
  return res.data;
};

export const getTransformerById = async (id) => {
  const res = await api.get(`/transformers/${id}`);
  return res.data;
};

export const createTransformer = async (data) => {
  const res = await api.post('/transformers', data);
  return res.data;
};

export const updateTransformer = async (id, data) => {
  const res = await api.put(`/transformers/${id}`, data);
  return res.data;
};

export const deleteTransformer = async (id) => {
  const res = await api.delete(`/transformers/${id}`);
  return res.data;
};

export const getTransformerReadings = async (id, params = {}) => {
  const res = await api.get(`/transformers/${id}/readings`, { params });
  return res.data;
};
