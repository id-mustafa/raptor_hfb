from sqlmodel import Field, SQLModel, Relationship
from typing import TYPE_CHECKING
from typing import Optional

if TYPE_CHECKING:
    from .room import Room


class QuestionFR(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)   # allow autoincrement
    question: str
    options: str
    answer: int
    room_id: int = Field(default=None, foreign_key="room.id")