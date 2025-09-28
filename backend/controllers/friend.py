from fastapi import APIRouter, Depends
from ..services.friend import FriendService
from ..models.usertofriend import UserToFriend
from ..models.user import User
from typing import List

openapi_tags = {
    "name": "Friends",
    "description": "Routes used for friend management",
}

api = APIRouter(prefix="", tags=["Friends"])

@api.get("/{username}/friends", response_model=List[User], tags=["Friends"])
async def get_friends(
    username: str, friend_svc: FriendService = Depends(FriendService)
):
    return friend_svc.get_friends(username)
