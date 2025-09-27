import { Stack, useRouter } from "expo-router";
import { View, Image } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { useMemo, useEffect, useState } from "react";

export default function Game() {
  const router = useRouter();

  const players: any[] = useMemo(
    () => [
      { id: "1", name: "Alice", points: 50 },
      { id: "2", name: "Bob", points: 30 },
      { id: "3", name: "Charlie", points: 20 },
      { id: "4", name: "David", points: 70 },
      { id: "5", name: "Eve", points: 60 },
    ],
    []
  );

  // Track elapsed time since screen first rendered
  const [elapsed, setElapsed] = useState(0);
  const startTime = useMemo(() => Date.now(), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Format elapsed as mm:ss
  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Format current date
  const formatDate = () =>
    new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });

  return (
    <View className="flex-1 gap-4 p-4 bg-background">
      {/* Custom Header */}
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View className="flex-col">
              <View className="flex-row items-center">
                <Text className="text-lg font-bold text-foreground">
                  Lakers vs. Celtics
                </Text>
                <View className="ml-2 rounded-md bg-destructive px-2 py-0.5">
                  <Text className="text-xs font-bold text-destructiveForeground">
                    LIVE
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center mt-0.5">
                <Text className="text-xs text-secondary">
                  {formatDate()}
                </Text>
                <Text className="mx-1 text-xs text-secondary">•</Text>
                <Text className="text-xs text-secondary">
                  {formatElapsed(elapsed)}
                </Text>
              </View>
            </View>
          ),
        }}
      />

      {/* Game Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Game Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <View className="flex-row items-center justify-between">
            {/* Team 1 avatar */}
            <Image
              source={require("@/assets/images/team1.jpg")}
              className="h-16 w-16 rounded-full"
            />
            {/* Score + Quarter */}
            <View className="items-center">
              <Text className="text-2xl font-bold text-foreground">0 - 0</Text>
              <Text className="text-sm text-secondary">Q1</Text>
            </View>
            {/* Team 2 avatar */}
            <Image
              source={require("@/assets/images/team2.jpg")}
              className="h-16 w-16 rounded-full"
            />
          </View>
        </CardContent>
      </Card>

      {/* Party Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Party Leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="gap-2">
          {players
            .sort((a, b) => b.points - a.points)
            .map((player, index) => (
              <View
                key={player.id}
                className="flex-row items-center justify-between rounded-md bg-muted/20 px-4 py-2"
              >
                {/* Rank */}
                <Text className="w-6 text-sm font-bold text-secondary">
                  {index + 1}
                </Text>
                {/* Name + Points */}
                <View className="flex-1 flex-row justify-between">
                  <Text className="text-base font-medium text-foreground">
                    {player.name}
                  </Text>
                  <Text className="text-base font-semibold text-foreground">
                    {player.points}
                  </Text>
                </View>
              </View>
            ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <Button onPress={() => router.push("/question")} className="w-full">
        <Text>Start Question</Text>
      </Button>
      <Button
        onPress={() => router.push("/recap")}
        className="w-full"
        variant="ghost"
      >
        <Text>End Game</Text>
      </Button>
    </View>
  );
}
