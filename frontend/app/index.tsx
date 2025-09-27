import { Stack, useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Keyboard,
} from 'react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/utils/AuthProvider';

export default function Login() {
  const { setUsername } = useAuth();
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = useCallback(() => {
    //if (!input.trim()) return;
    setUsername(input.trim());
    router.push('/home');
  }, [input, router, setUsername]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      {/* Pressable is the modern replacement; no pointerEvents prop */}
      <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16, gap: 16 }}>
          <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />

          <Text className="text-2xl font-bold mb-16">Login to Raptor</Text>

          <View className="w-80 gap-2">
            <Text className="text-lg font-medium">Username</Text>
            <Input
              placeholder="Enter your username"
              value={input}
              onChangeText={setInput}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
            // ensure your Input forwards these to TextInput under the hood
            />
          </View>

          <View className="w-80 gap-2">
            <Text className="text-lg font-medium">Password</Text>
            <Input
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="off"
              autoCorrect={false}
            />
          </View>

          <Button onPress={handleLogin} className="w-80">
            <Text>Login</Text>
          </Button>
        </View>
      </Pressable>
    </KeyboardAvoidingView>
  );
}
