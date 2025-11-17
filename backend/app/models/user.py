# app/models/user.py

from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# -------- request models ---------

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str   # plain password coming from client


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# -------- response models ---------

class UserBase(BaseModel):
    id: str
    name: str
    email: EmailStr
    createdAt: datetime

    class Config:
        orm_mode = True    # important for return types


class UserDetail(BaseModel):
    """Lightweight user detail model for group members"""
    name: str
    email: EmailStr

    class Config:
        orm_mode = True
