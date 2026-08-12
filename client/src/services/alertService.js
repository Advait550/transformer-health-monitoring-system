import api from './api';

export const getAlertsByTransformer = async (transformerId, params = {}) => {
  const res = await api.get(`/transformers/${transformerId}/alerts`, { params });
  return res.data;
};

export const acknowledgeAlert = async (alertId) => {
  const res = await api.post(`/alerts/${alertId}/acknowledge`);
  return res.data;
};
