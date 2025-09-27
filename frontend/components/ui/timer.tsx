import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
    useSharedValue,
    withTiming,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Timer({ duration = 20000 }: { duration?: number }) {
    const insets = useSafeAreaInsets();
    const progress = useSharedValue(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        progress.value = withTiming(100, { duration });
    }, [duration, progress]);

    const indicatorStyle = useAnimatedStyle(() => ({
        width: `${progress.value}%`,
    }));

    return (
        <View className="absolute top-0 left-0 right-0 h-2 bg-secondary" style={{ top: insets.top + 8 }}>
            <Animated.View
                style={indicatorStyle}
                className="h-full bg-primary"
            />
        </View>
    );
}
