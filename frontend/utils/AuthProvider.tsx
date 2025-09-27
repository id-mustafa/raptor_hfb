import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  ReactNode,
} from 'react';

import {
  ApiError,
  createRoom,
  createUser,
  getAllUsers,
  getFriends,
  getIncomingRequests,
  getRooms,
  getUser,
  joinRoom,
  leaveRoom,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
} from '@/api';
import type { Room, User } from '@/api';

type AuthContextType = {
  username: string | null;
  user: User | null;
  friends: User[];
  incomingRequests: User[];
  rooms: Room[];
  loading: boolean;
  error: string | null;
  setUsername: (name: string | null) => void;
  refresh: () => Promise<void>;
  createRoomForUser: (username: string) => Promise<Room>;
  joinRoomForUser: (username: string, roomId: number) => Promise<boolean>;
  leaveRoomForUser: (username: string) => Promise<boolean>;
  sendRequest: (from: string, to: string) => Promise<void>;
  acceptRequest: (from: string, to: string) => Promise<void>;
  declineRequest: (from: string, to: string) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function resolveUser(name: string) {
  try {
    return await getUser(name);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return createUser(name);
    }
    throw error;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsernameState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(
    async (name: string) => {
      setLoading(true);
      try {
        const [resolvedUser, friendList, requestList, roomList] = await Promise.all([
          resolveUser(name),
          getFriends(name),
          getIncomingRequests(name),
          getRooms(),
        ]);

        setUser(resolvedUser);
        setFriends(friendList);
        setIncomingRequests(requestList);
        setRooms(roomList);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch auth data', err);
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Failed to reach the server';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!username) {
      setUser(null);
      setFriends([]);
      setIncomingRequests([]);
      setRooms([]);
      setError(null);
      setLoading(false);
      return;
    }

    void fetchAll(username);
  }, [username, fetchAll]);

  const handleSetUsername = useCallback(
    (name: string | null) => {
      setUsernameState(name);
      if (!name) {
        return;
      }
    },
    [],
  );

  const refresh = useCallback(async () => {
    if (!username) {
      return;
    }
    await fetchAll(username);
  }, [username, fetchAll]);

  const createRoomForUser = useCallback(
    async (name: string) => {
      const room = await createRoom(name);
      if (username === name) {
        await fetchAll(name);
      }
      return room;
    },
    [fetchAll, username],
  );

  const joinRoomForUser = useCallback(
    async (name: string, roomId: number) => {
      const success = await joinRoom(name, roomId);
      if (success && username === name) {
        await fetchAll(name);
      }
      return success;
    },
    [fetchAll, username],
  );

  const leaveRoomForUser = useCallback(
    async (name: string) => {
      const success = await leaveRoom(name);
      if (success && username === name) {
        await fetchAll(name);
      }
      return success;
    },
    [fetchAll, username],
  );

  const sendRequest = useCallback(
    async (from: string, to: string) => {
      await sendFriendRequest(from, to);
      if (username && (username === to || username === from)) {
        await fetchAll(username);
      }
    },
    [fetchAll, username],
  );

  const acceptRequestHandler = useCallback(
    async (from: string, to: string) => {
      await acceptFriendRequest(from, to);
      if (username && (username === to || username === from)) {
        await fetchAll(username);
      }
    },
    [fetchAll, username],
  );

  const declineRequestHandler = useCallback(
    async (from: string, to: string) => {
      await declineFriendRequest(from, to);
      if (username && (username === to || username === from)) {
        await fetchAll(username);
      }
    },
    [fetchAll, username],
  );

  const contextValue = useMemo(
    () => ({
      username,
      user,
      friends,
      incomingRequests,
      rooms,
      loading,
      error,
      setUsername: handleSetUsername,
      refresh,
      createRoomForUser,
      joinRoomForUser,
      leaveRoomForUser,
      sendRequest,
      acceptRequest: acceptRequestHandler,
      declineRequest: declineRequestHandler,
      getAllUsers,
    }),
    [
      username,
      user,
      friends,
      incomingRequests,
      rooms,
      loading,
      error,
      handleSetUsername,
      refresh,
      createRoomForUser,
      joinRoomForUser,
      leaveRoomForUser,
      sendRequest,
      acceptRequestHandler,
      declineRequestHandler,
    ],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
