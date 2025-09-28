import { Stack, useFocusEffect, useRouter } from "expo-router";
import { View, Pressable, BackHandler, ScrollView } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  Trophy,
  Crown,
  Medal,
  Award,
  TrendingUp,
  Users,
  Clock,
  Target,
} from "lucide-react-native";
import { THEME } from "@/lib/theme";
import { useCallback, useMemo, useEffect, useState } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import { useAuth } from "@/utils/AuthProvider";

const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedView = Animated.createAnimatedComponent(View);

// --- Helpers for mock data ---
const getRandomAccuracy = () => {
  const values = [70, 80, 90, 100];
  return values[Math.floor(Math.random() * values.length)];
};

const getRandomStreak = () => {
  const values = [1, 2, 3, 4];
  return values[Math.floor(Math.random() * values.length)];
};

// Performance Bar Component
const PerformanceBar = ({
  value,
  maxValue,
  color,
  delay,
}: {
  value: number;
  maxValue: number;
  color: string;
  delay: number;
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withSpring(value / maxValue));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View className="h-2 bg-muted/30 rounded-full overflow-hidden">
      <Animated.View
        className={`h-full ${color} rounded-full`}
        style={animatedStyle}
      />
    </View>
  );
};

// Leaderboard Item Component
const LeaderboardItem = ({
  player,
  rank,
  delay,
}: {
  player: any;
  rank: number;
  delay: number;
}) => {
  const slideIn = useSharedValue(50);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    slideIn.value = withDelay(delay, withSpring(0));
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    scale.value = withDelay(delay, withSpring(1));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideIn.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const getRankIcon = () => {
    switch (rank) {
      case 1:
        return <Crown size={24} color="#FFD700" />;
      case 2:
        return <Medal size={24} color="#C0C0C0" />;
      case 3:
        return <Award size={24} color="#CD7F32" />;
      default:
        return (
          <View className="w-8 h-8 items-center justify-center rounded-full bg-muted">
            <Text className="text-sm font-bold text-muted-foreground">
              {rank}
            </Text>
          </View>
        );
    }
  };

  const getRankColor = () => {
    switch (rank) {
      case 1:
        return "border-l-yellow-500 bg-yellow-50/10";
      case 2:
        return "border-l-gray-400 bg-gray-50/10";
      case 3:
        return "border-l-orange-600 bg-orange-50/10";
      default:
        return "border-l-muted bg-muted/5";
    }
  };

  return (
    <AnimatedView style={animatedStyle}>
      <View
        className={`flex-row items-center p-4 mb-3 rounded-xl border-l-4 ${getRankColor()}`}
      >
        <View className="mr-4">{getRankIcon()}</View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-bold text-foreground">
              {player.username}
            </Text>
            <Text className="text-xl font-bold text-primary">
              {player.tokens}
            </Text>
          </View>

          <View className="flex-row justify-between text-sm">
            <Text className="text-muted-foreground">
              Accuracy: {player.accuracy}%
            </Text>
            <Text className="text-muted-foreground">
              Streak: {player.streak}
            </Text>
          </View>
        </View>
      </View>
    </AnimatedView>
  );
};

export default function Recap() {
  const router = useRouter();
  const { currentRoomUsers, gameStartTime } = useAuth();

  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!gameStartTime) return;

    // When recap opens, freeze the elapsed time
    const now = new Date();
    const diffMs = now.getTime() - new Date(gameStartTime).getTime();
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    setElapsed(`${minutes}:${seconds.toString().padStart(2, "0")}`);
  }, [gameStartTime]);

  const [playersWithStats, setPlayersWithStats] = useState<any[]>([]);

  useEffect(() => {
    // Assign mock stats only once when recap loads
    const withStats = currentRoomUsers.map((p) => ({
      ...p,
      accuracy: getRandomAccuracy(),
      streak: getRandomStreak(),
    }));
    setPlayersWithStats(withStats.sort((a, b) => b.tokens - a.tokens));
  }, [currentRoomUsers]);

  // Animations
  const headerScale = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const confettiScale = useSharedValue(0);

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

  useEffect(() => {
    headerScale.value = withSpring(1, { damping: 20, stiffness: 90 }); // smoother, less bounce
    headerOpacity.value = withTiming(1, { duration: 600 }); // fade in a bit faster
    confettiScale.value = withSequence(
      withDelay(400, withSpring(1.05, { damping: 18, stiffness: 100 })), // tiny pop, less bounce
      withSpring(1, { damping: 20, stiffness: 90 })
    );
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value,
  }));

  const confettiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confettiScale.value }],
  }));


  const sortedPlayers = playersWithStats;
  const winner = sortedPlayers[0];
  const maxPoints = Math.max(...(sortedPlayers.map((p) => p.tokens) || [0]));

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: "Game Summary",
          headerLeft: () => (
            <Pressable onPress={() => router.push("/home")}>
              <ChevronLeft size={24} color={THEME.dark.secondary} />
            </Pressable>
          ),
        }}
      />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Celebration Header */}
        <AnimatedView style={headerAnimatedStyle} className="items-center py-8">
          <AnimatedView style={confettiAnimatedStyle} className="mb-4">
            <Text className="text-6xl">🎉</Text>
          </AnimatedView>
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
        </AnimatedView>

        {/* Winner Spotlight */}
        {winner && (
          <AnimatedCard className="mb-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <CardHeader>
              <View className="flex-row items-center justify-center">
                <Crown size={24} color="#FFD700" />
                <CardTitle className="ml-2 text-xl">🏆 MVP Player</CardTitle>
              </View>
            </CardHeader>
            <CardContent className="items-center">
              <Text className="text-2xl font-bold text-foreground mb-2">
                {winner.username}
              </Text>
              <Text className="text-3xl font-bold text-yellow-500 mb-2">
                {winner.tokens} Points
              </Text>
              <View className="flex-row gap-4">
                <Text className="text-muted-foreground">
                  {winner.accuracy}% Accuracy
                </Text>
                <Text className="text-muted-foreground">
                  {winner.streak} Max Streak
                </Text>
              </View>
            </CardContent>
          </AnimatedCard>
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
              <Text className="font-semibold">--</Text>
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

        {/* Final Leaderboard */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex-row items-center">
              Final Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedPlayers.map((player, index) => (
              <LeaderboardItem
                key={player.username}
                player={player}
                rank={index + 1}
                delay={300 + index * 150}
              />
            ))}
          </CardContent>
        </Card>

        {/* Performance Chart Visualization */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {sortedPlayers.map((player, index) => (
              <View key={player.username} className="mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="font-medium">{player.username}</Text>
                  <Text className="text-muted-foreground">
                    {player.tokens} pts
                  </Text>
                </View>
                <PerformanceBar
                  value={player.tokens}
                  maxValue={maxPoints}
                  color={
                    index === 0
                      ? "bg-yellow-500"
                      : index === 1
                        ? "bg-gray-400"
                        : index === 2
                          ? "bg-orange-600"
                          : "bg-blue-500"
                  }
                  delay={1200 + index * 100}
                />
              </View>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <View className="gap-3 mb-24">
          <Button onPress={() => router.push("/lobby")} className="w-full">
            <Text>Play Again</Text>
          </Button>

          <Button
            onPress={() => router.push("/home")}
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
