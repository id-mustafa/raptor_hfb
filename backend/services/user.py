from ..models.user import User
from ..db import db_session
from sqlmodel import Session, select
from fastapi import Depends, HTTPException
from ..models.room import Room


class UserService:
    """Service for user operations"""

    def __init__(self, db: Session = Depends(db_session)):
        self.db = db

    def get_user(self, username: str):
        user = self.db.exec(select(User).where(User.username == username)).first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return user

    def create_user(self, username: str):
        self.db.add(User(username=username, room_id=None))
        self.db.commit()
        return User(username=username, room_id=None)

    def get_all_users(self):
        return self.db.exec(select(User)).all()

    def update_user_room(self, username: str, room_id: int):
        user = self.db.exec(select(User).where(User.username == username)).first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        user.room_id = room_id
        room = self.db.exec(select(Room).where(Room.id == room_id)).first()
        if room is None:
            raise HTTPException(status_code=404, detail="Room not found")
        room.players.append(user)
        self.db.add(room)
        self.db.commit()
        return user

    def update_user_tokens(self, username: str, tokens: int):
        user = self.db.exec(select(User).where(User.username == username)).first()
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        user.tokens = tokens
        self.db.commit()
        return user
