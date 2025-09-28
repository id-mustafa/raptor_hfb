// recap.tsx
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { View, Pressable, BackHandler, ScrollView } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChevronLeft, Trophy, Clock, Target, Users } from "lucide-react-native";
import { THEME } from "@/lib/theme";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/utils/AuthProvider";

export default function Recap() {
  const router = useRouter();
  const { currentRoomUsers, gameStartTime, questions } = useAuth();

  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!gameStartTime) return;
    const now = new Date();
    const diffMs = now.getTime() - new Date(gameStartTime).getTime();
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    setElapsed(`${minutes}:${seconds.toString().padStart(2, "0")}`);
  }, [gameStartTime]);

  const handleBack = useCallback(() => {
    router.replace("/home");
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

  const sortedPlayers = [...currentRoomUsers].sort(
    (a, b) => b.tokens - a.tokens
  );
  const winner = sortedPlayers[0];

  const rankColors = ["bg-yellow-600", "bg-gray-400", "bg-amber-700"];

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: "Game Summary",
          headerLeft: () => (
            <Pressable onPress={() => router.replace("/home")}>
              <ChevronLeft size={24} color={THEME.dark.secondary} />
            </Pressable>
          ),
        }}
      />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Celebration Header */}
        <View className="items-center py-8">
          <Text className="text-6xl mb-4">🎉</Text>
          <Text className="text-3xl font-bold text-center text-foreground mb-2">
            Game Complete!
          </Text>
          {winner && (
            <Text className="text-xl text-center text-primary font-semibold">
              {winner.username} Wins!
            </Text>
          )}
          <Text className="text-lg text-center text-muted-foreground mt-2">
            Duration: {elapsed || "0:00"}
          </Text>
        </View>

        {/* Winner Spotlight */}
        {winner && (
          <Card className="mb-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <CardHeader>
              <View className="flex-row items-center justify-center">
                <CardTitle className="ml-2 text-xl">MVP Player</CardTitle>
              </View>
            </CardHeader>
            <CardContent className="items-center">
              <Text className="text-2xl font-bold text-foreground mb-2">
                {winner.username}
              </Text>
              <Text className="text-3xl font-bold text-yellow-500 mb-2">
                {winner.tokens} Points
              </Text>
            </CardContent>
          </Card>
        )}

        {/* Game Statistics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex-row items-center">
              Game Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Clock size={16} color={THEME.dark.secondary} />
                <Text className="ml-2 text-muted-foreground">Duration</Text>
              </View>
              <Text className="font-semibold">{elapsed || "0:00"}</Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Target size={16} color={THEME.dark.secondary} />
                <Text className="ml-2 text-muted-foreground">Questions</Text>
              </View>
              <Text className="font-semibold">{questions.length}</Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Users size={16} color={THEME.dark.secondary} />
                <Text className="ml-2 text-muted-foreground">Players</Text>
              </View>
              <Text className="font-semibold">{currentRoomUsers.length}</Text>
            </View>
          </CardContent>
        </Card>

        {/* Final Leaderboard (copied from game.tsx) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex-row items-center">
              Final Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-2">
            {sortedPlayers.map((player, index) => (
              <View
                key={player.username}
                className="flex-row items-center justify-between rounded-md bg-muted/20 px-4 py-2"
              >
                {/* Rank */}
                {index < 3 ? (
                  <View
                    className={`w-8 h-8 items-center justify-center rounded-full ${rankColors[index]}`}
                  >
                    <Trophy size={16} color="#fff" />
                  </View>
                ) : (
                  <View className="w-8 h-8 items-center justify-center rounded-full bg-muted">
                    <Text className="text-sm font-bold text-secondary">
                      {index + 1}
                    </Text>
                  </View>
                )}

                {/* Name + Points */}
                <View className="flex-1 flex-row justify-between ml-4">
                  <Text className="text-base font-medium text-foreground">
                    {player.username}
                  </Text>
                  <Text className="text-base font-semibold text-foreground">
                    {player.tokens}
                  </Text>
                </View>
              </View>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <View className="gap-3 mb-24">
          <Button onPress={() => router.replace("/lobby")} className="w-full">
            <Text>Play Again</Text>
          </Button>

          <Button
            onPress={() => router.replace("/home")}
            className="w-full"
            variant="outline"
          >
            <Text>Back to Home</Text>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
