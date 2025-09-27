import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function Lobby() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center gap-4 p-4 bg-background">
      <Stack.Screen options={{ title: 'Lobby' }} />

      <Text className="text-xl font-bold">Lobby</Text>

      <Button onPress={() => router.push('/game')} className="w-64">
        <Text>Start Game</Text>
      </Button>
    </View>
  );
}
