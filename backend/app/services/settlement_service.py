from datetime import datetime
from bson import ObjectId
from app.database import db
from typing import List, Dict


def settle_group_expenses(group_id: str) -> List[Dict]:
    """
    Compute minimal settlement transactions for a given group.
    Each expense has fields: amount, paidBy, splitType, splits
    
    For equal split:
    - splits = None: divide equally among ALL group members
    - splits = {email: 1, email: 1, ...}: divide equally among ONLY participating members
    
    For unequal split:
    - splits = {email: amount, email: amount, ...}: each member owes the specified amount
    
    For percentage split:
    - splits = {email: percentage, email: percentage, ...}: each member owes the specified percentage
    """

    group = db.groups.find_one({"_id": ObjectId(group_id)})
    all_group_members = group.get("members", []) if group else []

    expenses_cursor = db.expenses.find({"groupId": group_id})
    balances = {}

    # STEP 1️⃣ — Calculate net balance for each member
    for expense in expenses_cursor:
        paid_by = expense["paidBy"]
        amount = expense["amount"]
        split_type = expense.get("splitType", "equal")
        splits = expense.get("splits")  # can be None or dict
        
        # 1. CREDIT the payer with the full amount
        balances[paid_by] = balances.get(paid_by, 0.0) + amount

        # 2. DEBIT participants for their share
        if split_type == "equal":
            if splits is None:
                # No splits provided = divide equally among ALL group members
                if all_group_members: 
                    split_amount = amount / len(all_group_members)
                    for member in all_group_members:
                        balances[member] = balances.get(member, 0.0) - split_amount
            else:
                # Splits provided with value 1 = divide equally among ONLY participating members
                participating_members = list(splits.keys())
                if participating_members:
                    split_amount = amount / len(participating_members)
                    for member in participating_members:
                        balances[member] = balances.get(member, 0.0) - split_amount
                    
        elif split_type == "unequal" and splits:
            # Subtract each member's exact amount
            for member, split_amount in splits.items():
                balances[member] = balances.get(member, 0.0) - split_amount
        
        elif split_type == "percentage" and splits:
            # Subtract each member's percentage share
            for member, percentage in splits.items():
                split_amount = (amount * percentage) / 100
                balances[member] = balances.get(member, 0.0) - split_amount
        else:
            # Invalid split configuration - skip this expense
            continue

    # STEP 2️⃣ — Separate creditors and debtors
    debtors = []  # users who owe money (negative balance)
    creditors = [] # users who should receive money (positive balance)

    for user, balance in balances.items():
        if abs(balance) < 1e-6:  # ignore near-zero balances
            continue
        if balance < 0:
            debtors.append({"user": user, "amount": -balance})
        else:
            creditors.append({"user": user, "amount": balance})

    # Sort for algorithm stability
    debtors.sort(key=lambda x: x["amount"], reverse=True)
    creditors.sort(key=lambda x: x["amount"], reverse=True)

    # STEP 3️⃣ — Match debtors to creditors (greedy algorithm for minimal transactions)
    settlements = []
    i, j = 0, 0
    
    while i < len(debtors) and j < len(creditors):
        debtor = debtors[i]
        creditor = creditors[j]

        # Transfer the minimum of what debtor owes and creditor is owed
        amount = min(debtor["amount"], creditor["amount"])
        
        settlements.append({
            "paidBy": debtor["user"],
            "paidTo": creditor["user"],
            "amount": round(amount, 2),
            "groupId": group_id,
            "date": datetime.utcnow(),
            "createdAt": datetime.utcnow()
        })

        # Update remaining amounts
        debtor["amount"] -= amount
        creditor["amount"] -= amount

        # Move to next debtor/creditor if current one is settled
        if abs(debtor["amount"]) < 1e-6:
            i += 1
        if abs(creditor["amount"]) < 1e-6:
            j += 1

    return settlements


def record_settlements(settlements: List[Dict]) -> List[Dict]:
    """
    Record settlement transactions in the database.
    """
    if not settlements:
        return []
    
    recorded_settlements = []
    for settlement in settlements:
        settlement_doc = {
            "amount": settlement["amount"],
            "paidBy": settlement["paidBy"],
            "paidTo": settlement["paidTo"],
            "groupId": settlement["groupId"],
            "date": settlement["date"],
            "createdAt": settlement["createdAt"]
        }
        result = db.settlements.insert_one(settlement_doc)
        recorded_settlements.append({
            "id": str(result.inserted_id),
            **settlement_doc
        })
    return recorded_settlements


def get_group_settlements(group_id: str) -> List[Dict]:
    """
    Retrieve all settlements for a given group.
    """
    settlements_cursor = db.settlements.find({"groupId": group_id})
    settlements = []
    for settlement in settlements_cursor:
        settlements.append({
            "id": str(settlement["_id"]),
            "amount": settlement["amount"],
            "paidBy": settlement["paidBy"],
            "paidTo": settlement["paidTo"],
            "groupId": settlement["groupId"],
            "date": settlement["date"],
            "createdAt": settlement["createdAt"]
        })
    return settlements