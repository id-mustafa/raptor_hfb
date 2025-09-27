from sqlmodel import Field, SQLModel
from typing import Optional
from datetime import datetime


class Bet(SQLModel, table=True):
    id: int = Field(primary_key=True)
    username: str = Field(foreign_key="user.username", ondelete="CASCADE")
    question: str = Field(foreign_key="question.id", ondelete="CASCADE")
    user_answer: bool = Field()
    correct_answer: Optional[bool] = Field(default=None)
    is_correct: Optional[bool] = Field(default=None)
    outcome: Optional[str] = Field(default=None)

    created_at: datetime = Field(default_factory=datetime.now)
