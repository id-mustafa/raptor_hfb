from sqlmodel import Field, SQLModel
from datetime import datetime


class QuarterData(SQLModel, table=True):
    """
    This model stores quarter-by-quarter scoring data for the Raptor HFB.

    API: Part of the Score data structure from SportsData.io
    """

    __tablename__ = "quarter_data"

    # Primary fields
    quarter_id: int = Field(primary_key=True, alias="QuarterID")
    score_id: int = Field(alias="ScoreID")
    number: int = Field(alias="Number")
    name: str = Field(alias="Name")
    description: str = Field(alias="Description")

    # Scores
    away_team_score: int = Field(alias="AwayTeamScore")
    home_team_score: int = Field(alias="HomeTeamScore")

    # Timestamps
    updated: datetime = Field(alias="Updated")
    created: datetime = Field(alias="Created")
