from ..models.user import User
from ..db import db_session
from sqlmodel import Session, select
from fastapi import Depends, HTTPException


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
        self.db.commit()
        return user