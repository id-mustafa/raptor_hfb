from ..db import db_session
from sqlmodel import Session, select
from fastapi import Depends, HTTPException
from ..models.Player import Player

class PlayerService:
    def __init__(self, db: Session = Depends(db_session)):
        self.db = db

    def get_players(self, game_id: int):
        return self.db.exec(select(Player).where(Player.game_id == game_id)).all()
    
    def get_players_by_team(self, game_id: int, team: str):
        return self.db.exec(select(Player).where(Player.game_id == game_id, Player.team == team)).all()
    
    def get_player_by_name(self, game_id: int, team: str, player_name: str):
        return self.db.exec(select(Player).where(Player.game_id == game_id, Player.team == team, Player.name == player_name)).first()

    def get_player_by_id(self, player_id: int):
        return self.db.exec(select(Player).where(Player.id == player_id)).first()
    
    def create_player(self, player: Player):
        self.db.add(player)
        self.db.commit()
        return player
    
    def update_player(self, player_id: int, player: Player):
        db_player = self.db.exec(select(Player).where(Player.id == player_id)).first()
        if not db_player:
            raise HTTPException(404, "Player not found")
        db_player.name = player.name
        db_player.team = player.team
        self.db.commit()
        self.db.refresh(db_player)
        return db_player
    
    def delete_player(self, player_id: int):
        db_player = self.db.exec(select(Player).where(Player.id == player_id)).first()
        if not db_player:
            raise HTTPException(404, "Player not found")
        self.db.delete(db_player)
        self.db.commit()
        return True