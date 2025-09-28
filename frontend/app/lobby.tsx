import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  View,
  Dimensions,
  Pressable,
  ScrollView,
  ImageSourcePropType,
} from "react-native";
import Matter from "matter-js";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { ChevronLeft, RefreshCcw } from "lucide-react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";
import { triggerSelectionHaptic } from "@/utils/Vibration";
import { THEME } from "@/lib/theme";
import { BackHandler } from "react-native";
import { useAuth } from "@/utils/AuthProvider";

const AVATAR_SIZE = 135;
const AVATAR_RADIUS = AVATAR_SIZE / 2;
const MAX_VELOCITY = 15;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEIGHT_OFFSET = 200;

const PlayerAvatar = React.memo<{
  player: { username: string; avatar: ImageSourcePropType };
  bodyRef: React.MutableRefObject<Record<string, Matter.Body>>;
}>(({ player, bodyRef }) => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }],
  }));

  useEffect(() => {
    const id = requestAnimationFrame(function loop() {
      const body = bodyRef.current[player.username];
      if (body) {
        x.value = body.position.x - AVATAR_RADIUS;
        y.value = body.position.y - AVATAR_RADIUS;
      }
      requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(id);
  }, [player.username, bodyRef, x, y]);

  return (
    <Animated.View
      className="absolute"
      style={[{ width: AVATAR_SIZE, height: AVATAR_SIZE }, animatedStyle]}
    >
      <Animated.Image
        source={player.avatar}
        className="w-full h-full"
        style={{ borderRadius: AVATAR_RADIUS }}
      />
    </Animated.View>
  );
});

//
// 🏷️ Name label component
//
const PlayerName = React.memo<{
  player: { username: string };
  bodyRef: React.MutableRefObject<Record<string, Matter.Body>>;
}>(({ player, bodyRef }) => {
  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value + AVATAR_SIZE }],
  }));

  useEffect(() => {
    const id = requestAnimationFrame(function loop() {
      const body = bodyRef.current[player.username];
      if (body) {
        x.value = body.position.x - AVATAR_RADIUS;
        y.value = body.position.y - AVATAR_RADIUS;
      }
      requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(id);
  }, [player.username, bodyRef, x, y]);

  return (
    <Animated.View
      className="absolute items-center"
      style={[{ width: AVATAR_SIZE, paddingTop: 4 }, animatedStyle]}
    >
      <Text className="font-bold text-lg text-foreground bg-background px-2 rounded">
        {player.username}
      </Text>
    </Animated.View>
  );
});

//
// 🏟️ Main Lobby Screen
//
export default function Lobby() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

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

  const { currentRoomUsers, refresh, setGameStartTime } = useAuth();

  const engineRef = useRef(Matter.Engine.create());
  const bodiesRef = useRef<Record<string, Matter.Body>>({});

  const draggedBodyId = useSharedValue<string | null>(null);
  const dragOffset = useSharedValue({ dx: 0, dy: 0 });
  const fingerPosition = useSharedValue({ x: 0, y: 0 });

  const setPlayers = useCallback(() => {
    const containerWidth = SCREEN_WIDTH;
    const containerHeight = SCREEN_HEIGHT - HEIGHT_OFFSET;
    const cols = 2;
    const spacingX = 40;
    const spacingY = 50;

    const rows = Math.ceil(currentRoomUsers.length / cols);
    const totalHeight = rows * AVATAR_SIZE + (rows - 1) * spacingY;
    const startY = (containerHeight - totalHeight) / 2 + AVATAR_RADIUS;

    currentRoomUsers.forEach((p, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const numInRow =
        row === rows - 1 && currentRoomUsers.length % cols !== 0
          ? currentRoomUsers.length % cols
          : cols;
      const rowWidth = numInRow * AVATAR_SIZE + (numInRow - 1) * spacingX;
      const startX = (containerWidth - rowWidth) / 2 + AVATAR_RADIUS;
      const x = startX + col * (AVATAR_SIZE + spacingX);
      const y = startY + row * (AVATAR_SIZE + spacingY);

      const body = bodiesRef.current[p.username];
      if (body) {
        Matter.Body.setPosition(body, { x, y });
        Matter.Body.setVelocity(body, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(body, 0);
      }
    });
  }, [currentRoomUsers]);

  useEffect(() => {
    const engine = engineRef.current;
    const world = engine.world;
    world.gravity.y = 0;

    const thickness = 50;
    const containerHeight = SCREEN_HEIGHT - HEIGHT_OFFSET;

    const walls = [
      Matter.Bodies.rectangle(
        SCREEN_WIDTH / 2,
        -thickness / 2,
        SCREEN_WIDTH,
        thickness,
        { isStatic: true }
      ),
      Matter.Bodies.rectangle(
        SCREEN_WIDTH / 2,
        containerHeight + thickness / 2,
        SCREEN_WIDTH,
        thickness,
        { isStatic: true }
      ),
      Matter.Bodies.rectangle(
        -thickness / 2,
        containerHeight / 2,
        thickness,
        containerHeight,
        { isStatic: true }
      ),
      Matter.Bodies.rectangle(
        SCREEN_WIDTH + thickness / 2,
        containerHeight / 2,
        thickness,
        containerHeight,
        { isStatic: true }
      ),
    ];
    Matter.World.add(world, walls);

    const bodies: Record<string, Matter.Body> = {};
    currentRoomUsers.forEach((p) => {
      const body = Matter.Bodies.circle(0, 0, AVATAR_RADIUS, {
        restitution: 0.9,
        frictionAir: 0.03,
      });
      bodies[p.username] = body;
      Matter.World.add(world, body);
    });
    bodiesRef.current = bodies;

    setPlayers();

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    return () => {
      Matter.Runner.stop(runner);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, [setPlayers, currentRoomUsers]);

  const onDragStart = useCallback((x: number, y: number) => {
    for (const [username, body] of Object.entries(bodiesRef.current)) {
      const dist = Math.hypot(x - body.position.x, y - body.position.y);
      if (dist <= (body.circleRadius ?? AVATAR_RADIUS)) {
        draggedBodyId.value = username;
        dragOffset.value = { dx: x - body.position.x, dy: y - body.position.y };
        break;
      }
    }
    triggerSelectionHaptic();
  }, []);

  const onDragEnd = useCallback((velocityX: number, velocityY: number) => {
    const id = draggedBodyId.value;
    if (id && bodiesRef.current[id]) {
      const body = bodiesRef.current[id];
      let vx = Math.max(-MAX_VELOCITY, Math.min(velocityX / 10, MAX_VELOCITY));
      let vy = Math.max(-MAX_VELOCITY, Math.min(velocityY / 10, MAX_VELOCITY));
      Matter.Body.setVelocity(body, { x: vx, y: vy });
    }
    draggedBodyId.value = null;
  }, []);

  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      fingerPosition.value = { x: e.x, y: e.y };
      runOnJS(onDragStart)(e.x, e.y);
    })
    .onUpdate((e) => {
      fingerPosition.value = { x: e.x, y: e.y };
    })
    .onEnd((e) => {
      runOnJS(onDragEnd)(e.velocityX, e.velocityY);
    });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ flexGrow: 1 }}>
      <Stack.Screen
        options={{
          title: `Lobby (${currentRoomUsers.length} players)`,
          headerLeft: () => (
            <Pressable onPress={() => router.push("/home")}>
              <ChevronLeft size={24} color={THEME.dark.secondary} />
            </Pressable>
          )
        }}
      />

      <GestureDetector gesture={panGesture}>
        <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT - HEIGHT_OFFSET }}>
          {currentRoomUsers.map((p) => (
            <React.Fragment key={p.username}>
              <PlayerAvatar player={p} bodyRef={bodiesRef} />
              <PlayerName player={p} bodyRef={bodiesRef} />
            </React.Fragment>
          ))}
        </View>
      </GestureDetector>

      <View className="flex flex-col gap-2 items-center">
        <Button variant="ghost" onPress={setPlayers} className="w-64">
          <Text className="font-normal">reset positions</Text>
        </Button>

        <Button onPress={() => { setGameStartTime(new Date()); router.push("/game"); }} className="w-64 mb-20">
          <Text>Start Game</Text>
        </Button>
      </View>
    </ScrollView>
  );
}
