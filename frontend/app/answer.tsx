import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useEffect, useState } from 'react';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import triggerVibration from "@/utils/Vibration";

export default function BetResult() {
  const router = useRouter();

  // Animation states
  const revealProgress = useSharedValue(0);
  const [phase, setPhase] = useState<'placed' | 'result'>('placed');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Randomly pick result
      const outcomes: ('correct' | 'incorrect')[] = ['correct', 'incorrect'];
      const chosen = outcomes[Math.floor(Math.random() * outcomes.length)];
      setResult(chosen);
      setPhase('result');

      triggerVibration(); 

      revealProgress.value = withTiming(1, {
        duration: 1200,
        easing: Easing.out(Easing.exp),
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Radial fill animation
  const circleStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(revealProgress.value, [0, 1], [0, 7.5]) },
    ],
    opacity: 1,
  }));

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />

      {phase === 'result' && result && (
        <Animated.View className="absolute inset-0 items-center justify-center">
          <Animated.View
            className={`w-32 h-32 rounded-full absolute ${
              result === 'correct' ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={circleStyle}
          />
        </Animated.View>
      )}

      <View className="flex-1 items-center justify-center gap-6 p-4">
        {phase === 'placed' && (
          <Text className="text-4xl font-bold text-center">Bet Placed</Text>
        )}
        {phase === 'result' && result && (
          <>
            <Text className="text-4xl font-bold text-center text-background mb-8">
              {result === 'correct' ? 'Correct' : 'Incorrect'}
            </Text>
            <Button className="w-64" onPress={() => router.push('/game')} variant="dark">
              <Text>Back to Game</Text>
            </Button>
          </>
        )}
      </View>
    </View>
  );
}
