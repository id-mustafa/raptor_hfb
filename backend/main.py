"""Entry of the backend for the Raptor HFB. Sets up FastAPI and exception handlers"""

import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from .db import engine

# from .services.exceptions import (
#     InvalidCredentialsException,
#     ResourceNotFoundException,
#     ResourceNotAllowedException,
# )

from .controllers import (
    user,
    friend,
    request,
    room,
    question,
    player,
    bet,
)

description = """
This RESTful API is designed to simulate High Frequency Betting in Real Time.
"""

app = FastAPI(
    title="Raptor HFB Backend API",
    version="1.0.0",
    description=description,
    openapi_tags=[
        user.openapi_tags,
        friend.openapi_tags,
        request.openapi_tags,
        room.openapi_tags,
        question.openapi_tags,
        player.openapi_tags,
        bet.openapi_tags,
    ],
)


# Configure CORS for production and development
allowed_origins = [
    "http://localhost:4400",  # Local development
    "http://localhost:4401",  # Local frontend
]

# Add production origins from environment variable
if os.getenv("ALLOWED_ORIGINS"):
    production_origins = os.getenv("ALLOWED_ORIGINS").split(",")
    allowed_origins.extend([origin.strip() for origin in production_origins])

app.add_middleware(GZipMiddleware)
app.add_middleware(
    CORSMiddleware,
    # allow_origins=[
    #     "http://localhost:4400",
    #     "http://localhost:4401",
    #     "http://localhost:8081",
    #     "http://localhost:19006",
    #     "http://127.0.0.1:4400",
    #     "http://127.0.0.1:4401",
    # ],
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ! Plug in each separate API file here (make sure to import above)
# feature_apis = [team, auth, question, docs, submission, session_obj, problem, scores]
feature_apis = [user, friend, request, room, question, player, bet]
for feature_api in feature_apis:
    app.include_router(feature_api.api, prefix="/api")


# TODO: Add Custom HTTP response exception handlers here for any custom Exceptions we create
# @app.exception_handler(ResourceNotFoundException)
# def resource_not_found_exception_handler(
#     request: Request, e: ResourceNotFoundException
# ):
#     return JSONResponse(status_code=404, content={"message": str(e)})


# @app.exception_handler(InvalidCredentialsException)
# def invalid_credentials_exception_handler(
#     request: Request, e: InvalidCredentialsException
# ):
#     return JSONResponse(
#         status_code=401,
#         content={"message": str(e)},
#     )


# @app.exception_handler(ResourceNotAllowedException)
# def resource_not_allowed_exception_handler(
#     request: Request, e: ResourceNotAllowedException
# ):
#     return JSONResponse(status_code=403, content={"message": str(e)})
