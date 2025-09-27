import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function Recap() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center gap-4 p-4 bg-background">
      <Stack.Screen options={{ title: 'Recap' }} />

      <Text className="text-xl font-bold">Recap</Text>

      <Button onPress={() => router.push('/home')} className="w-64">
        <Text>Go Home</Text>
      </Button>
    </View>
  );
}
