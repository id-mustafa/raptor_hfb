import { Stack, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import Timer from '@/components/ui/timer';
import { useEffect, useState, useRef } from 'react';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import triggerVibration from "@/utils/Vibration";

const QUESTION_DURATION = 20000;

export default function Question() {
  const router = useRouter();
  const navigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Add a ref to act as a "guard" to prevent multiple navigations
  const hasNavigated = useRef(false);

  // Animation state
  const revealProgress = useSharedValue(0);
  const fadeAccent = useSharedValue(1);
  const fadeContent = useSharedValue(0);
  const fadeTimer = useSharedValue(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Phase 1: "Get Ready" Animations
    revealProgress.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.exp) });
    const getReadyTimerFadeIn = setTimeout(() => {
      fadeTimer.value = withTiming(1, { duration: 500 });
    }, 500);
    const accentFadeOut = setTimeout(() => {
      fadeAccent.value = withTiming(0, { duration: 1000 });
    }, 5000);

    triggerVibration(); // Trigger vibration when the question appears

    // Phase 2: Show Content & Start Question Timer
    const contentFadeIn = setTimeout(() => {
      runOnJS(setShowContent)(true);
      fadeContent.value = withTiming(1, { duration: 1000 });

      navigationTimerRef.current = setTimeout(() => {
        // Only navigate if we haven't already
        if (!hasNavigated.current) {
          hasNavigated.current = true; // Set the guard
          router.push('/answer');
        }
      }, QUESTION_DURATION);
    }, 5500);

    // Cleanup Function
    return () => {
      clearTimeout(getReadyTimerFadeIn);
      clearTimeout(accentFadeOut);
      clearTimeout(contentFadeIn);
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
    };
  }, []);

  const handleManualSubmit = () => {
    // Only navigate if we haven't already
    if (!hasNavigated.current) {
      hasNavigated.current = true; // Set the guard
      // Clear the scheduled automatic navigation
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current);
      }
      router.push('/answer');
    }
  };

  // Animated styles
  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(revealProgress.value, [0, 1], [-3, 7.5]) }],
    opacity: fadeAccent.value,
  }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: fadeContent.value,
  }));

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
      <Animated.View className="absolute inset-0 items-center justify-center">
        <Animated.View className="w-32 h-32 rounded-full bg-primary absolute" style={circleStyle} />
        <Animated.View style={{ opacity: fadeTimer }} className="absolute top-0 left-0 right-0">
          <Timer duration={5500} primary={false} />
        </Animated.View>
        <Animated.Text className="text-4xl font-bold text-background" style={{ opacity: fadeAccent }}>
          Get Ready
        </Animated.Text>
      </Animated.View>
      {showContent && (
        <Animated.View className="flex-1 items-center justify-center gap-4 p-4" style={contentStyle}>
          <Timer duration={QUESTION_DURATION} />
          <Text className="text-2xl text-center text-secondary-foreground">
            How many points will LeBron James score in the third quarter?
          </Text>
          <Button onPress={handleManualSubmit} className="w-64">
            <Text>Submit Answer</Text>
          </Button>
        </Animated.View>
      )}
    </View>
  );
}