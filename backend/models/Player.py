from sqlmodel import Field, SQLModel
from datetime import datetime
from typing import Optional


class Player(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field()
    game_id: int = Field(foreign_key="game.id")
    team: str = Field()