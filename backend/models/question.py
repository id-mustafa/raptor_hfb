from sqlmodel import Field, SQLModel
from datetime import datetime
from typing import Optional, List
from .PlayerMetricType import PlayerMetricType
from .QuestionResolution import QuestionType
from .QuestionResolution import QuestionResolution


class Question(SQLModel, table=True):
    """
    Player betting question model for the Raptor HFB.
    All questions are about player performance metrics.
    """

    __tablename__ = "question"

    id: Optional[int] = Field(default=None, primary_key=True)
    game_id: str = Field(foreign_key="game_data.game_key")

    # Question details
    question: str = Field()
    question_type: QuestionType = Field(default=QuestionType.OVER_UNDER)
    # Player being bet on
    player_id: int = Field(
        foreign_key="player.id", ondelete="CASCADE"
    )  # Required - the player this question is about

    # Metric being tracked
    metric_type: PlayerMetricType = (
        Field()
    )  # "passing_yards", "rushing_yards", "touchdowns", etc.
    metric_value: float = Field()  # The threshold value (e.g., 250.5 yards)

    # Answer and resolution
    answer: Optional[str] = Field(default=None)  # store the answer in the enum
    actual_value: Optional[float] = Field(default=None)  # Actual result when resolved
    multiplier: Optional[float] = Field(default=1.0)  # Payout multiplier
    is_resolved: bool = Field(default=False)

    # Betting window
    betting_deadline: Optional[datetime] = Field(default=None)  # When betting closes

    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
