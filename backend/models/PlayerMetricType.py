from enum import Enum


class PlayerMetricType(str, Enum):
    passing_yards = "passing_yards"
    rushing_yards = "rushing_yards"
    receiving_yards = "receiving_yards"
    touchdowns = "touchdowns"
    interceptions = "interceptions"
    fumbles = "fumbles"
    sacks = "sacks"
    tackles = "tackles"
    tackles_for_loss = "tackles_for_loss"
    passes_completed = "passes_completed"
