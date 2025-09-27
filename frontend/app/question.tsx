import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import Timer from '@/components/ui/timer';

export default function Question() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center gap-4 p-4 bg-background">
      <Stack.Screen
        options={{
          headerShown: false, // Hide the default header
          gestureEnabled: false, // Disable swipe back
        }}
      />

      {/* Timer bar at the very top */}
      <Timer duration={20000} />

      <Text className="text-2xl text-center text-secondary-foreground">How many points will LeBron James score in the third quarter?</Text>

      <Button onPress={() => router.push('/game')} className="w-64">
        <Text>Submit Answer</Text>
      </Button>
    </View>
  );
}
