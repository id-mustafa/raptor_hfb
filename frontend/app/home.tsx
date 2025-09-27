import { Stack, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/utils/AuthProvider';

export default function Home() {
  const router = useRouter();
  const { username, friends, incomingRequests, rooms, loading, error, refresh } = useAuth();

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

        <Button onPress={() => router.push('/lobby')} className="w-64">
          <Text>Join Lobby</Text>
        </Button>

  <Button variant="outline" onPress={() => { void refresh(); }} className="w-64">
          <Text>Refresh from server</Text>
        </Button>

        <View className="w-full max-w-md gap-2">
          <Text className="text-lg font-semibold">Friends</Text>
          {friends.length === 0 ? (
            <Text className="text-muted-foreground">No friends yet</Text>
          ) : (
            friends.map((friend) => (
              <Text key={friend.username} className="text-foreground">
                • {friend.username}
              </Text>
            ))
          )}
        </View>

        <View className="w-full max-w-md gap-2">
          <Text className="text-lg font-semibold">Incoming Requests</Text>
          {incomingRequests.length === 0 ? (
            <Text className="text-muted-foreground">No pending requests</Text>
          ) : (
            incomingRequests.map((requester) => (
              <Text key={requester.username} className="text-foreground">
                • {requester.username}
              </Text>
            ))
          )}
        </View>

        <View className="w-full max-w-md gap-2 pb-12">
          <Text className="text-lg font-semibold">Active Rooms</Text>
          {rooms.length === 0 ? (
            <Text className="text-muted-foreground">No rooms yet</Text>
          ) : (
            rooms.map((room) => (
              <Text key={room.id} className="text-foreground">
                • Room #{room.id} · Game {room.game_id}
              </Text>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
