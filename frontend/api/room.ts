import { apiClient } from './client';
import type { Room } from './types';

export async function getRooms(): Promise<Room[]> {
  return apiClient.get<Room[]>('/room');
}

export async function createRoom(username: string): Promise<Room> {
  return apiClient.post<Room>('/room/create', {
    searchParams: { username },
  });
}

export async function joinRoom(username: string, roomId: number): Promise<boolean> {
  return apiClient.post<boolean>(`/room/join/${roomId}`, {
    searchParams: { username },
  });
}

export async function leaveRoom(username: string): Promise<boolean> {
  return apiClient.post<boolean>(`/room/leave/${encodeURIComponent(username)}`);
}
