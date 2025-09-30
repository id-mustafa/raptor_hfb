import { Stack, useFocusEffect, useRouter, usePathname } from "expo-router";
import { View, Image, BackHandler } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { useCallback, useState, useEffect } from "react";
import { Trophy } from "lucide-react-native";
import { useAuth } from "@/utils/AuthProvider";
import playByPlay from "@/assets/play-by-play.json";

export default function Game() {
  const router = useRouter();
  const { currentRoomUsers, gameStartTime, currentQuestion, currentRoomId, toggleRoomReady, setQuestions } = useAuth();

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

  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/game" && currentQuestion) {
      router.replace("/question");
    }
  }, [currentQuestion, pathname, router]);

  const formatDate = () =>
    new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
    });

  const rankColors = ["bg-yellow-600", "bg-gray-400", "bg-amber-700"];

  const [elapsed, setElapsed] = useState("");
  const [score, setScore] = useState({ lakers: 0, celtics: 0 });

  const toElapsedSeconds = (timestamp: string) => {
    const [mm, ss] = timestamp.split(":").map(Number);
    // game clock counts down from 12:00 → 0
    const secondsRemaining = mm * 60 + ss;
    const quarterLength = 12 * 60;
    return quarterLength - secondsRemaining;
  };

  useEffect(() => {
    if (!gameStartTime) return;

    const updateElapsed = () => {
      const now = new Date();
      const diffMs = now.getTime() - new Date(gameStartTime).getTime();
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      const elapsedStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;
      setElapsed(elapsedStr);

      // compute elapsed seconds since tip-off
      const elapsedSec = minutes * 60 + seconds;

      // find the last play at or before this elapsed time
      let currentPlay = { lakersPoints: 0, celticsPoints: 0 };
      for (const play of playByPlay) {
        const playSec = toElapsedSeconds(play.timestamp);
        if (playSec <= elapsedSec) {
          currentPlay = {
            lakersPoints: play.lakersPoints,
            celticsPoints: play.celticsPoints,
          };
        } else {
          break;
        }
      }
      setScore({
        lakers: currentPlay.lakersPoints,
        celtics: currentPlay.celticsPoints,
      });
    };

    updateElapsed();
    const id = setInterval(updateElapsed, 1000);
    return () => clearInterval(id);
  }, [gameStartTime]);

  return (
    <View className="flex-1 gap-4 px-4 bg-background">
      {/* Custom Header */}
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View className="flex-col mt-2">
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

              {/* Date + live timer */}
              <View className="flex-row items-center mt-1">
                {gameStartTime && (
                  <>
                    <Text className="text-xs text-green-500">{elapsed}</Text>
                    <View className="w-1.5 h-1.5 rounded-full bg-green-500 ml-1 mr-2" />
                  </>
                )}
                <Text className="text-xs text-secondary">{formatDate()}</Text>
              </View>
            </View>
          ),
          headerLeft: () => <View className="px-2" />,
        }}
      />

      {/* Game Overview */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Game Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <View className="flex-row items-center justify-between">
            <Image
              source={require("@/assets/images/team1.jpg")}
              className="h-16 w-16 rounded-full"
            />
            <View className="items-center">
              <Text className="text-2xl font-bold text-foreground">
                {score.lakers} - {score.celtics}
              </Text>
              <Text className="text-sm text-secondary">Q1</Text>
            </View>
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
          {currentRoomUsers
            .sort((a, b) => b.tokens - a.tokens)
            .map((player, index) => (
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

      {/* Actions */}
      <Button
        onPress={() => {
          setQuestions([
            {
              id: 0,
              question_text: "Who will score the next goal?",
              option_1: "LeBron James",
              option_2: "Austin Reaves",
              option_3: "Jason Tatum",
              option_4: "Jaylen Brown",
              correct_answer: 1,
            }
          ]);
          router.replace("/question")
        }}
        className="w-full mt-auto"
      >
        <Text>Start Question</Text>
      </Button>
      <Button
        onPress={() => {
          if (currentRoomId) {
            toggleRoomReady(currentRoomId, false);
          }
          router.replace("/recap")
        }}
        className="w-full -mt-2 mb-16"
        variant="ghost"
      >
        <Text>End Game</Text>
      </Button>
    </View>
  );
}
