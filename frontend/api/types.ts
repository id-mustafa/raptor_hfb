import { ImageSourcePropType } from "react-native";

export interface User {
  username: string;
  room_id: number | null;
  tokens: number;
  avatar: ImageSourcePropType;
}

export interface FriendRequest {
  id: number;
  username1: string;
  username2: string;
}

export interface Room {
  id: number;
  game_id: number;
}

export type FriendList = User[];
