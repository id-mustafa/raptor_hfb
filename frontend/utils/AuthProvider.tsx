import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";

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
} from "@/api";
import type { Room, User } from "@/api";

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
  points: number;
  setPoints: (newPoints: number) => void;
  currentRoomId: number | null;
  setCurrentRoomId: (id: number | null) => void;
  allUsers: User[];
  currentRoomUsers: User[];
  // New: ability to control polling
  enablePolling: () => void;
  disablePolling: () => void;
  isPolling: boolean;
  gameStartTime: Date | null;
  setGameStartTime: (time: Date | null) => void;
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

// at the top of your AuthProvider file
const avatars = [
  require("@/assets/images/avatar1.jpg"),
  require("@/assets/images/avatar2.jpg"),
  require("@/assets/images/avatar3.jpg"),
  require("@/assets/images/avatar4.jpg"),
  require("@/assets/images/avatar5.jpg"),
];

const POLLING_INTERVAL = 5000; // 5 seconds

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsernameState] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [points, setPoints] = useState<number>(100);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);

  // Use refs to track polling state
  const pollingIntervalRef = useRef<number | null>(null);
  const shouldPollRef = useRef(false);

  // helper to assign avatars
  const assignAvatars = (users: User[]) => {
    return users.map((u, index) => ({
      ...u,
      avatar: avatars[index % avatars.length],
    }));
  };

  const fetchAll = useCallback(
    async (name: string, isPollingRequest = false) => {
      // Don't set loading state for polling requests to avoid UI flicker
      if (!isPollingRequest) {
        setLoading(true);
      }

      try {
        const [resolvedUser, friendList, requestList, roomList, allUsersList] =
          await Promise.all([
            resolveUser(name),
            getFriends(name),
            getIncomingRequests(name),
            getRooms(),
            getAllUsers(),
          ]);

        setUser(resolvedUser);
        if (resolvedUser.room_id) {
          setCurrentRoomId(resolvedUser.room_id);
        }
        if (resolvedUser.tokens) {
          setPoints(resolvedUser.tokens);
        }
        setFriends(friendList);
        setIncomingRequests(requestList);
        setRooms(roomList);
        setAllUsers(assignAvatars(allUsersList.sort((a, b) => a.username.localeCompare(b.username))));
        setError(null);
      } catch (err) {
        console.error("Failed to fetch auth data", err);
        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Failed to reach the server";
        setError(message);
      } finally {
        if (!isPollingRequest) {
          setLoading(false);
        }
      }
    },
    [],
  );

  // Polling control functions
  const enablePolling = useCallback(() => {
    if (!username || pollingIntervalRef.current) return;

    shouldPollRef.current = true;
    setIsPolling(true);

    pollingIntervalRef.current = setInterval(() => {
      if (shouldPollRef.current && username) {
        fetchAll(username, true);
      }
    }, POLLING_INTERVAL);
  }, [username, fetchAll]);

  const disablePolling = useCallback(() => {
    shouldPollRef.current = false;
    setIsPolling(false);

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Clean up polling on component unmount or username change
  useEffect(() => {
    return () => {
      disablePolling();
    };
  }, [disablePolling]);

  const currentRoomUsers = useMemo(() => {
    if (!currentRoomId) return [];
    return allUsers.filter((u) => u.room_id === currentRoomId);
  }, [allUsers, currentRoomId]);

  useEffect(() => {
    if (!username) {
      setUser(null);
      setFriends([]);
      setIncomingRequests([]);
      setRooms([]);
      setError(null);
      setLoading(false);
      disablePolling(); // Stop polling when no username
      return;
    }

    void fetchAll(username);
    enablePolling(); // Start polling when username is set
  }, [username, fetchAll, enablePolling, disablePolling]);

  const handleSetUsername = useCallback((name: string | null) => {
    setUsernameState(name);
  }, []);

  const refresh = useCallback(async () => {
    if (!username) return;
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
        setCurrentRoomId(roomId);
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
        setCurrentRoomId(null);
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
      points,
      setPoints,
      currentRoomId,
      setCurrentRoomId,
      allUsers,
      currentRoomUsers,
      enablePolling,
      disablePolling,
      isPolling,
      gameStartTime,
      setGameStartTime,
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
      points,
      setPoints,
      currentRoomId,
      allUsers,
      currentRoomUsers,
      enablePolling,
      disablePolling,
      isPolling,
      gameStartTime,
      setGameStartTime,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}