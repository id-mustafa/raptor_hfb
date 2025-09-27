from ..db import db_session
from sqlmodel import Session, select
from fastapi import Depends, HTTPException
from ..models.usertofriend import UserToFriend
from ..models.user import User
from ..services.user import UserService
from ..models.request import Request


class RequestService:
    """Service for user operations"""

    def __init__(self, db: Session = Depends(db_session)):
        self.db = db

    def send_request(self, username1: str, username2: str):
        # Check if they are friends
        # if self.db.exec(select(UserToFriend).where(UserToFriend.username == username1 and UserToFriend.friend_username == username2)).first():
        #     raise HTTPException(status_code=400, detail="They are already friends")
        # Check if request already sent
        if self.db.exec(
            select(Request).where(
                Request.username1 == username1 and Request.username2 == username2
            )
        ).first():
            raise HTTPException(status_code=400, detail="Request already sent")
        req = Request(username1=username1, username2=username2)
        self.db.add(req)
        self.db.commit()
        self.db.refresh(req)
        return req

    def get_requests(self, username: str):
        # First, get the friend usernames
        request_stmt = select(Request.username1).where(Request.username2 == username)
        request_usernames = self.db.exec(request_stmt).all()

        # Then get the actual User objects
        if request_usernames:
            user_stmt = select(User).where(User.username.in_(request_usernames))
            return self.db.exec(user_stmt).all()

        return []

    def accept_request(self, username1: str, username2: str):
        stmt = select(Request).where(
            Request.username1 == username1, Request.username2 == username2
        )
        existing_request = self.db.exec(stmt).first()

        if existing_request is None:
            raise HTTPException(404, "Request not found")

        # Delete the found request
        self.db.delete(existing_request)

        friend1 = UserToFriend(username=username1, friend_username=username2)
        friend2 = UserToFriend(
            username=username2, friend_username=username1
        )  # Bidirectional

        self.db.add(friend1)
        self.db.add(friend2)

        self.db.commit()

    def decline_request(self, username1: str, username2: str):
        stmt = select(Request).where(
            Request.username1 == username1, Request.username2 == username2
        )
        existing_request = self.db.exec(stmt).first()

        if existing_request is None:
            raise HTTPException(404, "Request not found")

        # Delete the found request
        self.db.delete(existing_request)
        self.db.commit()
