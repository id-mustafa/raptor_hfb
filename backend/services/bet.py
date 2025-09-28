from ..db import db_session
from sqlmodel import Session, select
from fastapi import Depends, HTTPException
from ..models.bet import Bet
from ..models.user import User
from ..models.questionFR import QuestionFR
from datetime import datetime
from typing import List


class BetService:
    """Service for handling user bets"""

    def __init__(self, db: Session = Depends(db_session)):
        self.db = db

    def create_bet(
        self,
        username: str,
        question_id: int,
        user_answer: str,
        bet_amount: int,
    ) -> Bet:
        """Place a bet and deduct tokens from user"""

        # Validate question exists and betting is still open
        question = self.db.exec(
            select(QuestionFR).where(QuestionFR.id == question_id)
        ).first()

        if not question:
            raise HTTPException(404, "Question not found")

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

        if user.tokens < bet_amount:
            raise HTTPException(
                400,
                f"Insufficient tokens. You have {user.tokens}, need {bet_amount}",
            )

        # Create the bet
        bet = Bet(
            username=username,
            question_id=question_id,
            user_answer=user_answer,
            bet_amount=bet_amount,
        )

        user.tokens -= bet_amount

        # Save everything
        self.db.add(bet)
        self.db.commit()
        self.db.refresh(user)

        return bet

    def get_user_bets(self, identifier: str | int) -> List[Bet]:
        """Get all bets for a user"""
        if type(identifier) == str:
            return self.db.exec(select(Bet).where(Bet.username == identifier)).all()
        elif type(identifier) == int:
            return self.db.exec(select(Bet).where(Bet.id == identifier)).first()
        else:
            raise HTTPException(400, "Invalid identifier")

    def get_bets_by_question_id(self, question_id: int) -> List[Bet]:
        """Get all bets for a specific question"""
        return self.db.exec(select(Bet).where(Bet.question_id == question_id)).all()

    def get_bet_summary(self, username: str) -> dict:
        """Get the summary of a bet for a specific question"""
        total_wins = 0
        total_losses = 0
        bets = self.db.exec(select(Bet).where(Bet.username == username)).all()
        for b in bets:
            question = self.db.exec(
                select(QuestionFR).where(QuestionFR.id == b.question_id)
            ).first()
            if question.answer == b.user_answer:
                total_wins += b.bet_amount * 2
            else:
                total_losses += b.bet_amount

        return {
            "total_wins": total_wins,
            "total_losses": total_losses,
            "total_number_of_bets": len(bets),
            "total_amount_bet": total_wins + total_losses,
            "total_profit": total_wins - total_losses,
            "total_profit_percentage": (
                (
                    (total_wins - total_losses) / (total_wins + total_losses)
                    if total_wins + total_losses != 0
                    else 1
                )
                * 100
                if (total_wins + total_losses) != 0
                else 0
            ),
        }
