from fastapi import APIRouter, Depends
from ..services.friend import FriendService
from ..models.usertofriend import UserToFriend
from ..models.user import User
from typing import List

api = APIRouter(prefix="", tags=["friend"])

openapi_tags = {
    "name": "Users",
    "description": "Routes used for user management",
}


@api.get("/{username}/friends", response_model=List[User], tags=["friend"])
async def get_friends(
    username: str, friend_svc: FriendService = Depends(FriendService)
):
    return friend_svc.get_friends(username)
