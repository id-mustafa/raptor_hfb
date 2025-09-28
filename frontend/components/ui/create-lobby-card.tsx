import { Pressable, ImageBackground } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { triggerSelectionHaptic } from '@/utils/Vibration';

type CreateLobbyCardProps = React.ComponentProps<typeof Pressable> & {
    navigateLobby: () => void;
};

export function CreateLobbyCard({
    className,
    navigateLobby,
    ...props
}: CreateLobbyCardProps) {
    const handlePress = () => {
        triggerSelectionHaptic();
        navigateLobby();
    };

    return (
        <Pressable
            className={cn(
                'bg-card border-primary h-64 w-full rounded-xl border shadow-sm shadow-black/5 overflow-hidden',
                className
            )}
            onPress={handlePress}
            {...props}
        >
            <ImageBackground
                source={require('@/assets/images/outlines.png')}
                className="flex-1 p-7"
                resizeMode="cover"
                imageStyle={{ opacity: 0.6 }}
            >
                <Text className="text-card-foreground font-semibold text-2xl mt-auto">
                    Create Lobby
                </Text>
                <Text className="text-muted-foreground text-sm mt-2">
                    Watch a game with your friends.
                </Text>
            </ImageBackground>
        </Pressable>
    );
}
