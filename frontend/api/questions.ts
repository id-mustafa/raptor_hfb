import { apiClient } from "./client";
import type { Question, RawQuestion } from "./types";

// Toggle this to enable/disable mocks
export const USE_MOCKED = true;

// --- MOCK SETUP ---
let mockQuestions: RawQuestion[] = [];
let nextQuestionId = 1;
let mockTimerStarted = false;

const QUESTION_POOL: Omit<RawQuestion, "id" | "room_id">[] = [
    {
        question: "Who will score the first basket for the Lakers?",
        options: "LeBron_Davis_Reaves_Russell",
        answer: 1,
    },
    {
        question: "How many points will Tatum finish with in the first quarter?",
        options: "0-5_6-10_11-15_16+",
        answer: 2,
    },
    {
        question: "Who will make the first three-pointer of the game?",
        options: "LeBron_Tatum_White_Russell",
        answer: 4,
    },
    {
        question: "Which team will reach 10 points first?",
        options: "Lakers_Celtics_Tie_None",
        answer: 1,
    },
    {
        question: "Who will commit the first turnover?",
        options: "Brown_Reaves_Tatum_Russell",
        answer: 2,
    },
    {
        question: "How many rebounds will Anthony Davis have by the end of the first quarter?",
        options: "0-2_3-5_6-8_9+",
        answer: 3,
    },
];

function createMockRawQuestion(id: number, room_id = 1): RawQuestion {
    const base = QUESTION_POOL[Math.floor(Math.random() * QUESTION_POOL.length)];
    return {
        id,
        room_id,
        question: base.question,
        options: base.options,
        answer: base.answer,
    };
}

function startMockTimers(room_id: string) {
    if (mockTimerStarted) return;
    mockTimerStarted = true;

    setTimeout(() => {
        mockQuestions.push(createMockRawQuestion(nextQuestionId++, Number(room_id)));
        console.log("[Mock] Added first question after 10s");

        setInterval(() => {
            mockQuestions.push(createMockRawQuestion(nextQuestionId++, Number(room_id)));
            console.log("[Mock] Added question after 45s interval");
        }, 45_000);
    }, 10_000);
}

// --- API (always RawQuestion[]) ---
export async function getAllQuestions(room_id: string): Promise<RawQuestion[]> {
    if (USE_MOCKED) {
        return Promise.resolve([...mockQuestions]);
    }
    return apiClient.get<RawQuestion[]>("/questionfr/" + room_id);
}

export async function startQuestions(room_id: string): Promise<RawQuestion[]> {
    if (USE_MOCKED) {
        mockQuestions = [];
        nextQuestionId = 1;
        mockTimerStarted = false;
        startMockTimers(room_id);
        return Promise.resolve(mockQuestions);
    }
    return apiClient.post<RawQuestion[]>("/questionfr/start-timer/" + room_id);
}

export async function updateUserTokens(username: string, tokens: number): Promise<boolean> {
    return apiClient.put<boolean>(`/user/${encodeURIComponent(username)}/tokens/${tokens}`);
}
