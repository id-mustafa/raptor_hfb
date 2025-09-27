import { Pressable } from 'react-native';
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
                'bg-card border-border h-64 w-full rounded-xl border shadow-sm shadow-black/5 p-6',
                className
            )}
            onPress={handlePress}
            {...props}
        >
            <Text className="text-card-foreground font-semibold text-2xl mt-auto">
                Create Lobby
            </Text>
            <Text className="text-muted-foreground text-sm mt-2">
                Watch a game with your friends.
            </Text>
        </Pressable>
    );
}