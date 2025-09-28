from fastapi import APIRouter, Depends
from ..services.friend import FriendService
from ..models.usertofriend import UserToFriend
from ..models.user import User
from typing import List
from ..services.request import RequestService
from ..models.request import Request
from fastapi import HTTPException

openapi_tags = {
    "name": "Users",
    "description": "Routes used for user management",
}
api = APIRouter(prefix="", tags=openapi_tags)


@api.post("/{username1}/request/{username2}", response_model=Request, tags=openapi_tags)
async def send_request(
    username1: str,
    username2: str,
    request_svc: RequestService = Depends(RequestService),
):
    result = request_svc.send_request(username1, username2)
    if result is None:
        raise HTTPException(
            status_code=404, detail="Request not found or could not be created"
        )
    return result


@api.get("/{username}/request", response_model=List[User], tags=openapi_tags)
async def get_requests(
    username: str,
    request_svc: RequestService = Depends(RequestService),
):
    return request_svc.get_requests(username)


@api.post("/{username2}/accept/{username1}", response_model=Request, tags=openapi_tags)
async def accept_request(
    username1: str,
    username2: str,
    request_svc: RequestService = Depends(RequestService),
):
    return request_svc.accept_request(username1, username2)


@api.post("/{username2}/decline/{username1}", response_model=Request, tags=openapi_tags)
async def decline_request(
    username1: str,
    username2: str,
    request_svc: RequestService = Depends(RequestService),
):
    return request_svc.decline_request(username1, username2)
