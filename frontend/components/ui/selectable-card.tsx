import React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { triggerSelectionHaptic } from '@/utils/Vibration';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

type SelectableCardProps = {
  text: string;
  selected: boolean;
  select: () => void;
  deselect: () => void;
  className?: string;
};

export function SelectableCard({
  text,
  selected,
  select,
  deselect,
  className,
}: SelectableCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    // Animate "bounce" effect
    scale.value = withSequence(
      withTiming(1.02, { duration: 150 }),
      withTiming(1, { duration: 200 })
    );

    if (!selected) {
      select();
    } else {
      deselect();
    }

    triggerSelectionHaptic();
  };

  return (
    <Pressable onPress={handlePress} className="w-1/2 aspect-square">
      <Animated.View
        style={animatedStyle}
        className={cn(
          'flex-1 aspect-square flex flex-col items-center justify-center rounded-xl border shadow-sm shadow-black/5',
          selected ? 'bg-primary border-primary' : 'bg-background border-border',
          className
        )}
      >
        <Text
          className={cn(
            'text-2xl font-semibold',
            selected ? 'text-background' : 'text-primary'
          )}
        >
          {text}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
