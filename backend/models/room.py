from sqlmodel import Field, SQLModel, Relationship
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User
from .user import User


class Room(SQLModel, table=True):
    id: int = Field(primary_key=True)
    game_id: int = Field()
    players: List["User"] = Relationship(back_populates="room")
    started: bool = Field(default=False)
