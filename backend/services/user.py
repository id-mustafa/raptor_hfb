from ..models.user import User
from ..db import db_session


class UserService:
    def __init__(self):
        self.db = db_session

    def get_user(self, user_id: int):
        return self.db.query(User).filter(User.id == user_id).first()
