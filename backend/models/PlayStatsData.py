from sqlmodel import Field, SQLModel
from typing import Optional
from datetime import datetime


class PlayStatsData(SQLModel, table=True):
    __tablename__ = "play_stats_data"

    # Primary fields
    play_stat_id: int = Field(primary_key=True, alias="PlayStatID")
    play_id: int = Field(alias="PlayID")
    sequence: int = Field(alias="Sequence")
    player_id: int = Field(alias="PlayerID")
    name: str = Field(alias="Name")
    team: str = Field(alias="Team")
    opponent: str = Field(alias="Opponent")
    home_or_away: str = Field(alias="HomeOrAway")
    direction: Optional[str] = Field(default=None, alias="Direction")
    updated: datetime = Field(alias="Updated")
    created: datetime = Field(alias="Created")

    # Passing stats
    passing_attempts: int = Field(default=0, alias="PassingAttempts")
    passing_completions: int = Field(default=0, alias="PassingCompletions")
    passing_yards: int = Field(default=0, alias="PassingYards")
    passing_touchdowns: int = Field(default=0, alias="PassingTouchdowns")
    passing_interceptions: int = Field(default=0, alias="PassingInterceptions")
    passing_sacks: int = Field(default=0, alias="PassingSacks")
    passing_sack_yards: int = Field(default=0, alias="PassingSackYards")

    # Rushing stats
    rushing_attempts: int = Field(default=0, alias="RushingAttempts")
    rushing_yards: int = Field(default=0, alias="RushingYards")
    rushing_touchdowns: int = Field(default=0, alias="RushingTouchdowns")

    # Receiving stats
    receiving_targets: int = Field(default=0, alias="ReceivingTargets")
    receptions: int = Field(default=0, alias="Receptions")
    receiving_yards: int = Field(default=0, alias="ReceivingYards")
    receiving_touchdowns: int = Field(default=0, alias="ReceivingTouchdowns")

    # Fumble stats
    fumbles: int = Field(default=0, alias="Fumbles")
    fumbles_lost: int = Field(default=0, alias="FumblesLost")

    # Two point conversion stats
    two_point_conversion_attempts: int = Field(
        default=0, alias="TwoPointConversionAttempts"
    )
    two_point_conversion_passes: int = Field(
        default=0, alias="TwoPointConversionPasses"
    )
    two_point_conversion_runs: int = Field(default=0, alias="TwoPointConversionRuns")
    two_point_conversion_receptions: int = Field(
        default=0, alias="TwoPointConversionReceptions"
    )
    two_point_conversion_returns: int = Field(
        default=0, alias="TwoPointConversionReturns"
    )

    # Defensive stats
    solo_tackles: int = Field(default=0, alias="SoloTackles")
    assisted_tackles: int = Field(default=0, alias="AssistedTackles")
    tackles_for_loss: int = Field(default=0, alias="TacklesForLoss")
    sacks: int = Field(default=0, alias="Sacks")
    sack_yards: int = Field(default=0, alias="SackYards")
    passes_defended: int = Field(default=0, alias="PassesDefended")
    safeties: int = Field(default=0, alias="Safeties")
    fumbles_forced: int = Field(default=0, alias="FumblesForced")
    fumbles_recovered: int = Field(default=0, alias="FumblesRecovered")
    fumble_return_yards: int = Field(default=0, alias="FumbleReturnYards")
    fumble_return_touchdowns: int = Field(default=0, alias="FumbleReturnTouchdowns")
    interceptions: int = Field(default=0, alias="Interceptions")
    interception_return_yards: int = Field(default=0, alias="InterceptionReturnYards")
    interception_return_touchdowns: int = Field(
        default=0, alias="InterceptionReturnTouchdowns"
    )

    # Return stats
    punt_returns: int = Field(default=0, alias="PuntReturns")
    punt_return_yards: int = Field(default=0, alias="PuntReturnYards")
    punt_return_touchdowns: int = Field(default=0, alias="PuntReturnTouchdowns")
    kick_returns: int = Field(default=0, alias="KickReturns")
    kick_return_yards: int = Field(default=0, alias="KickReturnYards")
    kick_return_touchdowns: int = Field(default=0, alias="KickReturnTouchdowns")

    # Blocked kick stats
    blocked_kicks: int = Field(default=0, alias="BlockedKicks")
    blocked_kick_returns: int = Field(default=0, alias="BlockedKickReturns")
    blocked_kick_return_yards: int = Field(default=0, alias="BlockedKickReturnYards")
    blocked_kick_return_touchdowns: int = Field(
        default=0, alias="BlockedKickReturnTouchdowns"
    )

    # Field goal return stats
    field_goal_returns: int = Field(default=0, alias="FieldGoalReturns")
    field_goal_return_yards: int = Field(default=0, alias="FieldGoalReturnYards")
    field_goal_return_touchdowns: int = Field(
        default=0, alias="FieldGoalReturnTouchdowns"
    )

    # Kicking stats
    kickoffs: int = Field(default=0, alias="Kickoffs")
    kickoff_yards: int = Field(default=0, alias="KickoffYards")
    kickoff_touchbacks: int = Field(default=0, alias="KickoffTouchbacks")
    punts: int = Field(default=0, alias="Punts")
    punt_yards: int = Field(default=0, alias="PuntYards")
    punt_touchbacks: int = Field(default=0, alias="PuntTouchbacks")
    punts_had_blocked: int = Field(default=0, alias="PuntsHadBlocked")
    field_goals_attempted: int = Field(default=0, alias="FieldGoalsAttempted")
    field_goals_made: int = Field(default=0, alias="FieldGoalsMade")
    field_goals_yards: int = Field(default=0, alias="FieldGoalsYards")
    field_goals_had_blocked: int = Field(default=0, alias="FieldGoalsHadBlocked")
    extra_points_attempted: int = Field(default=0, alias="ExtraPointsAttempted")
    extra_points_made: int = Field(default=0, alias="ExtraPointsMade")
    extra_points_had_blocked: int = Field(default=0, alias="ExtraPointsHadBlocked")

    # Penalty stats
    penalties: int = Field(default=0, alias="Penalties")
    penalty_yards: int = Field(default=0, alias="PenaltyYards")
