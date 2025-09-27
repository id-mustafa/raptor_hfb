from ..models.user import User
from ..db import db_session
from sqlmodel import Session, select
from fastapi import Depends, HTTPException
from ..models.room import Room

class RoomService:
    """Service for user operations"""

    def __init__(self, db: Session = Depends(db_session)):
        self.db = db

    def get_rooms(self):
        return self.db.exec(select(Room)).all()

    def create_room(self, game_id: int):
        room =Room(game_id=game_id)
        self.db.add(room)
        self.db.commit()
        return room
