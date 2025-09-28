from sys import int_info
from ..db import db_session
from sqlmodel import Session, select
from fastapi import Depends, HTTPException
from ..models.Player import Player
from ..models.question import Question
from ..models.bet import Bet
from ..models.user import User
from ..models.QuestionResolution import QuestionType
from ..models.PlayerMetricType import PlayerMetricType
from ..models.QuestionResolution import QuestionResolution
from ..models.game import Game
from datetime import datetime


class QuestionService:
    """Service for user operations"""

    def __init__(self, db: Session = Depends(db_session)):
        self.db = db

    def create_question(
        self,
        game_id: int,
        question_type: QuestionType,
        question: str,
        multiplier: float,
        player_id: int,
        metric_type: PlayerMetricType,
        metric_value: float,
        answer: QuestionResolution,
        betting_deadline: datetime,
    ):
        question = Question(
            game_id=game_id,
            question_type=question_type,
            question=question,
            multiplier=multiplier,
            player_id=player_id,
            metric_type=metric_type,
            metric_value=metric_value,
            answer=answer,
            betting_deadline=betting_deadline,
        )
        game = self.db.exec(select(Game).where(Game.id == game_id)).first()
        if not game:
            raise HTTPException(404, "Game not found")
        question.game = game
        player = self.db.exec(select(Player).where(Player.id == player_id)).first()
        if not player:
            raise HTTPException(404, "Player not found")
        question.player = player
        self.db.add(question)
        self.db.commit()
        self.db.refresh(question)
        return question

    def get_question(self, question_id: int):
        return self.db.exec(select(Question).where(Question.id == question_id)).first()

    def get_questions(self, game_id: int):
        return self.db.exec(select(Question).where(Question.game_id == game_id)).all()

    def update_question(self, question_id: int, question: Question):
        existing_question = self.db.exec(
            select(Question).where(Question.id == question_id)
        ).first()
        if existing_question is None:
            raise HTTPException(404, "Question not found")
        existing_question.question = question.question
        existing_question.multiplier = question.multiplier
        existing_question.answer = question.answer
        existing_question.betting_deadline = question.betting_deadline
        self.db.add(existing_question)
        self.db.commit()
        return existing_question

    def resolve_question(self, question_id: int, actual_value: float) -> Question:
        """Resolve a question with the actual result and all associated bets - USER THIS API"""
        question = self.get_question(question_id)
        if not question:
            raise HTTPException(404, "Question not found")

        if question.is_resolved:
            raise HTTPException(400, "Question already resolved")

        # Resolve the question first
        question.actual_value = actual_value
        answer = None
        if question.question_type == QuestionType.OVER_UNDER:
            if actual_value > question.metric_value:
                answer = QuestionResolution.OVER
            elif actual_value < question.metric_value:
                answer = QuestionResolution.UNDER
            else:
                answer = QuestionResolution.NEUTRAL
        else:
            if actual_value >= question.metric_value:
                answer = QuestionResolution.YES
            else:
                answer = QuestionResolution.NO

        question.answer = answer
        question.is_resolved = True
        question.updated_at = datetime.now()

        # Now resolve all bets on this question
        self._resolve_all_bets_for_question(question_id, answer)

        self.db.add(question)
        self.db.commit()
        self.db.refresh(question)
        return question

    def _resolve_all_bets_for_question(
        self, question_id: int, correct_answer: QuestionResolution
    ):
        """Resolve all bets for a specific question and update user tokens"""
        # Get all bets for this question that haven't been resolved yet
        bets = self.db.exec(
            select(Bet).where(Bet.question_id == question_id, Bet.is_correct.is_(None))
        ).all()

        if not bets:
            return  # No bets to resolve

        # Get the question to access multiplier
        question = self.get_question(question_id)
        if not question:
            raise HTTPException(404, "Question not found")

        # Process each bet
        for bet in bets:
            # Determine if the bet was correct
            bet.correct_answer = correct_answer
            bet.is_correct = bet.user_answer == correct_answer

            # Calculate outcome
            if bet.is_correct:
                # Winner gets their bet back + winnings
                payout = int(bet.bet_amount * question.multiplier)
                bet.outcome = payout
            else:
                bet.outcome = -(bet.bet_amount)
                # Update user balance
            user = self.db.exec(
                select(User).where(User.username == bet.username)
            ).first()
            if user:
                user.balance = int(user.balance + bet.outcome)
                self.db.add(user)
                self.db.add(bet)
            else:
                raise HTTPException(404, "User not found")

        # Commit all changes at once
        self.db.commit()
