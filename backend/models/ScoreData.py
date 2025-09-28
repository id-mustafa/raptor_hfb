from sqlmodel import Field, SQLModel
from typing import Optional
from datetime import datetime


class StadiumDetails(SQLModel, table=False):
    """Nested stadium details within ScoreData"""

    stadium_id: int = Field(alias="StadiumID")
    name: str = Field(alias="Name")
    city: str = Field(alias="City")
    state: str = Field(alias="State")
    country: str = Field(alias="Country")
    capacity: int = Field(alias="Capacity")
    playing_surface: str = Field(alias="PlayingSurface")
    geo_lat: Optional[float] = Field(default=None, alias="GeoLat")
    geo_long: Optional[float] = Field(default=None, alias="GeoLong")
    type: str = Field(alias="Type")


class ScoreData(SQLModel, table=True):
    """
    This model stores live game score data for the Raptor HFB.

    sample game id: 19058

    API: https://api.sportsdata.io/v3/nfl/pbp/json/PlayByPlay/{GAME_ID}?key=f8b0b0faf1ab438e98058df6cbc6f6a2
    """

    __tablename__ = "score_data"

    # Primary fields
    game_key: str = Field(primary_key=True, alias="GameKey")
    season_type: int = Field(alias="SeasonType")
    season: int = Field(alias="Season")
    week: int = Field(alias="Week")
    date: datetime = Field(alias="Date")
    away_team: str = Field(alias="AwayTeam")
    home_team: str = Field(alias="HomeTeam")
    away_score: int = Field(alias="AwayScore")
    home_score: int = Field(alias="HomeScore")

    # Betting info
    channel: Optional[str] = Field(default=None, alias="Channel")
    point_spread: Optional[float] = Field(default=None, alias="PointSpread")
    over_under: Optional[float] = Field(default=None, alias="OverUnder")
    away_team_money_line: Optional[int] = Field(default=None, alias="AwayTeamMoneyLine")
    home_team_money_line: Optional[int] = Field(default=None, alias="HomeTeamMoneyLine")
    point_spread_away_team_money_line: Optional[int] = Field(
        default=None, alias="PointSpreadAwayTeamMoneyLine"
    )
    point_spread_home_team_money_line: Optional[int] = Field(
        default=None, alias="PointSpreadHomeTeamMoneyLine"
    )
    over_payout: Optional[int] = Field(default=None, alias="OverPayout")
    under_payout: Optional[int] = Field(default=None, alias="UnderPayout")

    # Game state
    quarter: Optional[str] = Field(default=None, alias="Quarter")
    time_remaining: Optional[str] = Field(default=None, alias="TimeRemaining")
    possession: Optional[str] = Field(default=None, alias="Possession")
    down: Optional[int] = Field(default=None, alias="Down")
    distance: Optional[str] = Field(default=None, alias="Distance")
    yard_line: Optional[int] = Field(default=None, alias="YardLine")
    yard_line_territory: Optional[str] = Field(default=None, alias="YardLineTerritory")
    red_zone: Optional[str] = Field(default=None, alias="RedZone")
    down_and_distance: Optional[str] = Field(default=None, alias="DownAndDistance")
    quarter_description: Optional[str] = Field(default=None, alias="QuarterDescription")
    last_play: Optional[str] = Field(default=None, alias="LastPlay")

    # Quarter scores
    away_score_quarter1: int = Field(default=0, alias="AwayScoreQuarter1")
    away_score_quarter2: int = Field(default=0, alias="AwayScoreQuarter2")
    away_score_quarter3: int = Field(default=0, alias="AwayScoreQuarter3")
    away_score_quarter4: int = Field(default=0, alias="AwayScoreQuarter4")
    away_score_overtime: int = Field(default=0, alias="AwayScoreOvertime")
    home_score_quarter1: int = Field(default=0, alias="HomeScoreQuarter1")
    home_score_quarter2: int = Field(default=0, alias="HomeScoreQuarter2")
    home_score_quarter3: int = Field(default=0, alias="HomeScoreQuarter3")
    home_score_quarter4: int = Field(default=0, alias="HomeScoreQuarter4")
    home_score_overtime: int = Field(default=0, alias="HomeScoreOvertime")

    # Game status flags
    has_started: bool = Field(default=False, alias="HasStarted")
    is_in_progress: bool = Field(default=False, alias="IsInProgress")
    is_over: bool = Field(default=False, alias="IsOver")
    has_1st_quarter_started: bool = Field(default=False, alias="Has1stQuarterStarted")
    has_2nd_quarter_started: bool = Field(default=False, alias="Has2ndQuarterStarted")
    has_3rd_quarter_started: bool = Field(default=False, alias="Has3rdQuarterStarted")
    has_4th_quarter_started: bool = Field(default=False, alias="Has4thQuarterStarted")
    is_overtime: bool = Field(default=False, alias="IsOvertime")
    canceled: bool = Field(default=False, alias="Canceled")
    closed: bool = Field(default=False, alias="Closed")
    is_closed: bool = Field(default=False, alias="IsClosed")
    neutral_venue: bool = Field(default=False, alias="NeutralVenue")

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

    # Date/time fields
    last_updated: datetime = Field(alias="LastUpdated")
    day: datetime = Field(alias="Day")
    date_time: datetime = Field(alias="DateTime")
    date_time_utc: datetime = Field(alias="DateTimeUTC")
    game_end_date_time: Optional[datetime] = Field(
        default=None, alias="GameEndDateTime"
    )

    # Team IDs
    away_team_id: int = Field(alias="AwayTeamID")
    home_team_id: int = Field(alias="HomeTeamID")
    global_game_id: int = Field(alias="GlobalGameID")
    global_away_team_id: int = Field(alias="GlobalAwayTeamID")
    global_home_team_id: int = Field(alias="GlobalHomeTeamID")
    score_id: int = Field(alias="ScoreID")

    # Additional fields
    status: str = Field(alias="Status")
    home_rotation_number: Optional[int] = Field(
        default=None, alias="HomeRotationNumber"
    )
    away_rotation_number: Optional[int] = Field(
        default=None, alias="AwayRotationNumber"
    )
    referee_id: Optional[int] = Field(default=None, alias="RefereeID")
    home_timeouts: Optional[int] = Field(default=None, alias="HomeTimeouts")
    away_timeouts: Optional[int] = Field(default=None, alias="AwayTimeouts")
    attendance: Optional[int] = Field(default=None, alias="Attendance")

    # Stadium details (nested object - stored as JSON or separate table)
    stadium_details: Optional[StadiumDetails] = Field(
        default=None, alias="StadiumDetails"
    )
