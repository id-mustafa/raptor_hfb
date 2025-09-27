import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { View, Pressable, BackHandler } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ChevronLeft } from 'lucide-react-native';
import { THEME } from '@/lib/theme';
import { useCallback } from 'react';

export default function Recap() {
  const router = useRouter();

  const handleBack = useCallback(() => {
    router.push("/home");
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

  return (
    <View className="flex-1 items-center justify-center gap-4 p-4 bg-background">
      <Stack.Screen options={{
        title: 'Recap',
        headerLeft: () => (
          <Pressable onPress={() => router.push('/home')}>
            <ChevronLeft size={24} color={THEME.dark.secondary} />
          </Pressable>
        )
      }} />

      <Text className="text-xl font-bold">Recap</Text>

      <Button onPress={() => router.push('/home')} className="w-64">
        <Text>Go Home</Text>
      </Button>
    </View>
  );
}
