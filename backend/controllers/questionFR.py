from fastapi import APIRouter
from ..models.user import User
from fastapi import Depends
from typing import List
from ..services.questionFR import QuestionFRService
from ..models.questionFR import QuestionFR
from fastapi import FastAPI, BackgroundTasks
import asyncio

openapi_tags = {
    "name": "QuestionsFR",
    "description": "Routes used for user management",
}

api = APIRouter(prefix="/questionfr", tags=["QuestionsFR"])

@api.get("/{room_id}", response_model=List[QuestionFR], tags=["QuestionsFR"])
def get_questions(room_id: int, ques_svc: QuestionFRService = Depends(QuestionFRService)):
    return ques_svc.get_questions(room_id)


@api.post("/start-timer/{room_id}")
async def start_timer(room_id: int, background_tasks: BackgroundTasks, ques_svc: QuestionFRService = Depends(QuestionFRService)):
    # Schedule timer to run in background
    asyncio.create_task(ques_svc.timer_start(room_id))
    return {"status": "Timer started"}