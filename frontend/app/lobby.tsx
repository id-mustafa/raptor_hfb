import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { View, Dimensions, ImageSourcePropType } from "react-native";
import Matter from "matter-js";
import { Stack, useRouter } from "expo-router";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  SharedValue,
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from "react-native-reanimated";

const AVATAR_SIZE = 135;
const AVATAR_RADIUS = AVATAR_SIZE / 2;
const MAX_VELOCITY = 15;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const HEIGHT_OFFSET = 200;

type Player = {
  id: string;
  name: string;
  avatar: ImageSourcePropType;
};

type PlayerAvatarProps = {
  position: {
    x: SharedValue<number>;
    y: SharedValue<number>;
  };
  source: ImageSourcePropType;
};

const PlayerAvatar = React.memo<PlayerAvatarProps>(({ position, source }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: position.x.value },
        { translateY: position.y.value },
      ],
    };
  });

  return (
    <Animated.View
      className="absolute"
      style={[{ width: AVATAR_SIZE, height: AVATAR_SIZE }, animatedStyle]}
    >
      <Animated.Image
        source={source}
        className="w-full h-full"
        style={{ borderRadius: AVATAR_RADIUS }}
      />
    </Animated.View>
  );
});

const PlayerName = React.memo<{
  name: string;
  position: { x: SharedValue<number>; y: SharedValue<number> };
}>(({ name, position }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: position.x.value },
        { translateY: position.y.value + AVATAR_SIZE },
      ],
    };
  });

  return (
    <Animated.View
      className="absolute items-center"
      style={[{ width: AVATAR_SIZE, paddingTop: 4 }, animatedStyle]}
    >
      <Text className="font-bold text-lg text-foreground bg-background px-2 rounded">{name}</Text>
    </Animated.View>
  );
});

export default function Lobby() {
  const router = useRouter();

  const players: Player[] = useMemo(
    () => [
      { id: "1", name: "Alice", avatar: require("@/assets/images/avatar1.jpg") },
      { id: "2", name: "Bob", avatar: require("@/assets/images/avatar2.jpg") },
      { id: "3", name: "Charlie", avatar: require("@/assets/images/avatar3.jpg") },
      { id: "4", name: "David", avatar: require("@/assets/images/avatar4.jpg") },
      { id: "5", name: "Eve", avatar: require("@/assets/images/avatar5.jpg") },
    ],
    []
  );

  const engineRef = useRef(Matter.Engine.create());
  const bodiesRef = useRef<Record<string, Matter.Body>>({});

  const animatedPositions: {
    [key: string]: { x: SharedValue<number>; y: SharedValue<number> };
  } = Object.fromEntries(
    players.map((p) => [
      p.id,
      { x: useSharedValue(0), y: useSharedValue(0) },
    ])
  );

  const draggedBodyId = useSharedValue<string | null>(null);
  const dragOffset = useSharedValue({ dx: 0, dy: 0 });
  const fingerPosition = useSharedValue({ x: 0, y: 0 });

  const setPlayers = useCallback(() => {
    const containerWidth = SCREEN_WIDTH;
    const containerHeight = SCREEN_HEIGHT - HEIGHT_OFFSET;
    const cols = 2;
    const spacingX = 40;
    const spacingY = 50;

    const rows = Math.ceil(players.length / cols);
    const totalHeight =
      rows * AVATAR_SIZE + (rows - 1) * spacingY;
    const startY = (containerHeight - totalHeight) / 2 + AVATAR_RADIUS;

    players.forEach((p, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;

      const numInRow =
        row === rows - 1 && players.length % cols !== 0
          ? players.length % cols
          : cols;

      const rowWidth = numInRow * AVATAR_SIZE + (numInRow - 1) * spacingX;
      const startX = (containerWidth - rowWidth) / 2 + AVATAR_RADIUS;

      const x = startX + col * (AVATAR_SIZE + spacingX);
      const y = startY + row * (AVATAR_SIZE + spacingY);

      const body = bodiesRef.current[p.id];
      if (body) {
        Matter.Body.setPosition(body, { x, y });
        Matter.Body.setVelocity(body, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(body, 0);
      }

      animatedPositions[p.id].x.value = x - AVATAR_RADIUS;
      animatedPositions[p.id].y.value = y - AVATAR_RADIUS;
    });
  }, [players]);

  useEffect(() => {
    const engine = engineRef.current;
    const world = engine.world;
    world.gravity.y = 0;

    const thickness = 50;
    const containerHeight = SCREEN_HEIGHT - HEIGHT_OFFSET;

    const walls = [
      Matter.Bodies.rectangle(SCREEN_WIDTH / 2, -thickness / 2, SCREEN_WIDTH, thickness, { isStatic: true }),
      Matter.Bodies.rectangle(SCREEN_WIDTH / 2, containerHeight + thickness / 2, SCREEN_WIDTH, thickness, { isStatic: true }),
      Matter.Bodies.rectangle(-thickness / 2, containerHeight / 2, thickness, containerHeight, { isStatic: true }),
      Matter.Bodies.rectangle(SCREEN_WIDTH + thickness / 2, containerHeight / 2, thickness, containerHeight, { isStatic: true }),
    ];
    Matter.World.add(world, walls);

    const bodies: Record<string, Matter.Body> = {};
    players.forEach((p) => {
      const body = Matter.Bodies.circle(0, 0, AVATAR_RADIUS, {
        restitution: 0.9,
        frictionAir: 0.03,
      });
      bodies[p.id] = body;
      Matter.World.add(world, body);
    });
    bodiesRef.current = bodies;

    setPlayers();

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    let frameId: number;
    const gameLoop = () => {
      if (draggedBodyId.value) {
        const body = bodiesRef.current[draggedBodyId.value];
        if (body) {
          let targetX = fingerPosition.value.x - dragOffset.value.dx;
          let targetY = fingerPosition.value.y - dragOffset.value.dy;

          targetX = Math.max(AVATAR_RADIUS, Math.min(targetX, SCREEN_WIDTH - AVATAR_RADIUS));
          targetY = Math.max(AVATAR_RADIUS, Math.min(targetY, containerHeight - AVATAR_RADIUS));

          Matter.Body.setPosition(body, { x: targetX, y: targetY });
          Matter.Body.setVelocity(body, { x: 0, y: 0 });
        }
      }

      for (const p of players) {
        const body = bodies[p.id];
        if (body) {
          animatedPositions[p.id].x.value = body.position.x - AVATAR_RADIUS;
          animatedPositions[p.id].y.value = body.position.y - AVATAR_RADIUS;
        }
      }
      frameId = requestAnimationFrame(gameLoop);
    };
    gameLoop();

    return () => {
      cancelAnimationFrame(frameId);
      Matter.Runner.stop(runner);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, [setPlayers]);

  const onDragStart = useCallback((x: number, y: number) => {
    for (const [id, body] of Object.entries(bodiesRef.current)) {
      const dist = Math.hypot(x - body.position.x, y - body.position.y);
      if (dist <= (body.circleRadius ?? AVATAR_RADIUS)) {
        draggedBodyId.value = id;
        dragOffset.value = { dx: x - body.position.x, dy: y - body.position.y };
        break;
      }
    }
  }, []);

  const onDragEnd = useCallback((velocityX: number, velocityY: number) => {
    const id = draggedBodyId.value;
    if (id && bodiesRef.current[id]) {
      const body = bodiesRef.current[id];

      let vx = velocityX / 20;
      let vy = velocityY / 20;

      vx = Math.max(-MAX_VELOCITY, Math.min(vx, MAX_VELOCITY));
      vy = Math.max(-MAX_VELOCITY, Math.min(vy, MAX_VELOCITY));

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
    })
    .withTestId("pan-gesture-handler");

  return (
    <View className="flex-1 items-center justify-between bg-background">
      <Stack.Screen options={{ title: `Lobby (${players.length}/5 players)` }} />

      <GestureDetector gesture={panGesture}>
        <View style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT - HEIGHT_OFFSET }}>
            {players.map((p) => (
            <PlayerAvatar key={p.id} position={animatedPositions[p.id]} source={p.avatar} />
          ))}
          {players.map((p) => (
            <PlayerName key={`${p.id}-name`} name={p.name} position={animatedPositions[p.id]} />
          ))}

        </View>
      </GestureDetector>

     <View className="flex flex-col gap-2">
      <Button variant="ghost" onPress={setPlayers} className="w-64">
        <Text className="font-normal">reset positions</Text>
      </Button>

      <Button onPress={() => router.push("/game")} className="w-64 mb-20">
        <Text>Start Game</Text>
      </Button>
      </View>
    </View>
  );
}
