from sqlmodel import Field, SQLModel
from typing import Optional, List
from datetime import datetime


class Bet(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field()
    question_id: int = Field(
        foreign_key="questionfr.id", ondelete="CASCADE"
    )  # Fixed foreign key
    # Bet details
    user_answer: str = Field(
        alias="user_answer"
    )  # User's prediction (OVER/UNDER, YES/NO)
    bet_amount: int = Field(alias="bet_amount")  # Amount of tokens bet
    # Resolution (filled when question is resolved)
    created_at: datetime = Field(default_factory=datetime.now)
