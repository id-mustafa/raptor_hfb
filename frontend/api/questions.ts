import { apiClient } from "./client";
import type { Question, RawQuestion } from "./types";

// Toggle this to enable/disable mocks
export const USE_MOCKED = true;

// --- MOCK SETUP ---
let mockQuestions: RawQuestion[] = [];
let nextQuestionId = 1;
let mockTimerStarted = false;

function createMockRawQuestion(id: number, room_id = 1): RawQuestion {
    return {
        id,
        room_id,
        question: `Who missed a 25-foot three point jumper?`,
        options: `LeBron_Porzingis_Davis_Tatum`,
        answer: Math.floor(Math.random() * 4) + 1,
    };
}

function startMockTimers(room_id: string) {
    if (mockTimerStarted) return;
    mockTimerStarted = true;

    // First question after 10s
    setTimeout(() => {
        mockQuestions.push(createMockRawQuestion(nextQuestionId++, Number(room_id)));
        console.log("[Mock] Added first question after 10s");

        // Then every 45s thereafter
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