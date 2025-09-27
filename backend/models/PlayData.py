from sqlmodel import Field, SQLModel
from typing import List, Optional
from datetime import datetime
from .PlayStatsData import PlayStatsData


class PlayData(SQLModel, table=True):
    """
    This model stores individual play data for the Raptor HFB.

    API: Part of the real-time data structure from SportsData.io
    Contains a list of PlayStatsData for player statistics on each play.
    """

    __tablename__ = "play_data"

    # Primary fields
    play_id: int = Field(primary_key=True, alias="PlayID")
    quarter_id: int = Field(alias="QuarterID")
    quarter_name: str = Field(alias="QuarterName")
    sequence: int = Field(alias="Sequence")

    # Time information
    time_remaining_minutes: int = Field(alias="TimeRemainingMinutes")
    time_remaining_seconds: int = Field(alias="TimeRemainingSeconds")
    play_time: datetime = Field(alias="PlayTime")
    updated: datetime = Field(alias="Updated")
    created: datetime = Field(alias="Created")

    # Team information
    team: str = Field(alias="Team")
    opponent: str = Field(alias="Opponent")

    # Play details
    down: int = Field(alias="Down")
    distance: int = Field(alias="Distance")
    yard_line: int = Field(alias="YardLine")
    yard_line_territory: str = Field(alias="YardLineTerritory")
    yards_to_end_zone: int = Field(alias="YardsToEndZone")
    type: str = Field(alias="Type")
    yards_gained: int = Field(alias="YardsGained")
    description: str = Field(alias="Description")

    # Scoring information
    is_scoring_play: bool = Field(alias="IsScoringPlay")
    scoring_play: Optional[str] = Field(default=None, alias="ScoringPlay")

    # Related play stats (stored as JSON or separate table relationship)
    # Note: In a real database, you'd typically handle this as a separate table
    # with a foreign key relationship rather than storing as JSON
    play_stats: List[PlayStatsData] = Field(default=[], alias="PlayStats")
