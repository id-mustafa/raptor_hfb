import { apiClient } from './client';
import type { FriendRequest, User } from './types';

export async function sendFriendRequest(
  username1: string,
  username2: string
): Promise<FriendRequest> {
  return apiClient.post<FriendRequest>(
    `/${encodeURIComponent(username1)}/request/${encodeURIComponent(username2)}`
  );
}

export async function getIncomingRequests(username: string): Promise<User[]> {
  return apiClient.get<User[]>(`/${encodeURIComponent(username)}/request`);
}

export async function acceptFriendRequest(username1: string, username2: string): Promise<void> {
  await apiClient.post<FriendRequest | void>(
    `/${encodeURIComponent(username2)}/accept/${encodeURIComponent(username1)}`
  );
}

export async function declineFriendRequest(username1: string, username2: string): Promise<void> {
  await apiClient.post<FriendRequest | void>(
    `/${encodeURIComponent(username2)}/decline/${encodeURIComponent(username1)}`
  );
}
