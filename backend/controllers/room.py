from fastapi import APIRouter, Depends
from ..services.friend import FriendService
from ..models.usertofriend import UserToFriend
from ..models.user import User
from typing import List
from ..services.request import RequestService
from ..models.request import Request
from fastapi import HTTPException
from ..models.room import Room
from ..services.room import RoomService
from ..services.user import UserService

openapi_tags = {
    "name": "Users",
    "description": "Routes used for user management",
}
api = APIRouter(prefix="/room", tags=openapi_tags)

@api.get("", response_model=List[Room], tags=openapi_tags)
async def get_rooms(room_svc: RoomService = Depends(RoomService)):
    return room_svc.get_rooms()

@api.post("/create", response_model=Room, tags=openapi_tags)
async def create_room(username: str, room_svc: RoomService = Depends(RoomService), user_svc: UserService = Depends(UserService)):
    room = room_svc.create_room(game_id=1)
    print(room.id)
    user_svc.update_user_room(username, room.id)
    return room

@api.post("/join/{room_id}", response_model=bool, tags=openapi_tags)
async def join_room(username: str, room_id: int, room_svc: RoomService = Depends(RoomService), user_svc: UserService = Depends(UserService)):
    user_svc.update_user_room(username, room_id)
    return True

@api.post("/leave/{username}", response_model=bool, tags=openapi_tags)
async def leave_room(username: str, room_svc: RoomService = Depends(RoomService), user_svc: UserService = Depends(UserService)):
    user = user_svc.get_user(username)
    if user.room_id == None:
        raise HTTPException(status_code=400, detail="User is not in this room")
    user_svc.update_user_room(username, None)
    return True
