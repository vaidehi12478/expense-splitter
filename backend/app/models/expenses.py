from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import Optional, Dict

class ExpenseCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Amount must be greater than 0")
    description: Optional[str] = None
    paidBy: EmailStr
    groupId: str 
    category: str
    splitType: str = "equal"  # "equal", "unequal", or "percentage" (defaults to "equal")
    splits: Optional[Dict[str, float]] = None  
    # For "equal": null -> all members | {"user1@ex.com": 1, ...} -> only listed members
    # For "unequal": {"user1@ex.com": 60, "user2@ex.com": 40} -> exact amounts each owes
    # For "percentage": {"user1@ex.com": 60, "user2@ex.com": 40} -> percentages (should total 100)
    date: Optional[datetime] = Field(default_factory=datetime.utcnow)

class ExpenseUpdate(BaseModel):
    """Partial update model - all fields are optional"""
    amount: Optional[float] = Field(None, gt=0, description="Amount must be greater than 0 if provided")
    description: Optional[str] = None
    paidBy: Optional[EmailStr] = None
    groupId: Optional[str] = None
    category: Optional[str] = None
    splitType: Optional[str] = None
    splits: Optional[Dict[str, float]] = None
    date: Optional[datetime] = None

class ExpenseBase(BaseModel):
    id: str
    amount: float
    description: Optional[str] = None
    paidBy: EmailStr
    groupId: str 
    category: str
    splitType: str
    splits: Optional[Dict[str, float]] = None
    date: datetime
    createdAt: datetime

    class Config:
        from_attributes = True