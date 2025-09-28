from fastapi import APIRouter, Depends
from ..services.bet import BetService
from ..models.bet import Bet
from typing import List

openapi_tags = {
    "name": "Bets",
    "description": "Routes used for bet management",
}

api = APIRouter(prefix="/bet", tags=["Bets"])


@api.post("/", response_model=Bet, tags=["Bets"])
async def create_bet(bet: Bet, bet_svc: BetService = Depends(BetService)):
    return bet_svc.create_bet(
        bet.username, bet.question_id, bet.user_answer, bet.bet_amount
    )


@api.get("/bet/{bet_id}", response_model=Bet, tags=["Bets"])
async def get_bet_by_id(bet_id: int, bet_svc: BetService = Depends(BetService)):
    return bet_svc.get_user_bets(bet_id)


@api.get("/user/{username}", response_model=List[Bet], tags=["Bets"])
async def get_bets_by_username(
    username: str, bet_svc: BetService = Depends(BetService)
):
    return bet_svc.get_user_bets(username)


@api.get("/question/{question_id}", response_model=List[Bet], tags=["Bets"])
async def get_bets_by_question_id(
    question_id: int, bet_svc: BetService = Depends(BetService)
):
    return bet_svc.get_bets_by_question_id(question_id)


@api.get("/summary/{username}", response_model=dict, tags=["Bets"])
async def get_bet_summary(username: str, bet_svc: BetService = Depends(BetService)):
    return bet_svc.get_bet_summary(username)
