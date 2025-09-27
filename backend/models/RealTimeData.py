from sqlmodel import Field, SQLModel
from models.ScoreData import ScoreData
from models.QuarterData import QuarterData
from models.PlayData import PlayData
from typing import List


class RealTimeData(SQLModel, table=False):
    """
    The highest layer of abstraction for each real time data call

    Sample Game ID: 19058

    api: https://api.sportsdata.io/v3/nfl/pbp/json/PlayByPlay/{GAME_ID}?key=f8b0b0faf1ab438e98058df6cbc6f6a2

    Sample API Call: https://api.sportsdata.io/v3/nfl/pbp/json/PlayByPlay/19058?key=f8b0b0faf1ab438e98058df6cbc6f6a2
    """

    score_data: ScoreData = Field(alias="ScoreData")
    quarters_data: List[QuarterData] = Field(alias="QuartersData")
    plays_data: List[PlayData] = Field(alias="PlaysData")
