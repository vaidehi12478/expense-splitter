from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# -------- request models ---------
class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = None
    members: Optional[list[EmailStr]] = []
    createdBy: Optional[EmailStr] = None  # Will be set by router from current_user

class AddMembersPayload(BaseModel):
    member_emails: list[EmailStr]

# -------- response models ---------
class GroupBase(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    members: list[EmailStr] = []
    createdBy: EmailStr
    createdAt: datetime

    class Config:
        orm_mode = True    # important for return types