from fastapi import APIRouter
from ..services.user import UserService

api = APIRouter(prefix="/users", tags=["users"])

openapi_tags = {
    "name": "Users",
    "description": "Routes used for user management",
}


@api.get("/")
async def get_users():
    return UserService().get_users()


@api.get("/{user_id}")
async def get_user(user_id: int):
    return UserService().get_user(user_id)
