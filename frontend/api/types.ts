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
  started_game: boolean;
}

export type FriendList = User[];

export interface RawQuestion {
  id: number;
  room_id: number;
  question: string;
  options: string; // "A_B_C_D"
  answer: number;  // 1–4
}

// keep your existing Question interface
export interface Question {
  id: number;
  question_text: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  correct_answer: number;
}


export function normalizeRawQuestion(raw: RawQuestion): Question {
  const opts = raw.options.split("_");
  return {
    id: raw.id,
    question_text: raw.question,
    option_1: opts[0],
    option_2: opts[1],
    option_3: opts[2],
    option_4: opts[3],
    correct_answer: raw.answer, 
  };
}