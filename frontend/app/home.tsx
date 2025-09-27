import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function Home() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center gap-4 p-4 bg-background">
      <Stack.Screen options={{ title: 'Home' }} />

      <Text className="text-xl font-bold">Home</Text>

      <Button onPress={() => router.push('/lobby')} className="w-64">
        <Text>Create Lobby</Text>
      </Button>

      <Button onPress={() => router.push('/lobby')} className="w-64">
        <Text>Join Lobby</Text>
      </Button>
    </View>
  );
}
