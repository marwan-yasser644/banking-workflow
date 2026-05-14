import api from './api-client';
import { NotificationItem } from '../types';

export const getNotifications = async (unreadOnly = false): Promise<NotificationItem[]> => {
  const response = await api.get<NotificationItem[]>('/notifications', { params: { unread_only: unreadOnly } });
  return response.data;
};

export const markNotificationRead = async (notificationId: number): Promise<NotificationItem> => {
  const response = await api.patch<NotificationItem>(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  await api.post('/notifications/read-all');
};
