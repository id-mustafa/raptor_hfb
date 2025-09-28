from sqlmodel import Field, SQLModel
from typing import Optional, List, Dict
from sqlalchemy import Column, JSON
from datetime import datetime


class ScoreData(SQLModel, table=True):
    """
    NBA Play-by-Play snapshot. Stores the nested payload as JSON with
    a few denormalized fields for quick querying.

    sample game id: 19058

    API: https://api.sportsdata.io/v3/nfl/pbp/json/PlayByPlay/{GAME_ID}?key=f8b0b0faf1ab438e98058df6cbc6f6a2

    NBA API: https://api.sportsdata.io/v3/nba/pbp/json/PlayByPlay/21590?key=5e7148300d764ef98063edc8e60eca47
    """

    __tablename__ = "score_data"

    # Primary key for our table (autoincrement)
    id: Optional[int] = Field(default=None, primary_key=True)

    # Denormalized keys for convenience and indexing
    game_id: Optional[int] = Field(default=None, index=True)
    status: Optional[str] = Field(default=None)
    home_team: Optional[str] = Field(default=None)
    away_team: Optional[str] = Field(default=None)
    home_team_score: Optional[int] = Field(default=None)
    away_team_score: Optional[int] = Field(default=None)
    is_closed: Optional[bool] = Field(default=None)
    date_time_utc: Optional[datetime] = Field(default=None)
    updated: Optional[datetime] = Field(default=None)

    # Raw nested payloads
    game: Optional[Dict] = Field(default=None, alias="Game", sa_column=Column(JSON))
    quarters: Optional[List[Dict]] = Field(
        default=None, alias="Quarters", sa_column=Column(JSON)
    )
    plays: Optional[List[Dict]] = Field(
        default=None, alias="Plays", sa_column=Column(JSON)
    )
