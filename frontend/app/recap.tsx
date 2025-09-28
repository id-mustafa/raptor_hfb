import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { View, Pressable, BackHandler, ScrollView, Dimensions } from 'react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronLeft, Trophy, Crown, Medal, Award, TrendingUp, Users, Clock, Target } from 'lucide-react-native';
import { THEME } from '@/lib/theme';
import { useCallback, useMemo, useEffect } from 'react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock game data - in a real app, this would come from props or context
const gameData = {
  duration: '24:32',
  totalQuestions: 15,
  correctAnswers: 12,
  accuracy: 80,
  gameResult: 'Lakers Win!',
  finalScore: { team1: 98, team2: 95 }
};

const players = [
  { id: 1, username: "Revanth", points: 200, accuracy: 85, streak: 5, tokens: 0, room_id: null },
  { id: 2, username: "Parth", points: 200, accuracy: 72, streak: 3, tokens: 0, room_id: null },
  { id: 3, username: "Mustafa", points: 200, accuracy: 68, streak: 2, tokens: 0, room_id: null },
  { id: 4, username: "Alex", points: 200, accuracy: 78, streak: 4, tokens: 0, room_id: null },
  { id: 5, username: "rev", points: 6969, accuracy: 95, streak: 8, tokens: 0, room_id: 17 },
];

// Animated components
const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedView = Animated.createAnimatedComponent(View);

// Performance Bar Component
const PerformanceBar = ({ value, maxValue, color, delay }: { value: number, maxValue: number, color: string, delay: number }) => {
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
const LeaderboardItem = ({ player, rank, delay }: { player: any, rank: number, delay: number }) => {
  const slideIn = useSharedValue(50);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    slideIn.value = withDelay(delay, withSpring(0));
    opacity.value = withDelay(delay, withTiming(1, { duration: 600 }));
    scale.value = withDelay(delay, withSpring(1));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: slideIn.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  const getRankIcon = () => {
    switch (rank) {
      case 1: return <Crown size={24} color="#FFD700" />;
      case 2: return <Medal size={24} color="#C0C0C0" />;
      case 3: return <Award size={24} color="#CD7F32" />;
      default: return (
        <View className="w-8 h-8 items-center justify-center rounded-full bg-muted">
          <Text className="text-sm font-bold text-muted-foreground">{rank}</Text>
        </View>
      );
    }
  };

  const getRankColor = () => {
    switch (rank) {
      case 1: return 'border-l-yellow-500 bg-yellow-50/10';
      case 2: return 'border-l-gray-400 bg-gray-50/10';
      case 3: return 'border-l-orange-600 bg-orange-50/10';
      default: return 'border-l-muted bg-muted/5';
    }
  };

  return (
    <AnimatedView style={animatedStyle}>
      <View className={`flex-row items-center p-4 mb-3 rounded-xl border-l-4 ${getRankColor()}`}>
        <View className="mr-4">
          {getRankIcon()}
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-bold text-foreground">{player.username}</Text>
            <Text className="text-xl font-bold text-primary">{player.points}</Text>
          </View>
          
          <View className="flex-row justify-between text-sm">
            <Text className="text-muted-foreground">Accuracy: {player.accuracy}%</Text>
            <Text className="text-muted-foreground">Streak: {player.streak}</Text>
          </View>
        </View>
      </View>
    </AnimatedView>
  );
};

export default function Recap() {
  const router = useRouter();

  // Animation values
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

  // Start animations on mount
  useEffect(() => {
    headerScale.value = withSpring(1, { damping: 8 });
    headerOpacity.value = withTiming(1, { duration: 800 });
    confettiScale.value = withSequence(
      withDelay(500, withSpring(1.2)),
      withSpring(1)
    );
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value,
  }));

  const confettiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confettiScale.value }],
  }));

  const sortedPlayers = useMemo(() => 
    players.sort((a, b) => b.points - a.points),
    []
  );

  const winner = sortedPlayers[0];
  const maxPoints = Math.max(...players.map(p => p.points));

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{
        title: 'Game Summary',
        headerLeft: () => (
          <Pressable onPress={() => router.push('/home')}>
            <ChevronLeft size={24} color={THEME.dark.secondary} />
          </Pressable>
        )
      }} />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Celebration Header */}
        <AnimatedView style={headerAnimatedStyle} className="items-center py-8">
          <AnimatedView style={confettiAnimatedStyle} className="mb-4">
            <Text className="text-6xl">🎉</Text>
          </AnimatedView>
          <Text className="text-3xl font-bold text-center text-foreground mb-2">
            Game Complete!
          </Text>
          <Text className="text-xl text-center text-primary font-semibold">
            {gameData.gameResult}
          </Text>
          <Text className="text-lg text-center text-muted-foreground mt-2">
            Final Score: {gameData.finalScore.team1} - {gameData.finalScore.team2}
          </Text>
        </AnimatedView>

        {/* Winner Spotlight */}
        <AnimatedCard className="mb-6 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardHeader>
            <View className="flex-row items-center justify-center">
              <Crown size={24} color="#FFD700" />
              <CardTitle className="ml-2 text-xl">🏆 MVP Player</CardTitle>
            </View>
          </CardHeader>
          <CardContent className="items-center">
            <Text className="text-2xl font-bold text-foreground mb-2">{winner.username}</Text>
            <Text className="text-3xl font-bold text-yellow-500 mb-2">{winner.points} Points</Text>
            <View className="flex-row gap-4">
              <Text className="text-muted-foreground">{winner.accuracy}% Accuracy</Text>
              <Text className="text-muted-foreground">{winner.streak} Max Streak</Text>
            </View>
          </CardContent>
        </AnimatedCard>

        {/* Game Statistics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex-row items-center">
              <TrendingUp size={20} className="mr-2" />
              Game Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="gap-4">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Clock size={16} color={THEME.dark.secondary} />
                <Text className="ml-2 text-muted-foreground">Duration</Text>
              </View>
              <Text className="font-semibold">{gameData.duration}</Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Target size={16} color={THEME.dark.secondary} />
                <Text className="ml-2 text-muted-foreground">Questions</Text>
              </View>
              <Text className="font-semibold">{gameData.totalQuestions}</Text>
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Users size={16} color={THEME.dark.secondary} />
                <Text className="ml-2 text-muted-foreground">Players</Text>
              </View>
              <Text className="font-semibold">{players.length}</Text>
            </View>

            <View className="mt-4">
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted-foreground">Overall Accuracy</Text>
                <Text className="font-semibold">{gameData.accuracy}%</Text>
              </View>
              <PerformanceBar 
                value={gameData.accuracy} 
                maxValue={100} 
                color="bg-green-500" 
                delay={1000}
              />
            </View>
          </CardContent>
        </Card>

        {/* Final Leaderboard */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex-row items-center">
              <Trophy size={20} className="mr-2" />
              Final Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedPlayers.map((player, index) => (
              <LeaderboardItem 
                key={player.id}
                player={player}
                rank={index + 1}
                delay={300 + (index * 150)}
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
              <View key={player.id} className="mb-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="font-medium">{player.username}</Text>
                  <Text className="text-muted-foreground">{player.points} pts</Text>
                </View>
                <PerformanceBar 
                  value={player.points} 
                  maxValue={maxPoints} 
                  color={index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : index === 2 ? "bg-orange-600" : "bg-blue-500"}
                  delay={1200 + (index * 100)}
                />
              </View>
            ))}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <View className="gap-3 pb-8">
          <Button onPress={() => router.push('/lobby')} className="w-full">
            <Text>Play Again</Text>
          </Button>
          
          <Button 
            onPress={() => router.push('/home')} 
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
