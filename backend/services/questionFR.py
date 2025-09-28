from ..models.user import User
from ..db import db_session
from sqlmodel import Session, select
from fastapi import Depends, HTTPException
from ..models.questionFR import QuestionFR
from time import sleep
from asyncio import sleep
import asyncio

class QuestionFRService:

    def __init__(self, db: Session = Depends(db_session)):
        self.db = db

    def get_questions(self, room_id: str):
        return self.db.exec(select(QuestionFR).where(QuestionFR.room_id == room_id)).all()

    # def timer_start(self, room_id: int):
    #     timer = 0
    #     sleep(10)
    #     Questions = ["What is the capital of France?", "What is 2 + 2?", "What is the largest planet in our solar system?"]
    #     while timer < 300:
    #         #push a question into the db
    #         if(timer % 20 == 0):
    #             self.db.add(QuestionFR(question=Questions[timer % 3], options="Option 1_Option 2_Option 3_Option 4", answer=1, room_id=room_id))
    #             timer += 1
    #             sleep(1)
    #     return "Timer finished"
    
    async def timer_start(self, room_id: int):
        timer = 0

        await asyncio.sleep(1)  # non-blocking delay before starting

        while timer < 300:
            if timer % 20 == 0:
                statement = select(QuestionFR).order_by(QuestionFR.id.desc())
                last_row = self.db.exec(statement).first()   # first after ordering DESC
                last_id = last_row.id if last_row else None

                self.db.add(QuestionFR(
                    id=last_id+1,
                    question= "What is the capital of France?",
                    options="Option 1_Option 2_Option 3_Option 4",
                    answer=1,
                    room_id=room_id
                ))
                self.db.commit()
            timer += 1
            await asyncio.sleep(1)  # non-blocking sleep
        return "Timer finished"
