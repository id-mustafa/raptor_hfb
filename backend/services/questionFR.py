from ..models.user import User
from ..db import db_session
from sqlmodel import Session, select
from fastapi import Depends, HTTPException
from ..models.questionFR import QuestionFR
from time import sleep
from asyncio import sleep
import asyncio

import json
import asyncio
import openai

# Your play-by-play JSON
play_by_play = [
    {
        "timestamp": "12:00",
        "play": "Kristaps Porzingis vs. Anthony Davis (LeBron James gains possession)",
        "lakersPoints": 0,
        "celticsPoints": 0,
        "mainPlayer": "Kristaps Porzingis"
    },
    {
        "timestamp": "11:45",
        "play": "Austin Reaves misses 25-foot three point jumper",
        "lakersPoints": 0,
        "celticsPoints": 0,
        "mainPlayer": "Austin Reaves"
    },
    {
        "timestamp": "11:42",
        "play": "Jayson Tatum defensive rebound",
        "lakersPoints": 0,
        "celticsPoints": 0,
        "mainPlayer": "Jayson Tatum"
    },
    # ... include the rest of your JSON here ...
]

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

    async def generate_question(self, play_by_play: str) -> dict:
        """
        Call OpenAI API to generate a betting-style question with 1-word options
        """
        prompt = f"""
        You are a sports quiz generator. Based on the following NBA play-by-play snippet, 
        create 1 question with 4 one-word options suitable for a betting game.

        Play-by-play:
        {play_by_play}

        Output JSON format:
        {{
          "question": "...",
          "options": ["Option1", "Option2", "Option3", "Option4"]
        }}
        """

        response = openai.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )

        result_text = response.choices[0].message.content
        try:
            import json
            result_json = json.loads(result_text)
        except Exception:
            result_json = {"question": "Could not generate question", "options": ["A", "B", "C", "D"]}
        
        return result_json

    
    async def timer_start(self, room_id: int):
        timer = 0

        await asyncio.sleep(1)  # non-blocking delay before starting

        while timer < 300:
            if timer % 20 == 0:
                question_data = await self.generate_question(play_by_play)
                statement = select(QuestionFR).order_by(QuestionFR.id.desc())
                last_row = self.db.exec(statement).first()   # first after ordering DESC
                last_id = last_row.id if last_row else None

                self.db.add(QuestionFR(
                    id=last_id + 1,
                    question=question_data["question"],
                    options="_".join(question_data["options"]),
                    answer=1,  # Default or you could randomize
                    room_id=room_id
                ))
                self.db.commit()
            timer += 1
            await asyncio.sleep(1)  # non-blocking sleep
        return "Timer finished"
