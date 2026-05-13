import api from '../services/api-client';
import { TokenResponse, User } from '../types';

export const login = async (username: string, password: string): Promise<TokenResponse> => {
  const response = await api.post<TokenResponse>('/auth/login', {
    username,
    password,
  });
  return response.data;
};

export const fetchCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>('/auth/me');
  return response.data;
};

export const createUser = async (data: {
  username: string;
  email: string;
  full_name: string;
  role: string;
  password: string;
}) => {
  const response = await api.post<User>('/users', data);
  return response.data;
};
