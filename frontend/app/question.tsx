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
  useDerivedValue,
  interpolateColor
} from 'react-native-reanimated';
import triggerVibration from "@/utils/Vibration";
import { SelectableCard } from '@/components/ui/selectable-card';
import { Slider } from 'react-native-awesome-slider';
import { THEME } from '@/lib/theme';
import { ReText } from 'react-native-redash';
import { useAuth } from '@/utils/AuthProvider';

const PREP_DURATION = 1000; // todo: change to 5000 for prod
const QUESTION_DURATION = 5000; // todo: change to 20000 for prod

export default function Question() {
  const router = useRouter();
  const navigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasNavigated = useRef(false);

  // Animation state
  const revealProgress = useSharedValue(0);
  const fadeAccent = useSharedValue(1);
  const fadeContent = useSharedValue(0);
  const fadeTimer = useSharedValue(0);
  const [showContent, setShowContent] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Use a ref to track the latest selectedIndex for the timeout
  const selectedIndexRef = useRef(selectedIndex);
  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);


   const { points } = useAuth();

  const sliderValue = useSharedValue(Math.min(10, points));
  const sliderMin = useSharedValue(0);
  const sliderMax = useSharedValue(Math.min(points, 100));
  const isDragging = useSharedValue(0);

  const animatedText = useDerivedValue(() => {
    return `${Math.max(Math.min(Math.round(sliderValue.value), sliderMax.value), sliderMin.value)}`;
  });

  const animatedWagerLineStyle = useAnimatedStyle(() => {
    const scale = interpolate(isDragging.value, [0, 1], [1, 1.10]);
    return {
      transform: [{ scale }],
    };
  });

  const animatedReTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      isDragging.value,
      [0, 1],
      [THEME.dark.foreground, THEME.dark.primary]
    );
    return {
      color,
      fontWeight: 'bold',
      fontSize: 32,
    };
  });
  useEffect(() => {
    revealProgress.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.exp) });
    const getReadyTimerFadeIn = setTimeout(() => {
      fadeTimer.value = withTiming(1, { duration: 500 });
    }, 500);
    const accentFadeOut = setTimeout(() => {
      fadeAccent.value = withTiming(0, { duration: 300 });
    }, PREP_DURATION);

    triggerVibration();

    const contentFadeIn = setTimeout(() => {
      runOnJS(setShowContent)(true);
      fadeContent.value = withTiming(1, { duration: 200 });

      navigationTimerRef.current = setTimeout(() => {
        if (hasNavigated.current) return;
        hasNavigated.current = true;

        const finalIndex = selectedIndexRef.current;

        if (finalIndex !== null) {
          router.push({
            pathname: '/answer',
            params: {
              selection: finalIndex?.toString() ?? undefined,
              bet: Math.round(sliderValue.value).toString(),
            },
          });
        } else {
          router.push('/answer');
        }
      }, QUESTION_DURATION);
    }, PREP_DURATION + 200);

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
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    if (navigationTimerRef.current) {
      clearTimeout(navigationTimerRef.current);
    }
    router.push('/answer');
  };

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
          <Timer duration={PREP_DURATION} primary={false} />
        </Animated.View>
        <Animated.Text className="text-4xl font-bold text-background" style={{ opacity: fadeAccent }}>
          Get Ready
        </Animated.Text>
      </Animated.View>
      {showContent && (
        <Animated.View className="flex-1 items-center justify-center gap-4 p-4" style={contentStyle}>
          <Timer duration={QUESTION_DURATION} />
          <Text className="text-2xl text-center text-secondary-foreground my-8">
            How many points will LeBron James score in the third quarter?
          </Text>
          <View className="w-full justify-center gap-4 flex-col">
            <View className="flex-row w-full justify-center gap-4">
              <SelectableCard
                text="0-5"
                selected={selectedIndex === 0}
                select={() => setSelectedIndex(0)}
                deselect={() => setSelectedIndex(null)}
              />
              <SelectableCard
                text="6-10"
                selected={selectedIndex === 1}
                select={() => setSelectedIndex(1)}
                deselect={() => setSelectedIndex(null)}
              />
            </View>
            <View className="flex-row w-full justify-center gap-4">
              <SelectableCard
                text="11-15"
                selected={selectedIndex === 2}
                select={() => setSelectedIndex(2)}
                deselect={() => setSelectedIndex(null)}
              />
              <SelectableCard
                text="16+"
                selected={selectedIndex === 3}
                select={() => setSelectedIndex(3)}
                deselect={() => setSelectedIndex(null)}
              />
            </View>
          </View>
          <Button variant="ghost"><Text className="text-secondary text-lg" onPress={handleManualSubmit}>skip bet &rarr;</Text></Button>
          <View className="w-full flex-col justify-center gap-4">
            <Animated.View style={animatedWagerLineStyle} className="flex flex-row items-center gap-1 justify-center">
              <Text className="text-lg mt-1">Wager</Text>
              <ReText text={animatedText} style={animatedReTextStyle} />
              <Text className="text-lg mt-1">Points</Text>
            </Animated.View>
            <Slider
              progress={sliderValue}
              minimumValue={sliderMin}
              maximumValue={sliderMax}
              sliderHeight={8}
              thumbTouchSize={48}
              theme={{
                minimumTrackTintColor: THEME.dark.primary + '80',
                maximumTrackTintColor: THEME.dark.border,
                bubbleBackgroundColor: THEME.dark.primary,
              }}
              onSlidingStart={() => {
                isDragging.value = withTiming(1, {
                  duration: 150,
                  easing: Easing.out(Easing.quad),
                });
              }}
              onSlidingComplete={() => {
                isDragging.value = withTiming(0, {
                  duration: 100,
                  easing: Easing.out(Easing.quad),
                });
              }}
              renderThumb={() => <View className="w-7 h-7 rounded-full bg-primary " />}
              renderBubble={() => null}
            />
          </View>
        </Animated.View>
      )}
    </View>
  );
}