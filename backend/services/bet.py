from ..db import db_session
from sqlmodel import Session, select
from fastapi import Depends, HTTPException
from ..models.bet import Bet
from ..models.user import User
from ..models.question import Question
from ..models.QuestionResolution import QuestionResolution
from datetime import datetime
from typing import List


class BetService:
    """Service for handling user bets"""

    def __init__(self, db: Session = Depends(db_session)):
        self.db = db

    def place_bet(
        self,
        username: str,
        question_id: int,
        user_answer: QuestionResolution,
        bet_amount: int,
    ) -> Bet:
        """Place a bet and deduct tokens from user"""

        # Validate question exists and betting is still open
        question = self.db.exec(
            select(Question).where(Question.id == question_id)
        ).first()

        if not question:
            raise HTTPException(404, "Question not found")

        if question.is_resolved:
            raise HTTPException(400, "Question already resolved")

        if question.betting_deadline and question.betting_deadline <= datetime.now():
            raise HTTPException(400, "Betting deadline has passed")

        # Check if user already has a bet on this question
        existing_bet = self.db.exec(
            select(Bet).where(Bet.username == username, Bet.question_id == question_id)
        ).first()

        if existing_bet:
            raise HTTPException(400, "User already has a bet on this question")

        # Get user and check if they have enough tokens
        user = self.db.exec(select(User).where(User.username == username)).first()
        if not user:
            raise HTTPException(404, "User not found")

        if user.balance < bet_amount:
            raise HTTPException(
                400,
                f"Insufficient tokens. You have {user.balance}, need {bet_amount}",
            )

        # Create the bet
        bet = Bet(
            username=username,
            question_id=question_id,
            user_answer=user_answer,
            bet_amount=bet_amount,
        )

        # Save everything
        self.db.add(bet)
        self.db.commit()
        self.db.refresh(bet)

        return bet

    def get_user_bets(self, username: str) -> List[Bet]:
        """Get all bets for a user"""
        return self.db.exec(select(Bet).where(Bet.username == username)).all()

    def get_user_active_bets(self, username: str) -> List[Bet]:
        """Get unresolved bets for a user"""
        return self.db.exec(
            select(Bet).where(Bet.username == username, Bet.is_correct.is_(None))
        ).all()

    def get_bets_for_question(self, question_id: int) -> List[Bet]:
        """Get all bets for a specific question"""
        return self.db.exec(select(Bet).where(Bet.question_id == question_id)).all()

    def get_bet_summary(self, username: str) -> dict:
        """Get the summary of a bet for a specific question"""
        total_wins = 0
        total_losses = 0
        bets = self.db.exec(
            select(Bet).where(Bet.username == username and Bet.is_correct is not None)
        ).all()

        for b in bets:
            if b.is_correct:
                total_wins += b.bet_amount
            else:
                total_losses += b.bet_amount

        return {
            "total_wins": total_wins,
            "total_losses": total_losses,
            "total_number_of_bets": len(bets),
            "total_amount_bet": total_wins + total_losses,
            "total_profit": total_wins - total_losses,
            "total_profit_percentage": (
                (total_wins - total_losses) / total_wins + total_losses
            )
            * 100,
        }
