import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { BackHandler, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import Timer from '@/components/ui/timer';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  useDerivedValue,
  useAnimatedReaction,
  interpolateColor,
} from 'react-native-reanimated';
import triggerVibration from '@/utils/Vibration';
import { SelectableCard } from '@/components/ui/selectable-card';
import { Slider } from 'react-native-awesome-slider';
import { THEME } from '@/lib/theme';
import { ReText } from 'react-native-redash';
import { useAuth } from '@/utils/AuthProvider';

const PREP_DURATION = 4000; // todo: 5000 for prod
const QUESTION_DURATION = 9000; // todo: 20000 for prod

export default function Question() {
  const router = useRouter();

  // Navigation guard (prevents double nav / backspam)
  const hasNavigated = useRef(false);
  const handleBack = useCallback(() => {
    if (hasNavigated.current) return true;
    hasNavigated.current = true;
    router.replace('/game');
    return true;
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', handleBack);
      return () => sub.remove();
    }, [handleBack]),
  );

  // Auth/game state
  const { points, currentQuestion, options = [] } = useAuth();

  // ---------- Animation state (UI thread) ----------
  const revealProgress = useSharedValue(0);
  const fadeAccent = useSharedValue(1);
  const fadeContent = useSharedValue(0);
  const fadeTimer = useSharedValue(0);
  const contentGate = useSharedValue(0);      // fires when content should show
  const autoSubmitGate = useSharedValue(0);   // fires when we auto-submit

  // ---------- Local state ----------
  const [showContent, setShowContent] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedIndexRef = useRef(selectedIndex);
  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  // ---------- Slider values ----------
  const sliderValue = useSharedValue(Math.min(10, points));
  const sliderMin = useSharedValue(0);
  const sliderMax = useSharedValue(Math.min(points, 100));
  const isDragging = useSharedValue(0);

  // Keep slider bounds/value in sync with points
  useEffect(() => {
    sliderMax.value = Math.min(points, 100);
    const init = Math.min(10, points);
    sliderValue.value = init;
  }, [points, sliderMax, sliderValue]);

  const animatedText = useDerivedValue(() => {
    'worklet';
    const v = Math.max(Math.min(Math.round(sliderValue.value), sliderMax.value), sliderMin.value);
    return `${v}`;
  });

  const animatedWagerLineStyle = useAnimatedStyle(() => {
    const scale = interpolate(isDragging.value, [0, 1], [1, 1.1]);
    return { transform: [{ scale }] };
  });

  const animatedReTextStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      isDragging.value,
      [0, 1],
      [THEME.dark.foreground as any, THEME.dark.primary as any],
    );
    return { color, fontWeight: 'bold', fontSize: 32 };
  });

  // ---------- Submit bet + navigate ----------
  const submitAndNavigate = useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    const finalIndex = selectedIndexRef.current;

    // Clamp bet between 0, 100, and available points
    const rawBet = Math.round(sliderValue.value);
    const clampedBet = Math.max(0, Math.min(rawBet, Math.min(points, 100)));

    router.replace({
      pathname: '/answer',
      params: {
        selection: finalIndex !== null ? finalIndex.toString() : undefined,
        bet: clampedBet > 0 ? clampedBet.toString() : undefined,
        oldPoints: points.toString(),
      },
    });
  }, [points, router, sliderValue]);

  const handleManualSubmit = useCallback(() => {
    submitAndNavigate();
  }, [submitAndNavigate]);

  // ---------- Timeline (no JS setTimeout; all UI-thread via withDelay) ----------
  useEffect(() => {
    triggerVibration();

    // reveal "Get Ready" circle
    revealProgress.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });

    // show top timer after 700ms
    fadeTimer.value = withDelay(700, withTiming(1, { duration: 300 }));

    // fade out accent at PREP_DURATION
    fadeAccent.value = withDelay(PREP_DURATION, withTiming(0, { duration: 300 }));

    // gate for showing content (also fade content in)
    contentGate.value = withDelay(PREP_DURATION + 100, withTiming(1, { duration: 0 }));
    fadeContent.value = withDelay(PREP_DURATION + 100, withTiming(1, { duration: 200 }));

    // gate for auto submit after the question duration
    autoSubmitGate.value = withDelay(
      PREP_DURATION + 100 + QUESTION_DURATION,
      withTiming(1, { duration: 0 }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // React to gates on the UI thread and call back into JS exactly once
  useAnimatedReaction(
    () => contentGate.value,
    (v, prev) => {
      if (v === 1 && prev !== 1) {
        runOnJS(setShowContent)(true);
      }
    },
  );

  useAnimatedReaction(
    () => autoSubmitGate.value,
    (v, prev) => {
      if (v === 1 && prev !== 1) {
        runOnJS(submitAndNavigate)();
      }
    },
  );

  // ---------- Animated styles ----------
  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(revealProgress.value, [0, 1], [0, 8]) }],
    opacity: fadeAccent.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: fadeContent.value,
  }));

  // Pre-slice options to avoid repeated work in render
  const optionRows = useMemo(() => {
    // Expect 4 options; keep original layout (2 rows, 2 columns)
    return [options.slice(0, 2), options.slice(2, 4)];
  }, [options]);

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />

      {/* Intro overlay */}
      <Animated.View className="absolute inset-0 items-center justify-center">
        <Animated.View className="w-32 h-32 rounded-full bg-primary absolute" style={circleStyle} />
        <Animated.View style={{ opacity: fadeTimer }} className="absolute top-0 left-0 right-0">
          <Timer duration={PREP_DURATION - 100} primary={false} />
        </Animated.View>
        <Animated.Text className="text-4xl font-bold text-background" style={{ opacity: fadeAccent }}>
          Get Ready
        </Animated.Text>
      </Animated.View>

      {/* Question content */}
      {showContent && (
        <Animated.View className="flex-1 items-center justify-center gap-4 p-4" style={contentStyle}>
          <Timer duration={QUESTION_DURATION} />

          <Text className="text-2xl text-center text-secondary-foreground my-8">
            {currentQuestion ?? 'Who is most likely to score the next goal?'}
          </Text>

          {/* answers */}
          <View className="w-full justify-center gap-4 flex-col">
            {optionRows.map((rowOpts, rowIdx) => (
              <View key={rowIdx} className="flex-row w-full justify-center gap-4">
                {rowOpts.map((opt, colIdx) => {
                  const optionIndex = rowIdx * 2 + colIdx;
                  return (
                    <SelectableCard
                      key={optionIndex}
                      text={opt}
                      selected={selectedIndex === optionIndex}
                      select={() => setSelectedIndex(optionIndex)}
                      deselect={() => setSelectedIndex(null)}
                    />
                  );
                })}
              </View>
            ))}
          </View>

          <Button variant="ghost" onPress={handleManualSubmit}>
            <Text className="text-secondary text-lg">skip bet &rarr;</Text>
          </Button>

          {/* wager slider */}
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
                isDragging.value = withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) });
              }}
              onSlidingComplete={() => {
                isDragging.value = withTiming(0, { duration: 100, easing: Easing.out(Easing.quad) });
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
