from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List


# -------- Request Models ---------
class SettlementCreate(BaseModel):
    amount: float
    paidBy: EmailStr
    paidTo: EmailStr
    groupId: str
    date: datetime = Field(default_factory=datetime.utcnow)


# -------- Response Models ---------
class SettlementBase(BaseModel):
    id: Optional[str] = None
    amount: float
    paidBy: EmailStr
    paidTo: EmailStr
    groupId: str
    date: datetime
    createdAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        orm_mode = True


class SettlementUpdate(BaseModel):
    amount: Optional[float] = None
    date: Optional[datetime] = None

    class Config:
        orm_mode = True


class SettlementDelete(BaseModel):
    id: str

    class Config:
        orm_mode = True


class SettlementList(BaseModel):
    settlements: List[SettlementBase]

    class Config:
        orm_mode = True


class SettlementSummary(BaseModel):
    userEmail: EmailStr
    totalPaid: float
    totalReceived: float
    netBalance: float

    class Config:
        orm_mode = True


class SettlementSummaryList(BaseModel):
    summaries: List[SettlementSummary]

    class Config:
        orm_mode = True
        
class SettlementBetweenUsers(BaseModel):
    fromUser: EmailStr
    toUser: EmailStr
    totalAmount: float

    class Config:
        orm_mode = True

