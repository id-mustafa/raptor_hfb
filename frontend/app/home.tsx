import { Stack, useFocusEffect, useRouter } from "expo-router";
import { ScrollView, View, Pressable, RefreshControl } from "react-native";
import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ChevronLeft } from "lucide-react-native";
import { useAuth } from "@/utils/AuthProvider";
import { CreateLobbyCard } from "@/components/ui/create-lobby-card";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Check, X } from "lucide-react-native";
import { joinRoom } from "@/api";
import { navigate } from "expo-router/build/global-state/routing";
import { THEME } from "@/lib/theme";
import { BackHandler } from "react-native";

const USE_DUMMY_DATA = true;

type RoomLike = {
  id: number;
  game_id?: number;
  participants?: { username?: string }[] | string[];
  users?: { username?: string }[];
  members?: { username?: string }[] | string[];
  owner?: string;
  host?: string;
};

export default function Home() {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.push("/");
    return true;
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", handleBack);
      return () =>
        subscription.remove();
    }, [handleBack])
  );

  const {
    username,
    friends,
    incomingRequests,
    rooms,
    loading,
    error,
    refresh,
    acceptRequest,
    declineRequest,
  } = useAuth();

  const dummyFriends = [
    {
      username: "Alice",
    },
    {
      username: "Bob",
    },
    {
      username: "Charlie",
    },
  ];

  const dummyRequests = [
    { username: "David" },
    { username: "Eve" },
  ];

  const dummyRooms: RoomLike[] = [
    { id: 1, participants: [{ username: "Bob" }] },
  ];

  const effectiveFriends = USE_DUMMY_DATA ? dummyFriends : friends;
  const effectiveRequests = USE_DUMMY_DATA ? dummyRequests : incomingRequests;
  const effectiveRooms = USE_DUMMY_DATA ? dummyRooms : rooms;

  const [refreshing, setRefreshing] = useState(false);
  const [joiningRoomId, setJoiningRoomId] = useState<number | null>(null);
  const [processingReq, setProcessingReq] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    if (USE_DUMMY_DATA) {
      setRefreshing(false);
      return;
    }
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const friendToRoom = useMemo(() => {
    const map = new Map<string, RoomLike>();
    const pickUsernames = (room: RoomLike): string[] => {
      if (Array.isArray(room.participants)) {
        return room.participants
          .map((p: any) => (typeof p === "string" ? p : p?.username))
          .filter((n): n is string => Boolean(n));
      }
      if (Array.isArray(room.users)) {
        return room.users
          .map((u: any) => u?.username)
          .filter((n): n is string => Boolean(n));
      }
      if (Array.isArray(room.members)) {
        return room.members
          .map((m: any) => (typeof m === "string" ? m : m?.username))
          .filter((n): n is string => Boolean(n));
      }

      const owners: string[] = [];
      if (room.owner) owners.push(room.owner);
      if (room.host) owners.push(room.host);
      return owners;
    };
    (effectiveRooms as RoomLike[]).forEach((room) => {
      pickUsernames(room).forEach((n) => n && map.set(n, room));
    });
    return map;
  }, [effectiveRooms]);

  const handleJoinRoom = async (roomId: number) => {
    if (USE_DUMMY_DATA) return;
    if (!username) return;
    try {
      setJoiningRoomId(roomId);
      const ok = await joinRoom(username, roomId);
      if (ok) await refresh();
    } finally {
      setJoiningRoomId(null);
      navigate("/lobby");
    }
  };

  const handleAccept = async (fromUser: string) => {
    if (USE_DUMMY_DATA) return;
    if (!username) return;
    try {
      setProcessingReq(`${fromUser}-accept`);
      await acceptRequest(fromUser, username);
      await refresh();
    } finally {
      setProcessingReq(null);
    }
  };

  const handleDecline = async (fromUser: string) => {
    if (USE_DUMMY_DATA) return;
    if (!username) return;
    try {
      setProcessingReq(`${fromUser}-decline`);
      await declineRequest(fromUser, username);
      await refresh();
    } finally {
      setProcessingReq(null);
    }
  };

  const sortedFriends = [...effectiveFriends].sort((a, b) => {
    const aInRoom = friendToRoom.get(a.username) ? 1 : 0;
    const bInRoom = friendToRoom.get(b.username) ? 1 : 0;

    if (aInRoom !== bInRoom) return bInRoom - aInRoom;
    return a.username.localeCompare(b.username);
  });

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="flex-1 items-center gap-6 p-4 flex flex-col">
        <Stack.Screen
          options={{
            title: `Welcome${username ? `, ${username}` : ""}`,
            headerLeft: () => (
              <Pressable onPress={() => router.push('/')}>
                <ChevronLeft size={24} color={THEME.dark.secondary} />
              </Pressable>
            )
          }}
        />

        {loading && !USE_DUMMY_DATA && (
          <Text className="text-muted-foreground">Loading…</Text>
        )}
        {error && !USE_DUMMY_DATA && (
          <Text className="text-destructive">{error}</Text>
        )}

        <CreateLobbyCard navigateLobby={() => router.push("/lobby")} />

        {/* Friends & Rooms */}
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Your Friends</CardTitle>
          </CardHeader>
          <CardContent className="gap-2">
            {effectiveFriends.length === 0 ? (
              <Text className="text-muted-foreground">No friends yet</Text>
            ) : (
              sortedFriends.map((friend) => {
                const room = friendToRoom.get(friend.username);
                return (
                  <Pressable
                    key={friend.username}
                    className="flex-row items-center justify-between rounded-md bg-muted/20 px-4 py-2"
                    onPress={
                      room ? () => handleJoinRoom(room.id) : undefined
                    }
                  >
                    <Text className="text-base text-foreground">
                      {friend.username}
                    </Text>
                    {room ? (
                      <Text className="text-sm font-medium text-green-600">
                        {joiningRoomId === room.id
                          ? "Joining…"
                          : `In Room #${room.id}`}
                      </Text>
                    ) : (
                      <Text className="text-sm text-secondary">Offline</Text>
                    )}
                  </Pressable>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Friend Requests */}
        <Card className="w-full max-w-md mb-12">
          <CardHeader>
            <CardTitle>Friend Requests</CardTitle>
          </CardHeader>
          <CardContent className="gap-2">
            {effectiveRequests.length === 0 ? (
              <Text className="text-muted-foreground">No pending requests</Text>
            ) : (
              effectiveRequests.map((req) => {
                const isAccepting =
                  processingReq === `${req.username}-accept`;
                const isDeclining =
                  processingReq === `${req.username}-decline`;
                return (
                  <View
                    key={req.username}
                    className="flex-row items-center justify-between rounded-md bg-muted/20 px-4 py-2"
                  >
                    <Text className="text-base text-foreground">
                      {req.username}
                    </Text>
                    <View className="flex-row">
                      <Button
                        size="icon"
                        variant="ghost"
                        onPress={() => handleAccept(req.username)}
                        disabled={isAccepting || isDeclining}
                      >
                        {isAccepting ? (
                          <Text>…</Text>
                        ) : (
                          <Icon as={Check} />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onPress={() => handleDecline(req.username)}
                        disabled={isAccepting || isDeclining}
                      >
                        {isDeclining ? <Text>…</Text> : <Icon as={X} />}
                      </Button>
                    </View>
                  </View>
                );
              })
            )}
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
