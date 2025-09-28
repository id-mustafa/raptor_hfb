from fastapi import APIRouter, Depends
from ..services.question import QuestionService
from ..models.question import Question
from typing import List

api = APIRouter(prefix="/question", tags=["question"])

openapi_tags = {
    "name": "Question",
    "description": "Routes used for question management",
}


@api.post("/create", response_model=Question, tags=["question"])
async def create_question(
    question: Question, question_svc: QuestionService = Depends(QuestionService)
):
    return question_svc.create_question(question)


@api.get("/{game_id}", response_model=List[Question], tags=["question"])
async def get_questions(
    game_id: int, question_svc: QuestionService = Depends(QuestionService)
):
    return question_svc.get_questions(game_id)


@api.put("/{question_id}", response_model=Question, tags=["question"])
async def update_question(
    question_id: int,
    question: Question,
    question_svc: QuestionService = Depends(QuestionService),
):
    return question_svc.update_question(question_id, question)


@api.post("/{question_id}/resolve", response_model=Question, tags=["question"])
async def resolve_question(
    question_id: int,
    actual_value: float,
    question_svc: QuestionService = Depends(QuestionService),
):
    return question_svc.solve_question(question_id, actual_value)


@api.get("/{question_id}", response_model=Question, tags=["question"])
async def get_question(
    question_id: int, question_svc: QuestionService = Depends(QuestionService)
):
    return question_svc.get_question(question_id)
