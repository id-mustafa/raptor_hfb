from fastapi import APIRouter
from ..services.user import UserService
from ..models.user import User
from fastapi import Depends
from typing import List

openapi_tags = {
    "name": "Users",
    "description": "Routes used for user management",
}

api = APIRouter(prefix="/user", tags=["Users"])


@api.get("/{username}", response_model=User, tags=["Users"])
async def get_user(username: str, user_svc: UserService = Depends(UserService)):
    return user_svc.get_user(username)


@api.post("/{username}", response_model=User, tags=["Users"])
async def create_user(username: str, user_svc: UserService = Depends(UserService)):
    return user_svc.create_user(username)


@api.get("/", response_model=List[User], tags=["Users"])
async def get_all_users(user_svc: UserService = Depends(UserService)):
    return user_svc.get_all_users()


@api.put("/{username}/tokens/{tokens}", response_model=User, tags=["Users"])
async def update_user_tokens(
    username: str, tokens: int, user_svc: UserService = Depends(UserService)
):
    return user_svc.update_user_tokens(username, tokens)
