import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function Answer() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center gap-4 p-4 bg-background">
      <Stack.Screen options={{ title: 'Answer' }} />

      <Text className="text-xl font-bold">Correct</Text>

      <Button onPress={() => router.push('/game')} className="w-64">
        <Text>Back to Game</Text>
      </Button>
    </View>
  );
}
