from fastapi import APIRouter, Depends
from ..services.question import QuestionService
from ..models.question import Question
from typing import List

openapi_tags = {
    "name": "Questions",
    "description": "Routes used for question management",
}

api = APIRouter(prefix="/question", tags=["Questions"])

@api.post("/create", response_model=Question, tags=["Questions"])
async def create_question(
    question: Question, question_svc: QuestionService = Depends(QuestionService)
):
    return question_svc.create_question(question)


@api.get("/{game_id}", response_model=List[Question], tags=["Questions"])
async def get_questions(
    game_id: int, question_svc: QuestionService = Depends(QuestionService)
):
    return question_svc.get_questions(game_id)


@api.put("/{question_id}", response_model=Question, tags=["Questions"])
async def update_question(
    question_id: int,
    question: Question,
    question_svc: QuestionService = Depends(QuestionService),
):
    return question_svc.update_question(question_id, question)


@api.post("/{question_id}/resolve", response_model=Question, tags=["Questions"])
async def resolve_question(
    question_id: int,
    actual_value: float,
    question_svc: QuestionService = Depends(QuestionService),
):
    return question_svc.solve_question(question_id, actual_value)


@api.get("/{question_id}", response_model=Question, tags=["Questions"])
async def get_question(
    question_id: int, question_svc: QuestionService = Depends(QuestionService)
):
    return question_svc.get_question(question_id)
