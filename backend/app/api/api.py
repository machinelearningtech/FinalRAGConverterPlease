from fastapi import APIRouter
from app.api.endpoints import auth, users, convert

api_router = APIRouter()
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(convert.router, prefix="/convert", tags=["convert"])
