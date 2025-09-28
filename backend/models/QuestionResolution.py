from enum import Enum


class QuestionType(str, Enum):
    OVER_UNDER = "over_under"
    YES_NO = "yes_no"


class QuestionResolution(str, Enum):
    OVER = "over"
    UNDER = "under"
    YES = "yes"
    NO = "no"
    NEUTRAL = "neutral"
