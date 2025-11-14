# Expense Splitter API - Complete Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Setup & Installation](#setup--installation)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Examples](#examples)

---

## Overview

**Base URL:** `http://localhost:8000`

**API Type:** RESTful API built with FastAPI

**Database:** MongoDB

**Authentication:** JWT (JSON Web Token)

The Expense Splitter API allows users to:
- Create and manage groups
- Track shared expenses
- Automatically calculate settlements
- Split expenses equally, by unequal amounts, or by percentages

---

## Setup & Installation

### Prerequisites
- Python 3.10+
- MongoDB connection string
- pip (Python package manager)

### Installation Steps

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables** (`.env` file)
   ```
   MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/?appName=Cluster
   JWT_SECRET=your_secret_key_here
   ```

5. **Run the server**
   ```bash
   uvicorn app.main:app --reload
   ```

   Server runs at: `http://localhost:8000`

---

## Authentication

### JWT Token Flow

1. **User Signup** → Get user account
2. **User Login** → Receive JWT token
3. **Use token in requests** → Add to Authorization header

### Headers Required
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

---

## API Endpoints

### 🔐 Authentication Endpoints

#### 1. Sign Up
```
POST /auth/signup
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-11-12T10:30:00Z"
}
```

**Errors:**
- `409`: Email already registered
- `422`: Invalid email format or missing fields

---

#### 2. Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Errors:**
- `401`: Invalid credentials
- `404`: User not found

---

### 👥 Group Endpoints

#### 1. Create Group
```
POST /groups/
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Weekend Trip",
  "description": "Trip to Goa"
}
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439012",
  "name": "Weekend Trip",
  "description": "Trip to Goa",
  "members": ["john@example.com"],
  "createdBy": "john@example.com",
  "createdAt": "2025-11-12T10:30:00Z"
}
```

---

#### 2. Get User's Groups
```
GET /groups/
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "name": "Weekend Trip",
    "description": "Trip to Goa",
    "members": ["john@example.com", "jane@example.com"],
    "createdBy": "john@example.com",
    "createdAt": "2025-11-12T10:30:00Z"
  }
]
```

---

#### 3. Add Single Member to Group
```
POST /groups/{group_id}/add-member?member_email=user@example.com
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "user@example.com added successfully"
}
```

---

#### 4. Add Multiple Members to Group
```
POST /groups/{group_id}/add-members
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "member_emails": [
    "user1@example.com",
    "user2@example.com",
    "user3@example.com"
  ]
}
```

**Response (200 OK):**
```json
{
  "message": "3 member(s) added successfully"
}
```

---

#### 5. Remove Member from Group
```
POST /groups/{group_id}/remove-member?member_email=user@example.com
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "user@example.com removed successfully"
}
```

---

### 💰 Expense Endpoints

#### 1. Create Expense
```
POST /expenses/
Authorization: Bearer <token>
```

**Request Body - Equal Split (All Members):**
```json
{
  "amount": 300,
  "description": "Group dinner",
  "groupId": "507f1f77bcf86cd799439012",
  "category": "Food",
  "splitType": "equal",
  "splits": null
}
```

**Request Body - Equal Split (Participating Members Only):**
```json
{
  "amount": 300,
  "description": "Dinner for 6 people",
  "groupId": "507f1f77bcf86cd799439012",
  "category": "Food",
  "splitType": "equal",
  "splits": {
    "john@example.com": 1,
    "jane@example.com": 1,
    "bob@example.com": 1,
    "alice@example.com": 1,
    "charlie@example.com": 1,
    "diana@example.com": 1
  }
}
```

**Request Body - Unequal Split:**
```json
{
  "amount": 300,
  "description": "Dinner with different portions",
  "groupId": "507f1f77bcf86cd799439012",
  "category": "Food",
  "splitType": "unequal",
  "splits": {
    "john@example.com": 80,
    "jane@example.com": 100,
    "bob@example.com": 120
  }
}
```

**Request Body - Percentage Split:**
```json
{
  "amount": 300,
  "description": "Dinner split by percentage",
  "groupId": "507f1f77bcf86cd799439012",
  "category": "Food",
  "splitType": "percentage",
  "splits": {
    "john@example.com": 40,
    "jane@example.com": 30,
    "bob@example.com": 30
  }
}
```

**Response (200 OK):**
```json
{
  "id": "507f1f77bcf86cd799439013",
  "amount": 300,
  "description": "Group dinner",
  "paidBy": "john@example.com",
  "groupId": "507f1f77bcf86cd799439012",
  "category": "Food",
  "splitType": "equal",
  "splits": null,
  "date": "2025-11-12T10:30:00Z",
  "createdAt": "2025-11-12T10:30:00Z"
}
```

**Validation:**
- `amount` must be > 0 (rejects 0 and negative values)
- `paidBy` is automatically set to current user's email
- `splitType` defaults to "equal" if not provided

---

#### 2. Get Group Expenses
```
GET /expenses/group/{group_id}
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439013",
    "amount": 300,
    "description": "Group dinner",
    "paidBy": "john@example.com",
    "groupId": "507f1f77bcf86cd799439012",
    "category": "Food",
    "splitType": "equal",
    "splits": null,
    "date": "2025-11-12T10:30:00Z",
    "createdAt": "2025-11-12T10:30:00Z"
  }
]
```

---

#### 3. Get User's Expenses (Paid by User)
```
GET /expenses/my
Authorization: Bearer <token>
```

**Response (200 OK):** Same format as above

---

#### 4. Get Single Expense
```
GET /expenses/{expense_id}
Authorization: Bearer <token>
```

**Response (200 OK):** Single expense object

**Errors:**
- `404`: Expense not found

---

#### 5. Update Expense (Partial or Full)
```
PUT /expenses/{expense_id}
Authorization: Bearer <token>
```

**Request Body - Update Amount Only:**
```json
{
  "amount": 350
}
```

**Request Body - Update Multiple Fields:**
```json
{
  "amount": 350,
  "description": "Updated dinner cost",
  "category": "Food & Drinks"
}
```

**Request Body - Update Split:**
```json
{
  "splits": {
    "john@example.com": 100,
    "jane@example.com": 250
  }
}
```

**Response (200 OK):** Updated expense object

**Errors:**
- `404`: Expense not found
- `400`: No changes made

---

#### 6. Delete Expense
```
DELETE /expenses/{expense_id}
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Expense deleted successfully"
}
```

**Errors:**
- `404`: Expense not found

---

### 🏦 Settlement Endpoints

#### 1. Calculate Settlements for Group
```
POST /settlements/calculate/{group_id}
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "paidBy": "john@example.com",
    "paidTo": "jane@example.com",
    "amount": 75.50,
    "groupId": "507f1f77bcf86cd799439012",
    "date": "2025-11-12T10:30:00Z",
    "createdAt": "2025-11-12T10:30:00Z"
  },
  {
    "paidBy": "bob@example.com",
    "paidTo": "jane@example.com",
    "amount": 120.00,
    "groupId": "507f1f77bcf86cd799439012",
    "date": "2025-11-12T10:30:00Z",
    "createdAt": "2025-11-12T10:30:00Z"
  }
]
```

**Note:** This endpoint:
- Calculates all debts in the group
- Returns minimal settlement transactions
- Does NOT save to database (just calculation)

---

#### 2. Record Settlements
```
POST /settlements/settle/{group_id}
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439014",
    "paidBy": "john@example.com",
    "paidTo": "jane@example.com",
    "amount": 75.50,
    "groupId": "507f1f77bcf86cd799439012",
    "date": "2025-11-12T10:30:00Z",
    "createdAt": "2025-11-12T10:30:00Z"
  }
]
```

**Note:** This endpoint:
- Saves settlements to database
- Should be called after user confirms the calculated settlements

---

#### 3. Get Group Settlements
```
GET /settlements/{group_id}
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
[
  {
    "id": "507f1f77bcf86cd799439014",
    "paidBy": "john@example.com",
    "paidTo": "jane@example.com",
    "amount": 75.50,
    "groupId": "507f1f77bcf86cd799439012",
    "date": "2025-11-12T10:30:00Z",
    "createdAt": "2025-11-12T10:30:00Z"
  }
]
```

---

## Data Models

### User Model
```
id: string (MongoDB ObjectId)
name: string
email: string (unique)
passwordHash: string (hashed with werkzeug)
avatarUrl: string | null
createdAt: datetime
updatedAt: datetime
```

### Group Model
```
id: string (MongoDB ObjectId)
name: string
description: string | null
members: array[string] (emails)
createdBy: string (email)
createdAt: datetime
updatedAt: datetime
```

### Expense Model
```
id: string (MongoDB ObjectId)
amount: float (must be > 0)
description: string | null
paidBy: string (email)
groupId: string
category: string
splitType: string ("equal" | "unequal" | "percentage", defaults to "equal")
splits: object | null
  For "equal": null (all members) or {"email": 1, ...} (participating members)
  For "unequal": {"email": amount, ...}
  For "percentage": {"email": percentage, ...} (total should be 100)
date: datetime
createdAt: datetime
updatedAt: datetime
```

### Settlement Model
```
id: string (MongoDB ObjectId)
amount: float
paidBy: string (email)
paidTo: string (email)
groupId: string
date: datetime
createdAt: datetime
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "detail": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | Successful GET/POST/PUT |
| 201 | Created | Successful creation |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Email already exists |
| 422 | Unprocessable Entity | Validation error |
| 500 | Server Error | Database or server issue |

### Common Errors

**Missing Authorization Header:**
```json
{
  "detail": "Not authenticated"
}
```

**Invalid Token:**
```json
{
  "detail": "Could not validate credentials. Please log in again."
}
```

**Invalid Email Format:**
```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "email"],
      "msg": "invalid email format"
    }
  ]
}
```

**Negative Amount:**
```json
{
  "detail": [
    {
      "type": "greater_than",
      "loc": ["body", "amount"],
      "msg": "Input should be greater than 0"
    }
  ]
}
```

---

## Examples

### Complete Workflow Example

#### 1. User Signup
```bash
curl -X POST "http://localhost:8000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### 2. User Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:** Get `access_token`

#### 3. Create Group
```bash
curl -X POST "http://localhost:8000/groups/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "name": "Trip to Goa",
    "description": "Weekend trip"
  }'
```

#### 4. Add Members
```bash
curl -X POST "http://localhost:8000/groups/<group_id>/add-members" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "member_emails": ["jane@example.com", "bob@example.com"]
  }'
```

#### 5. Create Expense
```bash
curl -X POST "http://localhost:8000/expenses/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "amount": 300,
    "description": "Dinner",
    "groupId": "<group_id>",
    "category": "Food",
    "splitType": "equal",
    "splits": null
  }'
```

#### 6. Calculate Settlements
```bash
curl -X POST "http://localhost:8000/settlements/calculate/<group_id>" \
  -H "Authorization: Bearer <your_token>"
```

#### 7. Record Settlements
```bash
curl -X POST "http://localhost:8000/settlements/settle/<group_id>" \
  -H "Authorization: Bearer <your_token>"
```

---

## Frontend Integration Tips

### 1. JWT Token Management
- Store token in localStorage or sessionStorage
- Include in every authenticated request header
- Refresh token logic not yet implemented (consider adding)

### 2. Error Handling
- Always check response status codes
- Parse error messages from `detail` field
- Display user-friendly error messages

### 3. Split Types
- **Equal**: Best for simple splits (everyone owes the same)
- **Unequal**: For specific amounts per person
- **Percentage**: For proportional splits

### 4. Settlement Flow
1. Calculate settlements first (preview mode)
2. Show user what payments are needed
3. User confirms and clicks "Settle"
4. Record settlements to database
5. Clear expenses or mark as settled

### 5. Loading States
- Show loading spinner during API calls
- Disable buttons during submission
- Handle network timeouts gracefully

---

## Additional Notes

### Password Requirements
- Passwords are hashed with Werkzeug (not plain text stored)
- Maximum 72 bytes (Bcrypt limit)
- Should enforce strong passwords on frontend

### Database Constraints
- Email must be unique across users
- Group members must have valid user emails
- All timestamps are in UTC

### Rate Limiting
- Not yet implemented
- Consider adding for production

### Pagination
- Not yet implemented
- Consider adding for groups/expenses with many items

---

## Support & Troubleshooting

### Common Issues

**1. "Cannot connect to MongoDB"**
- Check MONGO_URL in .env
- Verify MongoDB connection string is correct
- Ensure IP is whitelisted in MongoDB Atlas

**2. "Invalid token" error**
- Token may have expired
- User needs to login again
- Check token includes "Bearer " prefix

**3. "Expense not found"**
- Verify expense_id is correct
- Expense may belong to different group
- User may not have access to group

---

Generated: November 12, 2025
API Version: 1.0.0
