import { Stack, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useMemo, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/utils/AuthProvider';
import { joinRoom } from '@/api';

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

  const [joiningRoomId, setJoiningRoomId] = useState<number | null>(null);
  const [processingReq, setProcessingReq] = useState<string | null>(null); // `${requester}-accept|decline`

  // Map friend username -> their room (if any)
  const friendToRoom = useMemo(() => {
    const map = new Map<string, RoomLike>();
    const pickUsernames = (room: RoomLike): string[] => {
      if (Array.isArray(room.participants)) {
        return room.participants.map((p: any) => (typeof p === 'string' ? p : p?.username)).filter(Boolean);
      }
      if (Array.isArray(room.users)) {
        return room.users.map((u: any) => u?.username).filter(Boolean);
      }
      if (Array.isArray(room.members)) {
        return room.members.map((m: any) => (typeof m === 'string' ? m : m?.username)).filter(Boolean);
      }
      const owners: string[] = [];
      if (room.owner) owners.push(room.owner);
      if (room.host) owners.push(room.host);
      return owners.filter(Boolean) as string[];
    };

    (rooms as RoomLike[]).forEach((room) => {
      pickUsernames(room).forEach((n) => {
        if (n) map.set(n, room);
      });
    });
    return map;
  }, [rooms]);

  const handleJoinRoom = async (roomId: number) => {
    if (!username) return;
    try {
      setJoiningRoomId(roomId);
      const ok = await joinRoom(username, roomId);
      if (ok) await refresh();
    } catch (e) {
      console.error('Join failed', e);
    } finally {
      setJoiningRoomId(null);
    }
  };

  const handleAccept = useCallback(
    async (fromUser: string) => {
      if (!username) return;
      try {
        setProcessingReq(`${fromUser}-accept`);
        await acceptRequest(fromUser, username); // from -> to (you)
        await refresh();
      } catch (e) {
        console.error('Accept failed', e);
      } finally {
        setProcessingReq(null);
      }
    },
    [acceptRequest, refresh, username],
  );

  const handleDecline = useCallback(
    async (fromUser: string) => {
      if (!username) return;
      try {
        setProcessingReq(`${fromUser}-decline`);
        await declineRequest(fromUser, username); // from -> to (you)
        await refresh();
      } catch (e) {
        console.error('Decline failed', e);
      } finally {
        setProcessingReq(null);
      }
    },
    [declineRequest, refresh, username],
  );

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 items-center gap-4 p-4">
        <Stack.Screen options={{ title: 'Home' }} />

        <Text className="text-xl font-bold">Welcome{username ? `, ${username}` : ''}</Text>

        {loading && <Text className="text-muted-foreground">Loading your data…</Text>}
        {error && <Text className="text-destructive">{error}</Text>}

        <Button onPress={() => router.push('/lobby')} className="w-64">
          <Text>Create Lobby</Text>
        </Button>

        <Button variant="outline" onPress={() => { void refresh(); }} className="w-64">
          <Text>Refresh from server</Text>
        </Button>

        {/* --- Combined Friends + Rooms --- */}
        <View className="w-full max-w-md gap-3">
          <Text className="text-lg font-semibold">Friends & Rooms</Text>
          {friends.length === 0 ? (
            <Text className="text-muted-foreground">No friends yet</Text>
          ) : (
            friends.map((friend) => {
              const room = friendToRoom.get(friend.username);
              return (
                <View
                  key={friend.username}
                  className="flex-row items-center justify-between rounded-xl border border-border px-3 py-2 bg-card"
                  style={{ gap: 8 }}
                >
                  <View style={{ flexShrink: 1 }}>
                    <Text className="text-foreground font-medium">{friend.username}</Text>
                    <Text className="text-muted-foreground text-xs">
                      {room ? `In Room #${room.id}${room.game_id ? ` · Game ${room.game_id}` : ''}` : 'Offline / Not in a room'}
                    </Text>
                  </View>

                  {room ? (
                    <Button
                      size="sm"
                      onPress={() => handleJoinRoom(room.id)}
                      disabled={joiningRoomId === room.id}
                    >
                      <Text>{joiningRoomId === room.id ? 'Joining…' : 'Join'}</Text>
                    </Button>
                  ) : (
                    <View className="px-2 py-1 rounded-md bg-muted">
                      <Text className="text-xs text-muted-foreground">Not in room</Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* --- Incoming Requests with Accept / Decline --- */}
        <View className="w-full max-w-md gap-3 pb-12">
          <Text className="text-lg font-semibold">Incoming Requests</Text>
          {incomingRequests.length === 0 ? (
            <Text className="text-muted-foreground">No pending requests</Text>
          ) : (
            incomingRequests.map((requester) => {
              const isAccepting = processingReq === `${requester.username}-accept`;
              const isDeclining = processingReq === `${requester.username}-decline`;
              return (
                <View
                  key={requester.username}
                  className="rounded-xl border border-border bg-card px-3 py-2"
                  style={{ gap: 8 }}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-foreground font-medium">{requester.username}</Text>
                    <View className="flex-row" style={{ gap: 8 }}>
                      <Button
                        size="sm"
                        onPress={() => handleAccept(requester.username)}
                        disabled={isAccepting || isDeclining || !username}
                      >
                        <Text>{isAccepting ? 'Accepting…' : 'Accept'}</Text>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onPress={() => handleDecline(requester.username)}
                        disabled={isAccepting || isDeclining || !username}
                      >
                        <Text>{isDeclining ? 'Declining…' : 'Decline'}</Text>
                      </Button>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>
    </ScrollView>
  );
}
