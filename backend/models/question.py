from sqlmodel import Field, SQLModel
from datetime import datetime
from typing import Optional


class Question(SQLModel, table=True):
    """
    This model is used to store the question for the Raptor HFB.
    """

    __tablename__ = "question"

    id: int = Field(primary_key=True)
    game_id: int = Field(foreign_key="game.id", ondelete="CASCADE")
    question: str = Field()
    question_type: str = Field(default="over_under")
    answer: Optional[str] = Field(default=None)
    multiplier: Optional[int] = Field(default=None)
    is_resolved: Optional[bool] = Field(default=False)
    entity_type: Optional[str] = Field(default=None)  # player, team, game
    entity_id: Optional[int] = Field(
        foreign_key="player.id", ondelete="CASCADE", default=None
    )  # player id, team id, game id
    entity_id: Optional[int] = Field(
        foreign_key="team.id", ondelete="CASCADE", default=None
    )  # player id, team id, game id
    entity_id: Optional[int] = Field(
        foreign_key="game.id", ondelete="CASCADE", default=None
    )  # player id, team id, game id
    entity_name: Optional[str] = Field(
        default=None
    )  # player name, team name, game name

    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
