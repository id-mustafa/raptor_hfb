from fastapi import APIRouter, Depends
from ..services.player import PlayerService
from ..models.player import Player
from typing import List

openapi_tags = {
    "name": "Players",
    "description": "Routes used for player management",
}

api = APIRouter(prefix="/player", tags=["Players"])

@api.get("/{game_id}", response_model=List[Player], tags=["Players"])
async def get_players(game_id: int, player_svc: PlayerService = Depends(PlayerService)):
    return player_svc.get_players(game_id)

@api.get("/{game_id}/{team}", response_model=List[Player], tags=["Players"])
async def get_players_by_team(game_id: int, team: str, player_svc: PlayerService = Depends(PlayerService)):
    return player_svc.get_players_by_team(game_id, team)

@api.get("/{game_id}/{team}/{player_name}", response_model=Player, tags=["Players"])
async def get_player_by_name(game_id: int, team: str, player_name: str, player_svc: PlayerService = Depends(PlayerService)):
    return player_svc.get_player_by_name(game_id, team, player_name)    

@api.get("/{player_id}", response_model=Player, tags=["Players"])
async def get_player_by_id(player_id: int, player_svc: PlayerService = Depends(PlayerService)):
    return player_svc.get_player_by_id(player_id)

@api.post("/", response_model=Player, tags=["Players"])
async def create_player(player: Player, player_svc: PlayerService = Depends(PlayerService)):
    return player_svc.create_player(player)

@api.put("/{player_id}", response_model=Player, tags=["Players"])
async def update_player(player_id: int, player: Player, player_svc: PlayerService = Depends(PlayerService)):
    return player_svc.update_player(player_id, player)

@api.delete("/{player_id}", response_model=bool, tags=["Players"])
async def delete_player(player_id: int, player_svc: PlayerService = Depends(PlayerService)):
    return player_svc.delete_player(player_id)