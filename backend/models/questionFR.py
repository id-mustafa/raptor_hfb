from sqlmodel import Field, SQLModel, Relationship
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from .room import Room


class QuestionFR(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    question: str
    options: str
    answer: int
    room_id: int = Field(foreign_key="room.id", ondelete="CASCADE")
