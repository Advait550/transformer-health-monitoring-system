import api from './api';

export const getMaintenanceRecords = async (transformerId, params = {}) => {
  const res = await api.get(`/transformers/${transformerId}/maintenance`, { params });
  return res.data;
};

export const createMaintenanceRecord = async (transformerId, data) => {
  const res = await api.post(`/transformers/${transformerId}/maintenance`, data);
  return res.data;
};

export const updateMaintenanceRecord = async (maintenanceId, data) => {
  const res = await api.put(`/maintenance/${maintenanceId}`, data);
  return res.data;
};
