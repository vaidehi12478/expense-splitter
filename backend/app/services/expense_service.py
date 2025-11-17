from datetime import datetime, timedelta
from bson import ObjectId
from app.database import db
from app.models.expenses import ExpenseCreate, ExpenseBase, ExpenseUpdate
from typing import List

def create_expense(payload: ExpenseCreate) -> ExpenseBase:
    expense_doc = {
        "amount": payload.amount,
        "description": payload.description,
        "paidBy": payload.paidBy,
        "groupId": payload.groupId,
        "category": payload.category,
        "splitType": payload.splitType,
        "splits": payload.splits,
        "date": payload.date,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }

    result = db.expenses.insert_one(expense_doc)

    return ExpenseBase(
        id=str(result.inserted_id),
        amount=payload.amount,
        description=payload.description,
        paidBy=payload.paidBy,
        groupId=payload.groupId,
        category=payload.category,
        splitType=payload.splitType,
        splits=payload.splits,
        date=payload.date,
        createdAt=expense_doc["createdAt"]
    )

def get_group_expenses(group_id: str) -> List[ExpenseBase]:
    expenses_cursor = db.expenses.find({"groupId": group_id})
    expenses = []
    for expense in expenses_cursor:
        expenses.append(ExpenseBase(
            id=str(expense["_id"]),
            amount=expense["amount"],
            description=expense.get("description"),
            paidBy=expense["paidBy"],
            groupId=expense["groupId"],
            category=expense["category"],
            splitType=expense["splitType"],
            splits=expense.get("splits"),
            date=expense["date"],
            createdAt=expense["createdAt"]
        ))
    return expenses

def delete_expense(expense_id: str) -> bool:
    result = db.expenses.delete_one({"_id": ObjectId(expense_id)})
    return result.deleted_count > 0

def get_user_expenses(user_email: str) -> List[ExpenseBase]:
    expenses_cursor = db.expenses.find({"paidBy": user_email})
    expenses = []
    for expense in expenses_cursor:
        expenses.append(ExpenseBase(
            id=str(expense["_id"]),
            amount=expense["amount"],
            description=expense.get("description"),
            paidBy=expense["paidBy"],
            groupId=expense["groupId"],
            category=expense["category"],
            splitType=expense["splitType"],
            splits=expense.get("splits"),
            date=expense["date"],
            createdAt=expense["createdAt"]
        ))
    return expenses

def get_expense_by_id(expense_id: str) -> ExpenseBase:
    expense = db.expenses.find_one({"_id": ObjectId(expense_id)})
    if not expense:
        return None

    return ExpenseBase(
        id=str(expense["_id"]),
        amount=expense["amount"],
        description=expense.get("description"),
        paidBy=expense["paidBy"],
        groupId=expense["groupId"],
        category=expense["category"],
        splitType=expense["splitType"],
        splits=expense.get("splits"),
        date=expense["date"],
        createdAt=expense["createdAt"]
    )

def update_expense(expense_id: str, payload: ExpenseUpdate) -> ExpenseBase:
    # Build update document with only the fields that are provided (non-None)
    update_doc = {}
    
    if payload.amount is not None:
        update_doc["amount"] = payload.amount
    if payload.description is not None:
        update_doc["description"] = payload.description
    if payload.paidBy is not None:
        update_doc["paidBy"] = payload.paidBy
    if payload.groupId is not None:
        update_doc["groupId"] = payload.groupId
    if payload.category is not None:
        update_doc["category"] = payload.category
    if payload.splitType is not None:
        update_doc["splitType"] = payload.splitType
    if payload.splits is not None:
        update_doc["splits"] = payload.splits
    if payload.date is not None:
        update_doc["date"] = payload.date
    
    # Always update the updatedAt timestamp
    update_doc["updatedAt"] = datetime.utcnow()
    
    # If no fields to update, return None
    if len(update_doc) == 1:  # Only updatedAt
        return None

    result = db.expenses.update_one(
        {"_id": ObjectId(expense_id)},
        {"$set": update_doc}
    )

    if result.modified_count == 0:
        return None

    return get_expense_by_id(expense_id)