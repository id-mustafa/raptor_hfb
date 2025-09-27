import { apiClient } from './client';
import type { User } from './types';

export async function getFriends(username: string): Promise<User[]> {
  return apiClient.get<User[]>(`/${encodeURIComponent(username)}/friends`);
}
