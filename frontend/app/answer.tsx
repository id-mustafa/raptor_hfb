import { Stack, useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { BackHandler, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useCallback, useEffect, useState } from 'react';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import triggerVibration from "@/utils/Vibration";
import { useAuth } from '@/utils/AuthProvider';
import { ReText } from "react-native-redash";
import { THEME } from '@/lib/theme';

export default function BetResult() {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.push("/game");
    return true;
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBack
      );
      return () => subscription.remove();
    }, [handleBack])
  );

  const { setPoints, correctAnswer, options, setCurrentQuestion } = useAuth();
  const { selection, bet, oldPoints } = useLocalSearchParams<{
    selection?: string;
    bet?: string;
    oldPoints?: string;
  }>();

  const wager = bet ? parseInt(bet, 10) : 0;
  const prevPoints = oldPoints ? parseInt(oldPoints, 10) : 0;
  const chosenIndex = selection !== undefined ? parseInt(selection, 10) : null;

  const betWasPlaced = chosenIndex !== null && wager > 0;

  const revealProgress = useSharedValue(0);
  const [phase, setPhase] = useState<'placed' | 'result'>('placed');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  // Animate point updates
  const animatedPoints = useSharedValue(prevPoints);

  useEffect(() => {
    if (betWasPlaced) {
      const timer = setTimeout(() => {
        const isCorrect =
          correctAnswer !== null && chosenIndex === correctAnswer;
        const chosenResult = isCorrect ? 'correct' : 'incorrect';
        setResult(chosenResult);
        setPhase('result');

        triggerVibration();

        revealProgress.value = withTiming(1, {
          duration: 1200,
          easing: Easing.out(Easing.cubic),
        });

        const delta = isCorrect ? wager : -wager;
        const targetPoints = prevPoints + delta;
        setPoints(targetPoints);

        setTimeout(() => {
          animatedPoints.value = withTiming(targetPoints, {
            duration: 2000,
            easing: Easing.out(Easing.exp),
          });
        }, 500);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [
    betWasPlaced,
    chosenIndex,
    wager,
    setPoints,
    revealProgress,
    correctAnswer,
    prevPoints,
  ]);

  const animatedText = useDerivedValue(() => {
    return Math.round(animatedPoints.value).toString();
  });

  const circleStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(revealProgress.value, [0, 1], [0, 8]) },
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
                    <Text className="text-4xl font-bold text-primary">{wager}</Text>
                  </View>
                  <Text className="text-lg text-foreground">points</Text>
                </View>
              )}
            </View>
            {!betWasPlaced && (
              <Button className="w-64 mb-24" onPress={() => {
                setCurrentQuestion(null);
                router.push('/game')
              }} variant="secondary">
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
                  <ReText
                    text={animatedText}
                    style={{ fontSize: 32, fontWeight: "bold", color: THEME.dark.background }}
                  />
                  <Text className="text-lg text-background">
                    {result === 'correct' ? `↑${wager}` : `↓${wager}`}
                  </Text>
                </View>
                <Text className="text-lg text-background">points</Text>
              </View>
            </View>
            <Button className="w-64 mb-24" onPress={() => {
              setCurrentQuestion(null);
              router.push('/game')
            }} variant="dark">
              <Text>Back to Game</Text>
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}
