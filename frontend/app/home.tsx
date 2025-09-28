import { Stack, useFocusEffect, useRouter } from "expo-router";
import {
  Platform,
  Keyboard,
  Pressable,
  RefreshControl,
  View,
  BackHandler,
  Modal,
  ActivityIndicator,
} from "react-native";
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
import { Input } from "@/components/ui/input";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const USE_DUMMY_DATA = false;

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
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBack
      );
      return () => subscription.remove();
    }, [handleBack])
  );

  const {
    username,
    friends,
    incomingRequests,
    rooms,
    error,
    refresh,
    acceptRequest,
    declineRequest,
    sendRequest,
    joinRoomForUser,
    createRoomForUser,
  } = useAuth();

  const [newFriend, setNewFriend] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [joiningRoomId, setJoiningRoomId] = useState<number | null>(null);
  const [processingReq, setProcessingReq] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const handleSendRequest = async () => {
    if (!username || !newFriend.trim()) return;
    try {
      await sendRequest(username, newFriend.trim());
      setNewFriend("");
      await refresh();
    } catch (err) {
      console.error("Failed to send request:", err);
    }
  };

  const dummyFriends = [{ username: "Alice" }, { username: "Bob" }, { username: "Charlie" }];
  const dummyRequests = [{ username: "David" }, { username: "Eve" }];
  const dummyRooms: RoomLike[] = [{ id: 1, participants: [{ username: "Bob" }] }];

  const effectiveFriends = friends;
  const effectiveRequests = incomingRequests;
  const effectiveRooms = dummyRooms;

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
        return room.users.map((u: any) => u?.username).filter((n): n is string => Boolean(n));
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

  const handleJoinRoom = async (roomId: number | null) => {
    if (!roomId) return;
    if (USE_DUMMY_DATA) return;
    if (!username) return;
    try {
      setJoiningRoomId(roomId);
      const ok = await joinRoomForUser(username, roomId);
      if (ok) {
        router.push("/lobby");
      }
    } finally {
      setJoiningRoomId(null);
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

  const showSpinner = loading || joiningRoomId !== null || processingReq !== null;

  return (
    <>
      <KeyboardAwareScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={Platform.OS === "ios" ? 64 : 80}
      >
        <View className="flex-1 items-center gap-6 p-4 flex flex-col">
          <Stack.Screen
            options={{
              title: `Welcome${username ? `, ${username}` : ""}`,
              headerLeft: () => (
                <Pressable onPress={() => router.push("/")}>
                  <ChevronLeft size={24} color={THEME.dark.secondary} />
                </Pressable>
              ),
            }}
          />

          {error && !USE_DUMMY_DATA && <Text className="text-destructive">{error}</Text>}

          <CreateLobbyCard
            navigateLobby={async () => {
              if (!username) return;
              try {
                setLoading(true);
                const room = await createRoomForUser(username);
                router.push("/lobby");
              } catch (err) {
                console.error("Failed to create room", err);
              } finally {
                setLoading(false);
              }
            }}
          />

          {/* Friends & Rooms */}
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Your Friends</CardTitle>
            </CardHeader>
            <CardContent className="gap-2">
              {effectiveFriends && effectiveFriends.length === 0 ? (
                <Text className="text-muted-foreground">No friends yet</Text>
              ) : (
                sortedFriends.map((friend) => {
                  return (
                    <Pressable
                      key={friend.username}
                      className="flex-row items-center justify-between rounded-md bg-muted/20 px-4 py-2"
                      onPress={friend.room_id ? () => handleJoinRoom(friend.room_id) : undefined}
                    >
                      <Text className="text-base text-foreground">{friend.username}</Text>
                      {friend.room_id ? (
                        <Text className="text-sm font-medium text-green-600">
                          {joiningRoomId === friend.room_id ? "Joining…" : `In Room #${friend.room_id}`}
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
              <View className="flex-row items-center gap-2 mb-2">
                <Input
                  value={newFriend}
                  onChangeText={setNewFriend}
                  placeholder="Enter username"
                  className="flex-1 border border-muted rounded-md px-3 py-2 text-foreground"
                  placeholderTextColor="#888"
                />
                <Button onPress={handleSendRequest}>
                  <Text>Send</Text>
                </Button>
              </View>
              {effectiveRequests.length === 0 ? (
                <Text className="text-muted-foreground">No pending requests</Text>
              ) : (
                effectiveRequests.map((req) => {
                  const isAccepting = processingReq === `${req.username}-accept`;
                  const isDeclining = processingReq === `${req.username}-decline`;
                  return (
                    <View
                      key={req.username}
                      className="flex-row items-center justify-between rounded-md bg-muted/20 px-4 py-2"
                    >
                      <Text className="text-base text-foreground">{req.username}</Text>
                      <View className="flex-row">
                        <Button
                          size="icon"
                          variant="ghost"
                          onPress={() => handleAccept(req.username)}
                          disabled={isAccepting || isDeclining}
                        >
                          {isAccepting ? <Text>…</Text> : <Icon as={Check} />}
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
      </KeyboardAwareScrollView>

      {/* Fullscreen Spinner Overlay */}
      <Modal transparent visible={showSpinner} animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: "#fff", marginTop: 12, fontSize: 22 }}>Creating Room...</Text>
        </View>
      </Modal>
    </>
  );
}
