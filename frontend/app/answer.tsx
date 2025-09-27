import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
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
import { useAuth } from '@/utils/AuthProvider';

export default function BetResult() {
  const router = useRouter();
  const { points, setPoints } = useAuth();
  const { selection, bet } = useLocalSearchParams<{ selection?: string; bet?: string }>();
  const wager = bet ? parseInt(bet, 10) : 0;

  const betWasPlaced = selection !== undefined && wager > 0;

  const revealProgress = useSharedValue(0);
  const [phase, setPhase] = useState<'placed' | 'result'>('placed');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  // 👇 New state for animated display
  const [viewPoints, setViewPoints] = useState(points);

  useEffect(() => {
    if (betWasPlaced) {
      const timer = setTimeout(() => {
        const chosenResult = selection === '3' ? 'correct' : 'incorrect';
        setResult(chosenResult);
        setPhase('result');

        const delta = chosenResult === 'correct' ? wager : -wager;
        const targetPoints = points + delta;
        setPoints(targetPoints);

        triggerVibration();

        revealProgress.value = withTiming(1, {
          duration: 1200,
          easing: Easing.out(Easing.exp),
        });

        let current = points;
        const step = delta > 0 ? 1 : -1;
        const interval = setInterval(() => {
          current += step;
          setViewPoints(current);
          if ((step > 0 && current >= targetPoints) || (step < 0 && current <= targetPoints)) {
            clearInterval(interval);
          }
        }, 30); 
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [betWasPlaced, selection, wager, setPoints, revealProgress]);

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
            className={`w-32 h-32 rounded-full absolute ${result === 'correct' ? 'bg-green-500' : 'bg-red-500'
              }`}
            style={circleStyle}
          />
        </Animated.View>
      )}

      <View className="flex-1 items-center justify-center gap-6 p-4">
        {phase === 'placed' ? (
          <>
            <View className="flex flex-col items-center flex-1 justify-center gap-4">
              <Text className="text-4xl font-bold text-center">
                {betWasPlaced ? 'Bet Placed' : 'No Bet Placed'}
              </Text>
              {betWasPlaced && (
                <View className="flex flex-col items-center">
                  <View className="flex-row items-center gap-1">
                    <Text className="text-4xl font-bold text-primary">{bet}</Text>
                  </View>
                  <Text className="text-lg text-foreground">points</Text>
                </View>
              )}
            </View>
            {!betWasPlaced && (
              <Button className="w-64 mb-24" onPress={() => router.push('/game')} variant="secondary">
                <Text>Back to Game</Text>
              </Button>
            )}
          </>
        ) : (
          <View className="flex flex-col items-center flex-1">
            <View className="flex flex-col items-center flex-grow justify-center gap-4">
              <Text className="text-4xl font-bold text-center text-background mb-4">
                {result === 'correct' ? 'Correct!' : 'Incorrect'}
              </Text>
              <View className="flex flex-col items-center">
                <View className="flex-row items-center gap-1">
                  <Text className="text-4xl font-bold text-background">{viewPoints}</Text>
                  <Text className={`text-lg text-background`}>
                    {result === 'correct' ? `↑${wager}` : `↓${wager}`}
                  </Text>
                </View>
                <Text className="text-lg text-background">points</Text>
              </View>
            </View>
            <Button className="w-64 mb-24" onPress={() => router.push('/game')} variant="dark">
              <Text>Back to Game</Text>
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}
