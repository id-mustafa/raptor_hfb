import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
    useSharedValue,
    withTiming,
    useAnimatedStyle,
    Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Timer({
    duration = 20000,
    primary = true,
}: {
    duration?: number;
    primary?: boolean;
}) {
    const insets = useSafeAreaInsets();
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withTiming(100, { duration, easing: Easing.linear });
    }, [duration, progress]);

    const indicatorStyle = useAnimatedStyle(() => ({
        width: `${progress.value}%`,
    }));

    return (
        <View
            className={`absolute top-0 left-0 right-0 h-2 ${
                primary ? 'bg-secondary' : 'bg-primary'
            }`}
            style={{ top: insets.top + 8 }}>
            <Animated.View
                style={indicatorStyle}
                className={`h-full ${primary ? 'bg-primary' : 'bg-background'}`}
            />
        </View>
    );
}