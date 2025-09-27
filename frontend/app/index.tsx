import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native'; // <-- Import necessary components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useAuth } from '../utils/AuthProvider';

export default function Login() {
  const { setUsername } = useAuth();
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  return (
    // Wrap your entire view with KeyboardAvoidingView
<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 , gap: 16}}>
            <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />

          <Text className="text-2xl font-bold mb-16">Login to Raptor</Text>

          <View className="w-80 gap-2">
            <Text className="text-lg font-medium">Username</Text>
            <Input
              placeholder="Enter your username"
              value={input}
              onChangeText={setInput}
              autoCapitalize="none"
            />
          </View>

          <View className="w-80 gap-2">
            <Text className="text-lg font-medium">Password</Text>
            <Input
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Button
            onPress={() => {
              setUsername(input);
              router.push('/home');
            }}
            className="w-80"
          >
            <Text>Login</Text>
          </Button>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}