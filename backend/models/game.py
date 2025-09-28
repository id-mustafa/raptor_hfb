from sqlmodel import Field, SQLModel
from typing import Optional
from datetime import datetime


class Game(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field()
    start_time: datetime = Field()
    end_time: datetime = Field()
    status: str = Field()
    away_team: str = Field()
    home_team: str = Field()
    away_team_score: int = Field()
    home_team_score: int = Field()
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
