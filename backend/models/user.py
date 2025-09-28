from sqlmodel import Field, SQLModel, Relationship
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .room import Room


class User(SQLModel, table=True):
    username: str = Field(primary_key=True)
    room_id: int = Field(default=None, foreign_key="room.id")
    tokens: str = Field(default=0)
    room: "Room" = Relationship(back_populates="players")
