from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.services.settlement_service import (
    settle_group_expenses,
    record_settlements,
    get_group_settlements
)
from app.models.settlement import SettlementBase, SettlementList

from app.deps.current_user import get_current_user
from app.models.user import UserBase

router = APIRouter(
    prefix="/settlements",
    tags=["Settlements"]
)

# ----------------- ROUTES -----------------

@router.post("/settle/{group_id}", response_model=List[SettlementBase])
def settle_expenses(
    group_id: str,
    current_user: UserBase = Depends(get_current_user)
):
    """
    Calculate and record settlements for a group.
    """
    settlements = settle_group_expenses(group_id)
    if not settlements:
        raise HTTPException(status_code=404, detail="No expenses found to settle.")

    recorded = record_settlements(settlements)
    return recorded


@router.post("/calculate/{group_id}")
def calculate_settlements(
    group_id: str,
    current_user: UserBase = Depends(get_current_user)
):
    """
    Preview the settlement result before recording in DB.
    """
    settlements = settle_group_expenses(group_id)
    if not settlements:
        raise HTTPException(status_code=404, detail="No settlements found.")
    return settlements


@router.get("/{group_id}", response_model=List[SettlementBase])
def get_group_settlement_records(
    group_id: str,
    current_user: UserBase = Depends(get_current_user)
):
    """
    Get all settlement transactions for a specific group.
    """
    settlements = get_group_settlements(group_id)
    return settlements
