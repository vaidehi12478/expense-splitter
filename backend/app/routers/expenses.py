from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.models.expenses import ExpenseCreate, ExpenseBase, ExpenseUpdate
from app.models.user import UserBase
from app.services import expense_service   # your file with the logic above
from app.deps.current_user import get_current_user

router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"]
)


@router.post("/", response_model=ExpenseBase)
def create_expense(
    payload: ExpenseCreate,
    current_user: UserBase = Depends(get_current_user)
):
    """
    Create a new expense in a group.
    """
    payload.paidBy = current_user.email
    new_expense = expense_service.create_expense(payload)
    return new_expense


@router.get("/group/{group_id}", response_model=List[ExpenseBase])
def get_group_expenses(
    group_id: str,
    current_user: UserBase = Depends(get_current_user)
):
    """
    Fetch all expenses belonging to a specific group.
    """
    expenses = expense_service.get_group_expenses(group_id)
    return expenses


@router.get("/my", response_model=List[ExpenseBase])
def get_user_expenses(
    current_user: UserBase = Depends(get_current_user)
):
    """
    Fetch all expenses created (paid) by the logged-in user.
    """
    expenses = expense_service.get_user_expenses(current_user.email)
    return expenses


@router.get("/{expense_id}", response_model=ExpenseBase)
def get_expense(expense_id: str, current_user: UserBase = Depends(get_current_user)):
    """
    Get a single expense by its ID.
    """
    expense = expense_service.get_expense_by_id(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.put("/{expense_id}", response_model=ExpenseBase)
def update_expense(
    expense_id: str,
    payload: ExpenseUpdate,
    current_user: UserBase = Depends(get_current_user)
):
    """
    Update an existing expense by ID (partial or full update).
    Only provide the fields you want to update.
    """
    updated = expense_service.update_expense(expense_id, payload)
    if not updated:
        raise HTTPException(status_code=404, detail="Expense not found or no changes made")
    return updated


@router.delete("/{expense_id}")
def delete_expense(
    expense_id: str,
    current_user: UserBase = Depends(get_current_user)
):
    """
    Delete an expense by its ID.
    """
    success = expense_service.delete_expense(expense_id)
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted successfully"}
