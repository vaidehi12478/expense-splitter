# Expense Split Guide

## Overview
The settlement system now supports three split types and handles partial participation:

---

## Split Types

### 1. **Equal Split (All Group Members)**
When you want to divide equally among **ALL** group members:

```json
{
  "amount": 300,
  "description": "Group dinner",
  "paidBy": "user1@example.com",
  "groupId": "group123",
  "category": "Food",
  "splitType": "equal",
  "splits": null
}
```
**Result:** If group has 10 members, each owes 30 (300 ÷ 10)

---

### 2. **Equal Split (Participating Members Only)**
When you want to divide equally among **ONLY** participants (e.g., 6 out of 10 members ate):

```json
{
  "amount": 300,
  "description": "Dinner for 6 people",
  "paidBy": "user1@example.com",
  "groupId": "group123",
  "category": "Food",
  "splitType": "equal",
  "splits": {
    "user1@example.com": 1,
    "user2@example.com": 1,
    "user3@example.com": 1,
    "user4@example.com": 1,
    "user5@example.com": 1,
    "user6@example.com": 1
  }
}
```
**Result:** Only 6 members split the cost: each owes 50 (300 ÷ 6)

---

### 3. **Unequal Split (Specific Amounts)**
When members owe different amounts:

```json
{
  "amount": 300,
  "description": "Dinner with different portions",
  "paidBy": "user1@example.com",
  "groupId": "group123",
  "category": "Food",
  "splitType": "unequal",
  "splits": {
    "user2@example.com": 80,
    "user3@example.com": 100,
    "user4@example.com": 120
  }
}
```
**Result:** 
- user2 owes 80
- user3 owes 100
- user4 owes 120

---

### 4. **Percentage Split**
When you want to split by percentages:

```json
{
  "amount": 300,
  "description": "Dinner split by percentage",
  "paidBy": "user1@example.com",
  "groupId": "group123",
  "category": "Food",
  "splitType": "percentage",
  "splits": {
    "user2@example.com": 40,
    "user3@example.com": 30,
    "user4@example.com": 30
  }
}
```
**Result:**
- user2 owes 120 (40% of 300)
- user3 owes 90 (30% of 300)
- user4 owes 90 (30% of 300)

---

## Real-World Example

### Scenario: 10 Group Members, But Only 6 Want to Eat

**Before (without partial participation):** Each member owes 30 (300 ÷ 10)
**After (with splits):** Each participating member owes 50 (300 ÷ 6)

```json
{
  "amount": 300,
  "description": "Lunch - 6 people ate",
  "paidBy": "alice@example.com",
  "groupId": "group_abc123",
  "category": "Food",
  "splitType": "equal",
  "splits": {
    "alice@example.com": 1,
    "bob@example.com": 1,
    "charlie@example.com": 1,
    "diana@example.com": 1,
    "emma@example.com": 1,
    "frank@example.com": 1
  }
}
```

The 4 members not in the `splits` dict won't be charged for this expense.

---

## Settlement Calculation

The system automatically:
1. Calculates each member's net balance across all expenses
2. Identifies who owes money (debtors) and who should receive (creditors)
3. Generates minimal settlement transactions to clear all debts

Example output:
```json
{
  "paidBy": "bob@example.com",
  "paidTo": "alice@example.com",
  "amount": 50.00,
  "groupId": "group_abc123"
}
```
