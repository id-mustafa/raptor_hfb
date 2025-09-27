import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function Game() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center gap-4 p-4 bg-background">
      <Stack.Screen options={{ title: 'Game' }} />

      <Text className="text-xl font-bold">Game</Text>

      <Button onPress={() => router.push('/question')} className="w-64">
        <Text>Start Question</Text>
      </Button>

      <Button onPress={() => router.push('/recap')} className="w-64" variant="ghost">
        <Text>End Game</Text>
      </Button>
    </View>
  );
}
