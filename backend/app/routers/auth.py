# app/routers/auth.py

from fastapi import APIRouter, HTTPException, Depends
from app.models.user import UserSignup, UserLogin, UserBase
from app.services.auth_service import signup_user, login_user

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


@router.post("/signup", response_model=UserBase)
def signup(payload: UserSignup):
    user = signup_user(payload)
    if not user:
        raise HTTPException(status_code=400, detail="Email already exists")
    return user


@router.post("/login")
def login(payload: UserLogin):
    jwt_token = login_user(payload)
    if not jwt_token:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"access_token": jwt_token}
