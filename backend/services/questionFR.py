from ..models.user import User
from ..db import db_session
from sqlmodel import Session, select
from fastapi import Depends, HTTPException
from ..models.questionFR import QuestionFR
from time import sleep
from asyncio import sleep
import asyncio

import json
import asyncio
import openai

time_for_ques = 10

# Your play-by-play JSON
play_by_play = [
  {
    "timestamp": "12:00",
    "play": "Kristaps Porzingis vs. Anthony Davis (LeBron James gains possession)",
    "lakersPoints": 0,
    "celticsPoints": 0,
    "mainPlayer": "Kristaps Porzingis"
  },
  {
    "timestamp": "11:45",
    "play": "Austin Reaves misses 25-foot three point jumper",
    "lakersPoints": 0,
    "celticsPoints": 0,
    "mainPlayer": "Austin Reaves"
  },
  {
    "timestamp": "11:42",
    "play": "Jayson Tatum defensive rebound",
    "lakersPoints": 0,
    "celticsPoints": 0,
    "mainPlayer": "Jayson Tatum"
  },
  {
    "timestamp": "11:34",
    "play": "Jrue Holiday misses 22-foot three point jumper",
    "lakersPoints": 0,
    "celticsPoints": 0,
    "mainPlayer": "Jrue Holiday"
  },
  {
    "timestamp": "11:30",
    "play": "Rui Hachimura defensive rebound",
    "lakersPoints": 0,
    "celticsPoints": 0,
    "mainPlayer": "Rui Hachimura"
  },
  {
    "timestamp": "11:17",
    "play": "Max Christie makes 22-foot three point jumper (LeBron James assists)",
    "lakersPoints": 3,
    "celticsPoints": 0,
    "mainPlayer": "Max Christie"
  },
  {
    "timestamp": "11:02",
    "play": "Kristaps Porzingis makes 25-foot three point jumper (Jayson Tatum assists)",
    "lakersPoints": 3,
    "celticsPoints": 3,
    "mainPlayer": "Kristaps Porzingis"
  },
  {
    "timestamp": "10:48",
    "play": "LeBron James misses 6-foot two point shot",
    "lakersPoints": 3,
    "celticsPoints": 3,
    "mainPlayer": "LeBron James"
  },
  {
    "timestamp": "10:46",
    "play": "LeBron James offensive rebound",
    "lakersPoints": 3,
    "celticsPoints": 3,
    "mainPlayer": "LeBron James"
  },
  {
    "timestamp": "10:46",
    "play": "LeBron James misses two point shot",
    "lakersPoints": 3,
    "celticsPoints": 3,
    "mainPlayer": "LeBron James"
  },
  {
    "timestamp": "10:45",
    "play": "LeBron James offensive rebound",
    "lakersPoints": 3,
    "celticsPoints": 3,
    "mainPlayer": "LeBron James"
  },
  {
    "timestamp": "10:42",
    "play": "LeBron James makes two point shot",
    "lakersPoints": 5,
    "celticsPoints": 3,
    "mainPlayer": "LeBron James"
  },
  {
    "timestamp": "10:36",
    "play": "Jaylen Brown misses 27-foot three point step back jumpshot",
    "lakersPoints": 5,
    "celticsPoints": 3,
    "mainPlayer": "Jaylen Brown"
  },
  {
    "timestamp": "10:33",
    "play": "Max Christie defensive rebound",
    "lakersPoints": 5,
    "celticsPoints": 3,
    "mainPlayer": "Max Christie"
  },
  {
    "timestamp": "10:16",
    "play": "Rui Hachimura misses driving layup",
    "lakersPoints": 5,
    "celticsPoints": 3,
    "mainPlayer": "Rui Hachimura"
  },
  {
    "timestamp": "10:15",
    "play": "Rui Hachimura offensive rebound",
    "lakersPoints": 5,
    "celticsPoints": 3,
    "mainPlayer": "Rui Hachimura"
  },
  {
    "timestamp": "10:15",
    "play": "Rui Hachimura misses tip shot",
    "lakersPoints": 5,
    "celticsPoints": 3,
    "mainPlayer": "Rui Hachimura"
  },
  {
    "timestamp": "10:15",
    "play": "Celtics defensive team rebound",
    "lakersPoints": 5,
    "celticsPoints": 3,
    "mainPlayer": "Celtics"
  },
  {
    "timestamp": "9:56",
    "play": "Jrue Holiday misses 6-foot two point shot",
    "lakersPoints": 5,
    "celticsPoints": 3,
    "mainPlayer": "Jrue Holiday"
  },
  {
    "timestamp": "9:54",
    "play": "Anthony Davis defensive rebound",
    "lakersPoints": 5,
    "celticsPoints": 3,
    "mainPlayer": "Anthony Davis"
  },
  {
    "timestamp": "9:47",
    "play": "Max Christie misses 22-foot three point jumper",
    "lakersPoints": 5,
    "celticsPoints": 3,
    "mainPlayer": "Max Christie"
  },
  {
    "timestamp": "9:44",
    "play": "Kristaps Porzingis defensive rebound",
    "lakersPoints": 5,
    "celticsPoints": 3,
    "mainPlayer": "Kristaps Porzingis"
  },
  {
    "timestamp": "9:32",
    "play": "Jayson Tatum misses 15-foot step back jumpshot",
    "lakersPoints": 5,
    "celticsPoints": 3,
    "mainPlayer": "Jayson Tatum"
  },
  {
    "timestamp": "9:29",
    "play": "Austin Reaves defensive rebound",
    "lakersPoints": 5,
    "celticsPoints": 3,
    "mainPlayer": "Austin Reaves"
  },
  {
    "timestamp": "9:24",
    "play": "Anthony Davis makes 2-foot alley oop dunk shot (Austin Reaves assists)",
    "lakersPoints": 7,
    "celticsPoints": 3,
    "mainPlayer": "Anthony Davis"
  },
  {
    "timestamp": "9:04",
    "play": "Jaylen Brown makes 30-foot three point jumper (Jayson Tatum assists)",
    "lakersPoints": 7,
    "celticsPoints": 6,
    "mainPlayer": "Jaylen Brown"
  },
  {
    "timestamp": "8:53",
    "play": "Austin Reaves makes 25-foot three pointer",
    "lakersPoints": 10,
    "celticsPoints": 6,
    "mainPlayer": "Austin Reaves"
  },
  {
    "timestamp": "8:45",
    "play": "Jaylen Brown makes 28-foot three pointer",
    "lakersPoints": 10,
    "celticsPoints": 9,
    "mainPlayer": "Jaylen Brown"
  },
  {
    "timestamp": "8:29",
    "play": "Anthony Davis makes 10-foot jumper",
    "lakersPoints": 12,
    "celticsPoints": 9,
    "mainPlayer": "Anthony Davis"
  },
  {
    "timestamp": "8:20",
    "play": "Anthony Davis blocks Jaylen Brown 's 3-foot driving dunk",
    "lakersPoints": 12,
    "celticsPoints": 9,
    "mainPlayer": "Anthony Davis"
  },
  {
    "timestamp": "8:18",
    "play": "Derrick White offensive rebound",
    "lakersPoints": 12,
    "celticsPoints": 9,
    "mainPlayer": "Derrick White"
  },
  {
    "timestamp": "8:18",
    "play": "Derrick White misses two point shot",
    "lakersPoints": 12,
    "celticsPoints": 9,
    "mainPlayer": "Derrick White"
  },
  {
    "timestamp": "8:16",
    "play": "Anthony Davis defensive rebound",
    "lakersPoints": 12,
    "celticsPoints": 9,
    "mainPlayer": "Anthony Davis"
  },
  {
    "timestamp": "8:08",
    "play": "Max Christie makes 23-foot three point shot (Austin Reaves assists)",
    "lakersPoints": 15,
    "celticsPoints": 9,
    "mainPlayer": "Max Christie"
  },
  {
    "timestamp": "7:49",
    "play": "Kristaps Porzingis makes 7-foot two point shot (Derrick White assists)",
    "lakersPoints": 15,
    "celticsPoints": 11,
    "mainPlayer": "Kristaps Porzingis"
  },
  {
    "timestamp": "7:26",
    "play": "LeBron James misses 20-foot jumper",
    "lakersPoints": 15,
    "celticsPoints": 11,
    "mainPlayer": "LeBron James"
  },
  {
    "timestamp": "7:24",
    "play": "Jayson Tatum defensive rebound",
    "lakersPoints": 15,
    "celticsPoints": 11,
    "mainPlayer": "Jayson Tatum"
  },
  {
    "timestamp": "7:10",
    "play": "Jrue Holiday bad pass (Rui Hachimura steals)",
    "lakersPoints": 15,
    "celticsPoints": 11,
    "mainPlayer": "Jrue Holiday"
  },
  {
    "timestamp": "7:05",
    "play": "LeBron James bad pass (Jaylen Brown steals)",
    "lakersPoints": 15,
    "celticsPoints": 11,
    "mainPlayer": "LeBron James"
  },
  {
    "timestamp": "7:00",
    "play": "Kristaps Porzingis misses two point shot",
    "lakersPoints": 15,
    "celticsPoints": 11,
    "mainPlayer": "Kristaps Porzingis"
  },
  {
    "timestamp": "6:58",
    "play": "Anthony Davis defensive rebound",
    "lakersPoints": 15,
    "celticsPoints": 11,
    "mainPlayer": "Anthony Davis"
  },
  {
    "timestamp": "6:51",
    "play": "Max Christie lost ball turnover (Jrue Holiday steals)",
    "lakersPoints": 15,
    "celticsPoints": 11,
    "mainPlayer": "Max Christie"
  },
  {
    "timestamp": "6:46",
    "play": "Kristaps Porzingis makes dunk (Jaylen Brown assists)",
    "lakersPoints": 15,
    "celticsPoints": 13,
    "mainPlayer": "Kristaps Porzingis"
  },
  {
    "timestamp": "6:28",
    "play": "LeBron James out of bounds bad pass turnover",
    "lakersPoints": 15,
    "celticsPoints": 13,
    "mainPlayer": "LeBron James"
  },
  {
    "timestamp": "6:28",
    "play": "Lakers Full timeout",
    "lakersPoints": 15,
    "celticsPoints": 13,
    "mainPlayer": "Lakers"
  },
  {
    "timestamp": "6:28",
    "play": "Gabe Vincent enters the game for LeBron James",
    "lakersPoints": 15,
    "celticsPoints": 13,
    "mainPlayer": "Gabe Vincent"
  },
  {
    "timestamp": "6:28",
    "play": "Al Horford enters the game for Jayson Tatum",
    "lakersPoints": 15,
    "celticsPoints": 13,
    "mainPlayer": "Al Horford"
  },
  {
    "timestamp": "6:13",
    "play": "Derrick White makes 28-foot three point jumper (Kristaps Porzingis assists)",
    "lakersPoints": 15,
    "celticsPoints": 16,
    "mainPlayer": "Derrick White"
  },
  {
    "timestamp": "5:54",
    "play": "Jrue Holiday shooting foul",
    "lakersPoints": 15,
    "celticsPoints": 16,
    "mainPlayer": "Jrue Holiday"
  },
  {
    "timestamp": "5:54",
    "play": "Austin Reaves makes free throw 1 of 2",
    "lakersPoints": 16,
    "celticsPoints": 16,
    "mainPlayer": "Austin Reaves"
  },
  {
    "timestamp": "5:54",
    "play": "Austin Reaves makes free throw 2 of 2",
    "lakersPoints": 17,
    "celticsPoints": 16,
    "mainPlayer": "Austin Reaves"
  },
  {
    "timestamp": "5:40",
    "play": "Kristaps Porzingis makes 9-foot hook shot (Derrick White assists)",
    "lakersPoints": 17,
    "celticsPoints": 18,
    "mainPlayer": "Kristaps Porzingis"
  },
  {
    "timestamp": "5:27",
    "play": "Anthony Davis makes driving floating jump shot (Austin Reaves assists)",
    "lakersPoints": 19,
    "celticsPoints": 18,
    "mainPlayer": "Anthony Davis"
  },
  {
    "timestamp": "5:15",
    "play": "Al Horford misses 24-foot three point jumper",
    "lakersPoints": 19,
    "celticsPoints": 18,
    "mainPlayer": "Al Horford"
  },
  {
    "timestamp": "5:11",
    "play": "Rui Hachimura defensive rebound",
    "lakersPoints": 19,
    "celticsPoints": 18,
    "mainPlayer": "Rui Hachimura"
  },
  {
    "timestamp": "5:10",
    "play": "Anthony Davis makes two point shot (Rui Hachimura assists)",
    "lakersPoints": 21,
    "celticsPoints": 18,
    "mainPlayer": "Anthony Davis"
  },
  {
    "timestamp": "5:10",
    "play": "Al Horford shooting foul",
    "lakersPoints": 21,
    "celticsPoints": 18,
    "mainPlayer": "Al Horford"
  },
  {
    "timestamp": "5:10",
    "play": "Anthony Davis makes free throw 1 of 1",
    "lakersPoints": 22,
    "celticsPoints": 18,
    "mainPlayer": "Anthony Davis"
  },
  {
    "timestamp": "4:52",
    "play": "Kristaps Porzingis makes 20-foot jumper (Al Horford assists)",
    "lakersPoints": 22,
    "celticsPoints": 20,
    "mainPlayer": "Kristaps Porzingis"
  },
  {
    "timestamp": "4:42",
    "play": "Max Christie misses 25-foot three point jumper",
    "lakersPoints": 22,
    "celticsPoints": 20,
    "mainPlayer": "Max Christie"
  },
  {
    "timestamp": "4:39",
    "play": "Jaylen Brown defensive rebound",
    "lakersPoints": 22,
    "celticsPoints": 20,
    "mainPlayer": "Jaylen Brown"
  },
  {
    "timestamp": "4:21",
    "play": "Kristaps Porzingis misses 12-foot jumper",
    "lakersPoints": 22,
    "celticsPoints": 20,
    "mainPlayer": "Kristaps Porzingis"
  },
  {
    "timestamp": "4:19",
    "play": "Max Christie defensive rebound",
    "lakersPoints": 22,
    "celticsPoints": 20,
    "mainPlayer": "Max Christie"
  },
  {
    "timestamp": "4:03",
    "play": "Austin Reaves makes 28-foot three point jumper (Gabe Vincent assists)",
    "lakersPoints": 25,
    "celticsPoints": 20,
    "mainPlayer": "Austin Reaves"
  },
  {
    "timestamp": "3:38",
    "play": "Jaylen Brown makes two point shot (Jrue Holiday assists)",
    "lakersPoints": 25,
    "celticsPoints": 22,
    "mainPlayer": "Jaylen Brown"
  },
  {
    "timestamp": "3:29",
    "play": "Anthony Davis misses 26-foot three point jumper",
    "lakersPoints": 25,
    "celticsPoints": 22,
    "mainPlayer": "Anthony Davis"
  },
  {
    "timestamp": "3:26",
    "play": "Kristaps Porzingis defensive rebound",
    "lakersPoints": 25,
    "celticsPoints": 22,
    "mainPlayer": "Kristaps Porzingis"
  },
  {
    "timestamp": "3:11",
    "play": "Anthony Davis blocks Kristaps Porzingis 's 2-foot driving layup",
    "lakersPoints": 25,
    "celticsPoints": 22,
    "mainPlayer": "Anthony Davis"
  },
  {
    "timestamp": "3:11",
    "play": "Lakers defensive team rebound",
    "lakersPoints": 25,
    "celticsPoints": 22,
    "mainPlayer": "Lakers"
  },
  {
    "timestamp": "3:11",
    "play": "Dorian Finney-Smith enters the game for Austin Reaves",
    "lakersPoints": 25,
    "celticsPoints": 22,
    "mainPlayer": "Dorian Finney-Smith"
  },
  {
    "timestamp": "3:11",
    "play": "Jaxson Hayes enters the game for Rui Hachimura",
    "lakersPoints": 25,
    "celticsPoints": 22,
    "mainPlayer": "Jaxson Hayes"
  },
  {
    "timestamp": "3:11",
    "play": "Sam Hauser enters the game for Jrue Holiday",
    "lakersPoints": 25,
    "celticsPoints": 22,
    "mainPlayer": "Sam Hauser"
  },
  {
    "timestamp": "3:11",
    "play": "Lakers Full timeout",
    "lakersPoints": 25,
    "celticsPoints": 22,
    "mainPlayer": "Lakers"
  },
  {
    "timestamp": "3:11",
    "play": "(03:11) [Lakers] COACH'S CHALLENGE (CALL OVERTURNED) [Lakers] retain their timeout",
    "lakersPoints": 25,
    "celticsPoints": 22,
    "mainPlayer": "Lakers"
  },
  {
    "timestamp": "3:11",
    "play": "Jayson Tatum enters the game for Jaylen Brown",
    "lakersPoints": 25,
    "celticsPoints": 22,
    "mainPlayer": "Jayson Tatum"
  },
  {
    "timestamp": "3:11",
    "play": "Payton Pritchard enters the game for Derrick White",
    "lakersPoints": 25,
    "celticsPoints": 22,
    "mainPlayer": "Payton Pritchard"
  },
  {
    "timestamp": "2:58",
    "play": "Gabe Vincent makes 25-foot three point jumper (Anthony Davis assists)",
    "lakersPoints": 28,
    "celticsPoints": 22,
    "mainPlayer": "Gabe Vincent"
  },
  {
    "timestamp": "2:41",
    "play": "Jayson Tatum bad pass (Dorian Finney-Smith steals)",
    "lakersPoints": 28,
    "celticsPoints": 22,
    "mainPlayer": "Jayson Tatum"
  },
  {
    "timestamp": "2:38",
    "play": "LeBron James enters the game for Max Christie",
    "lakersPoints": 28,
    "celticsPoints": 22,
    "mainPlayer": "LeBron James"
  },
  {
    "timestamp": "2:38",
    "play": "Luke Kornet enters the game for Kristaps Porzingis",
    "lakersPoints": 28,
    "celticsPoints": 22,
    "mainPlayer": "Luke Kornet"
  },
  {
    "timestamp": "2:30",
    "play": "Anthony Davis misses 4-foot hook shot",
    "lakersPoints": 28,
    "celticsPoints": 22,
    "mainPlayer": "Anthony Davis"
  },
  {
    "timestamp": "2:27",
    "play": "Al Horford defensive rebound",
    "lakersPoints": 28,
    "celticsPoints": 22,
    "mainPlayer": "Al Horford"
  },
  {
    "timestamp": "2:21",
    "play": "Sam Hauser misses 25-foot three point shot",
    "lakersPoints": 28,
    "celticsPoints": 22,
    "mainPlayer": "Sam Hauser"
  },
  {
    "timestamp": "2:19",
    "play": "Anthony Davis defensive rebound",
    "lakersPoints": 28,
    "celticsPoints": 22,
    "mainPlayer": "Anthony Davis"
  },
  {
    "timestamp": "2:14",
    "play": "LeBron James makes two point shot",
    "lakersPoints": 30,
    "celticsPoints": 22,
    "mainPlayer": "LeBron James"
  },
  {
    "timestamp": "1:54",
    "play": "Jayson Tatum misses 26-foot three point pullup jump shot",
    "lakersPoints": 30,
    "celticsPoints": 22,
    "mainPlayer": "Jayson Tatum"
  },
  {
    "timestamp": "1:51",
    "play": "LeBron James defensive rebound",
    "lakersPoints": 30,
    "celticsPoints": 22,
    "mainPlayer": "LeBron James"
  },
  {
    "timestamp": "1:40",
    "play": "LeBron James makes 6-foot two point shot",
    "lakersPoints": 32,
    "celticsPoints": 22,
    "mainPlayer": "LeBron James"
  },
  {
    "timestamp": "1:26",
    "play": "Payton Pritchard misses 27-foot three point step back jumpshot",
    "lakersPoints": 32,
    "celticsPoints": 22,
    "mainPlayer": "Payton Pritchard"
  },
  {
    "timestamp": "1:22",
    "play": "LeBron James defensive rebound",
    "lakersPoints": 32,
    "celticsPoints": 22,
    "mainPlayer": "LeBron James"
  },
  {
    "timestamp": "1:16",
    "play": "LeBron James misses 20-foot pullup jump shot",
    "lakersPoints": 32,
    "celticsPoints": 22,
    "mainPlayer": "LeBron James"
  },
  {
    "timestamp": "1:13",
    "play": "Sam Hauser defensive rebound",
    "lakersPoints": 32,
    "celticsPoints": 22,
    "mainPlayer": "Sam Hauser"
  },
  {
    "timestamp": "1:09",
    "play": "Dorian Finney-Smith shooting foul",
    "lakersPoints": 32,
    "celticsPoints": 22,
    "mainPlayer": "Dorian Finney-Smith"
  },
  {
    "timestamp": "1:09",
    "play": "Jayson Tatum makes free throw 1 of 2",
    "lakersPoints": 32,
    "celticsPoints": 23,
    "mainPlayer": "Jayson Tatum"
  },
  {
    "timestamp": "1:09",
    "play": "Austin Reaves enters the game for Anthony Davis",
    "lakersPoints": 32,
    "celticsPoints": 23,
    "mainPlayer": "Austin Reaves"
  },
  {
    "timestamp": "1:09",
    "play": "Jayson Tatum misses free throw 2 of 2",
    "lakersPoints": 32,
    "celticsPoints": 23,
    "mainPlayer": "Jayson Tatum"
  },
  {
    "timestamp": "1:06",
    "play": "Jaxson Hayes defensive rebound",
    "lakersPoints": 32,
    "celticsPoints": 23,
    "mainPlayer": "Jaxson Hayes"
  },
  {
    "timestamp": "49.0",
    "play": "Jaxson Hayes misses layup",
    "lakersPoints": 32,
    "celticsPoints": 23,
    "mainPlayer": "Jaxson Hayes"
  },
  {
    "timestamp": "49.0",
    "play": "Lakers offensive team rebound",
    "lakersPoints": 32,
    "celticsPoints": 23,
    "mainPlayer": "Lakers"
  },
  {
    "timestamp": "44.1",
    "play": "Austin Reaves misses 23-foot three point shot",
    "lakersPoints": 32,
    "celticsPoints": 23,
    "mainPlayer": "Austin Reaves"
  },
  {
    "timestamp": "44.1",
    "play": "Lakers offensive team rebound",
    "lakersPoints": 32,
    "celticsPoints": 23,
    "mainPlayer": "Lakers"
  },
  {
    "timestamp": "31.1",
    "play": "Jayson Tatum misses 26-foot three point pullup jump shot",
    "lakersPoints": 32,
    "celticsPoints": 23,
    "mainPlayer": "Jayson Tatum"
  },
  {
    "timestamp": "31.1",
    "play": "Gabe Vincent defensive rebound",
    "lakersPoints": 32,
    "celticsPoints": 23,
    "mainPlayer": "Gabe Vincent"
  },
  {
    "timestamp": "8.2",
    "play": "LeBron James makes 1-foot driving dunk",
    "lakersPoints": 34,
    "celticsPoints": 23,
    "mainPlayer": "LeBron James"
  },
  {
    "timestamp": "0.0",
    "play": "Payton Pritchard misses 15-foot step back jumpshot",
    "lakersPoints": 34,
    "celticsPoints": 23,
    "mainPlayer": "Payton Pritchard"
  },
  {
    "timestamp": "0.0",
    "play": "Celtics offensive team rebound",
    "lakersPoints": 34,
    "celticsPoints": 23,
    "mainPlayer": "Celtics"
  }
]

from typing import List, Dict

from typing import List, Dict
from sqlmodel import Session, select
from ..models.questionFR import QuestionFR
from ..db import db_session
import openai
import asyncio

def timestamp_to_seconds(timestamp) -> float:
    """Convert timestamp string or number to seconds for comparison."""
    if isinstance(timestamp, (int, float)):
        return float(timestamp)
    timestamp = str(timestamp)
    if ':' in timestamp:
        parts = timestamp.split(':')
        return int(parts[0]) * 60 + float(parts[1])
    return float(timestamp)

def get_next_plays(play_by_play: List[Dict], start_timestamp, n: int = 5) -> List[Dict]:
    """Return next n plays after start_timestamp (game clock counts down)."""
    start_seconds = timestamp_to_seconds(start_timestamp)
    start_index = None
    for i, play in enumerate(play_by_play):
        play_seconds = timestamp_to_seconds(play["timestamp"])
        if play_seconds <= start_seconds:  # because time decreases
            start_index = i
            break
    if start_index is None:
        return []
    return play_by_play[start_index + 1 : start_index + 1 + n]

class QuestionFRService:
    def __init__(self, db: Session = Depends(db_session)):
        self.db = db

    def get_questions(self, room_id: str):
        return self.db.exec(select(QuestionFR).where(QuestionFR.room_id == room_id)).all()

    async def generate_question(self, play_by_play: List[Dict]) -> dict:
        """Call OpenAI API to generate a betting-style question with 1-word options."""
        # Format play_by_play as readable string
        plays_text = "\n".join(
            [f"{p['timestamp']}: {p['play']} (Main: {p['mainPlayer']}, Score: Lakers {p['lakersPoints']}-{p['celticsPoints']})"
             for p in play_by_play]
        )

        prompt = f"""
            You are a sports quiz generator. Based on the following NBA play-by-play snippet, 
            create exactly 1 multiple-choice question suitable for a betting game. 
            The question should be in future tense, with 4 one-word options.
            Return JSON ONLY in this format:

            {{
            "question": "...",
            "options": ["Option1", "Option2", "Option3", "Option4"],
            "answer": 0  # correct option index
            }}

            Play-by-play:
            {plays_text}
            """

        response = openai.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )

        result_text = response.choices[0].message.content
        try:
            import json
            result_json = json.loads(result_text)
        except Exception:
            result_json = {
                "question": "Could not generate question",
                "options": ["A", "B", "C", "D"],
                "answer": 0
            }
        return result_json

    async def timer_start(self, room_id: int, start_time: str = "12:00"):
        """Start a timer that pushes questions into the DB every interval."""
        timer_seconds = timestamp_to_seconds(start_time)
        print("timer_seconds: ", timer_seconds)
        await asyncio.sleep(10)  # initial delay

        while timer_seconds > 600:
            # For example, generate question every 50 seconds of game time
            interval = 30
            curr_play_by_play = get_next_plays(play_by_play, start_timestamp=timer_seconds, n=20)
            if curr_play_by_play and timer_seconds%45 == 0:
                question_data = await self.generate_question(curr_play_by_play)

                # Get last ID
                statement = select(QuestionFR).order_by(QuestionFR.id.desc())
                last_row = self.db.exec(statement).first()
                last_id = last_row.id if last_row else 0

                self.db.add(QuestionFR(
                    id=last_id + 1,
                    question=question_data["question"],
                    options="_".join(question_data["options"]),
                    answer=question_data.get("answer", 0),
                    room_id=room_id
                ))
                self.db.commit()

            timer_seconds -= interval
            await asyncio.sleep(1)  # non-blocking sleep between intervals

        return "Timer finished"
