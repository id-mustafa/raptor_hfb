from sqlmodel import Field, SQLModel
from typing import Optional
from datetime import datetime
from .QuestionResolution import QuestionResolution


class Bet(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    username: str = Field(foreign_key="user.username", ondelete="CASCADE")
    question_id: int = Field(
        foreign_key="question.id", ondelete="CASCADE"
    )  # Fixed foreign key

    # Bet details
    user_answer: QuestionResolution = Field()  # User's prediction (OVER/UNDER, YES/NO)
    bet_amount: int = Field()  # Amount of tokens bet
    # Resolution (filled when question is resolved)
    correct_answer: Optional[QuestionResolution] = Field(default=None)
    is_correct: Optional[bool] = Field(default=None)
    outcome: Optional[int] = Field(default=None)  # "Won 150 tokens" or "Lost 50 tokens"

    created_at: datetime = Field(default_factory=datetime.now)
