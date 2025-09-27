import { apiClient } from './client';
import type { User } from './types';

export async function getUser(username: string): Promise<User> {
  return apiClient.get<User>(`/user/${encodeURIComponent(username)}`);
}

export async function createUser(username: string): Promise<User> {
  return apiClient.post<User>(`/user/${encodeURIComponent(username)}`);
}

export async function getAllUsers(): Promise<User[]> {
  return apiClient.get<User[]>('/user/');
}
