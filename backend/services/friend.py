from ..db import db_session
from sqlmodel import Session, select
from fastapi import Depends, HTTPException
from ..models.usertofriend import UserToFriend
from ..models.user import User
from ..services.user import UserService


class FriendService:
    """Service for user operations"""

    def __init__(self, db: Session = Depends(db_session)):
        self.db = db

    def get_friends(self, username: str):
        # First, get the friend usernames
        friend_stmt = select(UserToFriend.friend_username).where(
            UserToFriend.username == username
        )
        friend_usernames = self.db.exec(friend_stmt).all()

        # Then get the actual User objects
        if friend_usernames:
            user_stmt = select(User).where(User.username.in_(friend_usernames))
            return self.db.exec(user_stmt).all()

        return []

    def add_friend(self, username: str, friend_username: str):
        self.db.add(UserToFriend(username=username, friend_username=friend_username))
        self.db.commit()
