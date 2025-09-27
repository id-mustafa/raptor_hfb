from sqlmodel import Field, SQLModel
from typing import Optional
from datetime import datetime


class GameData(SQLModel, table=True):
    """
    This model is used to store the game data for the Raptor HFB. Please only use the 2025 season.

    API: https://api.sportsdata.io/v3/nfl/scores/json/Schedules/{SEASON}?key=f8b0b0faf1ab438e98058df6cbc6f6a2

    Sample API Call: https://api.sportsdata.io/v3/nfl/scores/json/Schedules/2025?key=f8b0b0faf1ab438e98058df6cbc6f6a2
    """

    __tablename__ = "game_data"

    # Primary fields
    game_key: str = Field(primary_key=True, alias="GameKey")
    season_type: int = Field(alias="SeasonType")
    season: int = Field(alias="Season")
    week: int = Field(alias="Week")
    date: datetime = Field(alias="Date")
    away_team: str = Field(alias="AwayTeam")
    home_team: str = Field(alias="HomeTeam")
    channel: Optional[str] = Field(default=None, alias="Channel")

    # Betting info
    point_spread: Optional[float] = Field(default=None, alias="PointSpread")
    over_under: Optional[float] = Field(default=None, alias="OverUnder")
    away_team_money_line: Optional[int] = Field(default=None, alias="AwayTeamMoneyLine")
    home_team_money_line: Optional[int] = Field(default=None, alias="HomeTeamMoneyLine")

    # Stadium and location
    stadium_id: Optional[int] = Field(default=None, alias="StadiumID")
    geo_lat: Optional[float] = Field(default=None, alias="GeoLat")
    geo_long: Optional[float] = Field(default=None, alias="GeoLong")

    # Weather forecast
    forecast_temp_low: Optional[int] = Field(default=None, alias="ForecastTempLow")
    forecast_temp_high: Optional[int] = Field(default=None, alias="ForecastTempHigh")
    forecast_description: Optional[str] = Field(
        default=None, alias="ForecastDescription"
    )
    forecast_wind_chill: Optional[int] = Field(default=None, alias="ForecastWindChill")
    forecast_wind_speed: Optional[int] = Field(default=None, alias="ForecastWindSpeed")

    # Game status
    canceled: bool = Field(default=False, alias="Canceled")
    status: Optional[str] = Field(default=None, alias="Status")
    is_closed: Optional[bool] = Field(default=None, alias="IsClosed")

    # Date/time fields
    day: datetime = Field(alias="Day")
    date_time: datetime = Field(alias="DateTime")
    date_time_utc: datetime = Field(alias="DateTimeUTC")

    # Global IDs
    global_game_id: int = Field(alias="GlobalGameID")
    global_away_team_id: int = Field(alias="GlobalAwayTeamID")
    global_home_team_id: int = Field(alias="GlobalHomeTeamID")
    score_id: int = Field(alias="ScoreID")
    status: str = Field(alias="Status")
    is_closed: bool = Field(alias="IsClosed")
