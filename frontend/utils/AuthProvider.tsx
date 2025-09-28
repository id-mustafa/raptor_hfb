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
  startGame as apiStartGame,
  normalizeRawQuestion,
} from "@/api";
import {
  getAllQuestions,
  startQuestions as apiStartQuestions,
  updateUserTokens as apiUpdateUserTokens,
} from "@/api/questions";
import type { RawQuestion, Room, User } from "@/api";

// ✅ Question type based on backend
type Question = {
  id: number;
  question_text: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  correct_answer: number; // Backend: likely 1–4, so we normalize to 0–3
};

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
  enablePolling: () => void;
  disablePolling: () => void;
  isPolling: boolean;
  gameStartTime: Date | null;
  setGameStartTime: (time: Date | null) => void;
  setCurrentQuestion: (question: string | null) => void;
  startGame: (roomId: number) => Promise<boolean>;

  // ✅ Question-related state/methods
  questions: Question[];
  currentQuestion: string | null;
  options: string[];
  correctAnswer: number | null;
  startQuestions: () => Promise<void>;
  updateUserTokens: (username: string, tokens: number) => Promise<void>; // fixed
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

const avatars = [
  require("@/assets/images/avatar1.jpg"),
  require("@/assets/images/avatar2.jpg"),
  require("@/assets/images/avatar3.jpg"),
  require("@/assets/images/avatar4.jpg"),
  require("@/assets/images/avatar5.jpg"),
];

const POLLING_INTERVAL = 5000; // 5 seconds

const DEFAULT_POINTS = 200;

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

  // ✅ New Question state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<number | null>(null);

  const pollingIntervalRef = useRef<number | null>(null);
  const shouldPollRef = useRef(false);

  // Helpers
  const assignAvatars = (users: User[]) =>
    users.map((u, index) => ({
      ...u,
      avatar: avatars[index % avatars.length],
    }));

  const normalizeOptions = (q: Question): string[] => {
    return [q.option_1, q.option_2, q.option_3, q.option_4];
  };

  const normalizeAnswer = (q: Question): number | null => {
    return typeof q.correct_answer === "number" ? q.correct_answer - 1 : null;
  };

  // Fetch all user/friends/rooms/questions
  const prevCountRef = useRef(0);

  const fetchAll = useCallback(
    async (name: string, isPollingRequest = false) => {
      if (!isPollingRequest) setLoading(true);
      try {
        const [
          resolvedUser,
          friendList,
          requestList,
          roomList,
          allUsersList,
        ] = await Promise.all([
          resolveUser(name),
          getFriends(name),
          getIncomingRequests(name),
          getRooms(),
          getAllUsers(),
        ]);

        setUser(resolvedUser);
        if (resolvedUser.room_id) setCurrentRoomId(resolvedUser.room_id);
        if (resolvedUser.tokens) setPoints(resolvedUser.tokens);

        setFriends(friendList);
        setIncomingRequests(requestList);
        setRooms(roomList);
        setAllUsers(
          assignAvatars(
            allUsersList.sort((a, b) => a.username.localeCompare(b.username)),
          ),
        );

        // ✅ only fetch questions if a valid room ID exists
        if (currentRoomId) {
          const rawQs = await getAllQuestions(currentRoomId.toString());
          setQuestions(rawQs.map(normalizeRawQuestion));
        } else {
          setQuestions([]); // clear when no room
        }

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
        if (!isPollingRequest) setLoading(false);
      }
    },
    [currentRoomId],
  );

  const startGameHandler = useCallback(
    async (roomId: number) => {
      const success = await apiStartGame(roomId);
      return success;
    },
    [username]
  );

  useEffect(() => {
    if (!questions || questions.length === 0) return;

    if (questions.length > prevCountRef.current) {
      const newQ = questions[questions.length - 1];
      setCurrentQuestion(newQ.question_text); // ✅ correct property
      setOptions(normalizeOptions(newQ));
      setCorrectAnswer(normalizeAnswer(newQ));
      prevCountRef.current = questions.length;
    }
  }, [questions, setCurrentQuestion]);

  const fetchAllRef = useRef(fetchAll);
  useEffect(() => { fetchAllRef.current = fetchAll; }, [fetchAll]);

  const enablePolling = useCallback(() => {
    if (!username || pollingIntervalRef.current) return;
    shouldPollRef.current = true;
    setIsPolling(true);
    pollingIntervalRef.current = setInterval(() => {
      if (shouldPollRef.current && username) {
        fetchAllRef.current(username, true); // always latest
      }
    }, POLLING_INTERVAL);
  }, [username]);

  const disablePolling = useCallback(() => {
    shouldPollRef.current = false;
    setIsPolling(false);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  useEffect(() => () => disablePolling(), [disablePolling]);

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
      disablePolling();
      return;
    }
    void fetchAll(username);
    enablePolling();
  }, [username, fetchAll, enablePolling, disablePolling]);

  // Auth / friends / rooms handlers
  const handleSetUsername = useCallback((name: string | null) => setUsernameState(name), []);

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

  const startQuestionsHandler = useCallback(async () => {
    if (!currentRoomId) {
      console.warn("Cannot start questions without a valid room ID");
      return;
    }

    setQuestions([]);
    setCurrentQuestion(null);
    setOptions([]);
    setCorrectAnswer(null);

    for (const user of currentRoomUsers) {
      if (user.tokens !== DEFAULT_POINTS) {
        await apiUpdateUserTokens(user.username, DEFAULT_POINTS);
      }
    }

    await apiStartQuestions(currentRoomId.toString());
  }, [currentRoomId]);

  // ✅ Fixed updateUserTokens
  const updateUserTokens = useCallback(
    async (name: string, tokens: number) => {
      await apiUpdateUserTokens(name, tokens);
      if (username === name) {
        setPoints(tokens); // update local state immediately
      }
    },
    [username]
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

      // ✅ questions
      questions,
      currentQuestion,
      options,
      correctAnswer,
      startQuestions: startQuestionsHandler,
      updateUserTokens,
      setCurrentQuestion,
      startGame: startGameHandler
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
      questions,
      currentQuestion,
      options,
      correctAnswer,
      startQuestionsHandler,
      updateUserTokens,
      setCurrentQuestion,
      startGameHandler,
    ],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
