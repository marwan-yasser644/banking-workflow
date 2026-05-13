import api from './api-client';
import { User, PaginatedResponse } from '../types';

export const getUsers = async (page = 1, size = 20): Promise<User[]> => {
  const response = await api.get<User[]>('/users', { params: { skip: (page - 1) * size, limit: size } });
  return response.data;
};

export const createUser = async (payload: {
  username: string;
  email: string;
  full_name: string;
  password: string;
  role: string;
}) => {
  const response = await api.post<User>('/users', payload);
  return response.data;
};

export const updateUser = async (userId: string, payload: Partial<User>) => {
  const response = await api.patch<User>(`/users/${userId}`, payload);
  return response.data;
};

export const deleteUser = async (userId: string) => {
  await api.delete(`/users/${userId}`);
};
