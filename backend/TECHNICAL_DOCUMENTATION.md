# Backend Technical Documentation

## Architecture Overview

### Project Structure
```
backend/
├── app/
│   ├── main.py              # FastAPI app setup
│   ├── config.py            # Configuration (env variables)
│   ├── database.py          # MongoDB connection
│   ├── deps/                # Dependencies (auth, etc)
│   │   └── current_user.py  # JWT verification
│   ├── models/              # Pydantic models (request/response)
│   │   ├── user.py
│   │   ├── group.py
│   │   ├── expenses.py
│   │   └── settlement.py
│   ├── routers/             # API endpoints
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── group.py
│   │   ├── expenses.py
│   │   └── settlement.py
│   └── services/            # Business logic
│       ├── auth_service.py
│       ├── group_service.py
│       ├── expense_service.py
│       └── settlement_service.py
├── requirements.txt         # Python dependencies
└── .env                     # Environment variables
```

---

## Core Components

### 1. Authentication (`auth_service.py`)

**Key Functions:**
- `signup_user()` - Create new user account
- `login_user()` - Authenticate and return JWT
- `create_access_token()` - Generate JWT token

**Security:**
- Passwords hashed with Werkzeug
- Max password length: 72 bytes (Bcrypt limit)
- JWT signing with HS256 algorithm
- Token expiry: 2 days

**Token Structure:**
```json
{
  "user_id": "507f1f77bcf86cd799439011",
  "email": "john@example.com",
  "exp": 1699000000
}
```

---

### 2. Group Management (`group_service.py`)

**Key Functions:**
- `create_group()` - Create new group (user auto-added)
- `get_user_groups()` - Get groups user is member of
- `add_member_to_group()` - Add single member
- `add_multiple_members_to_group()` - Bulk add members
- `remove_member_from_group()` - Remove member

**MongoDB Queries:**
- Uses `$addToSet` to prevent duplicate members
- Uses `$pull` to remove members
- Tracks `createdAt` and `updatedAt` timestamps

---

### 3. Expense Tracking (`expense_service.py`)

**Key Functions:**
- `create_expense()` - Create new expense with splits
- `get_group_expenses()` - Get all expenses in group
- `get_user_expenses()` - Get expenses paid by user
- `get_expense_by_id()` - Get single expense
- `update_expense()` - Partial or full update
- `delete_expense()` - Remove expense

**Validation:**
- Amount must be > 0
- Partial updates use `ExpenseUpdate` model (all optional)
- Full updates use `ExpenseCreate` model

**Split Types:**
```
"equal"      → splits: null or {"email": 1}
"unequal"    → splits: {"email": amount}
"percentage" → splits: {"email": percentage}
```

---

### 4. Settlement Calculation (`settlement_service.py`)

**Key Functions:**
- `settle_group_expenses()` - Calculate minimal settlements
- `record_settlements()` - Save settlements to DB
- `get_group_settlements()` - Retrieve past settlements

**Algorithm:**
1. Calculate net balance for each member
2. Separate into debtors and creditors
3. Match debtors to creditors with minimal transactions
4. Return settlement instructions

**Balance Calculation:**
```
For each expense:
  - Add paid_by amount (they paid out)
  - Subtract each member's share (they owe)
```

**Example:**
```
Expense: $300 equal split between [John, Jane, Bob]
John paid: $300
- John: +$300 (paid)
- Jane: -$100 (owes)
- Bob: -$100 (owes)

Result: Jane pays John $100, Bob pays John $100
```

---

### 5. Authentication Dependency (`deps/current_user.py`)

**JWT Verification:**
1. Extract token from `Authorization: Bearer <token>` header
2. Decode token using `JWT_SECRET`
3. Get `user_id` from token
4. Fetch user from MongoDB
5. Return `UserBase` object

**Error Handling:**
- Invalid token → 401 Unauthorized
- Expired token → 401 Unauthorized
- User not found → 401 Unauthorized

---

## Database Schema

### MongoDB Collections

#### users
```javascript
{
  "_id": ObjectId,
  "name": String,
  "email": String (unique),
  "passwordHash": String,
  "avatarUrl": String,
  "createdAt": Date,
  "updatedAt": Date
}
```

#### groups
```javascript
{
  "_id": ObjectId,
  "name": String,
  "description": String,
  "members": [String],    // array of emails
  "createdBy": String,    // email
  "createdAt": Date,
  "updatedAt": Date
}
```

#### expenses
```javascript
{
  "_id": ObjectId,
  "amount": Number,       // > 0
  "description": String,
  "paidBy": String,       // email
  "groupId": String,      // ObjectId as string
  "category": String,
  "splitType": String,    // "equal", "unequal", "percentage"
  "splits": Object,       // depends on splitType
  "date": Date,
  "createdAt": Date,
  "updatedAt": Date
}
```

#### settlements
```javascript
{
  "_id": ObjectId,
  "amount": Number,
  "paidBy": String,       // email
  "paidTo": String,       // email
  "groupId": String,      // ObjectId as string
  "date": Date,
  "createdAt": Date
}
```

---

## Pydantic Models

### Request Models (with validation)

**UserSignup**
- name: str (required)
- email: EmailStr (required, valid format)
- password: str (required)

**UserLogin**
- email: EmailStr (required, valid format)
- password: str (required)

**ExpenseCreate**
- amount: float (required, > 0)
- description: str (optional)
- paidBy: EmailStr (auto-set to current user)
- groupId: str (required)
- category: str (required)
- splitType: str (optional, defaults to "equal")
- splits: Dict[str, float] (optional)
- date: datetime (optional, defaults to now)

**ExpenseUpdate** (all fields optional)
- amount: float (> 0 if provided)
- description: str
- paidBy: EmailStr
- groupId: str
- category: str
- splitType: str
- splits: Dict[str, float]
- date: datetime

---

## API Response Patterns

### Success Response (200 OK)
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2025-11-12T10:30:00Z"
}
```

### List Response (200 OK)
```json
[
  { /* object 1 */ },
  { /* object 2 */ }
]
```

### Error Response
```json
{
  "detail": "Error message"
}
```

### Validation Error (422)
```json
{
  "detail": [
    {
      "type": "value_error",
      "loc": ["body", "field_name"],
      "msg": "error message"
    }
  ]
}
```

---

## Environment Configuration

### `.env` File
```
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/?appName=Cluster
JWT_SECRET=your_secret_key_minimum_32_characters_recommended
```

### Loaded via `config.py`
```python
load_dotenv(dotenv_path=Path(__file__).parent / ".env")
MONGO_URL = os.getenv("MONGO_URL")
JWT_SECRET = os.getenv("JWT_SECRET")
```

---

## Key Implementation Details

### Password Hashing
```python
from werkzeug.security import generate_password_hash, check_password_hash

# Signup
hashed = generate_password_hash(password)

# Login
check_password_hash(hashed, provided_password)
```

### JWT Token Generation
```python
from jose import jwt

token = jwt.encode(
    {"user_id": str(user_id), "email": email},
    JWT_SECRET,
    algorithm="HS256"
)
```

### JWT Token Verification
```python
from jose import jwt
from jose.exceptions import JWTError

try:
    payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    user_id = payload.get("user_id")
except JWTError:
    raise HTTPException(status_code=401)
```

### MongoDB ObjectId Handling
```python
from bson import ObjectId

# Create ObjectId
_id = ObjectId()

# Convert string to ObjectId
_id = ObjectId(user_id_string)

# Query
user = db.users.find_one({"_id": ObjectId(user_id)})
```

### Split Calculation Examples

**Equal Split (All Members):**
```python
if not splits:  # null
    members = group["members"]  # [email1, email2, ...]
    share = amount / len(members)
```

**Equal Split (Participating Members):**
```python
if splits:  # {"email1": 1, "email2": 1}
    members = list(splits.keys())
    share = amount / len(members)
```

**Unequal Split:**
```python
for member, amount_owed in splits.items():
    # amount_owed is exact amount
```

**Percentage Split:**
```python
for member, percentage in splits.items():
    amount_owed = (total_amount * percentage) / 100
```

---

## Error Handling Patterns

### Validation Errors (Automatic via Pydantic)
```python
@router.post("/expenses/")
def create_expense(payload: ExpenseCreate):
    # Pydantic validates automatically
    # If invalid, returns 422 with error details
```

### Business Logic Errors
```python
@router.post("/groups/{group_id}/add-member")
def add_member(group_id: str, member_email: str):
    success = group_service.add_member_to_group(group_id, member_email)
    if not success:
        raise HTTPException(status_code=400, detail="Already a member")
```

### Not Found Errors
```python
@router.get("/expenses/{expense_id}")
def get_expense(expense_id: str):
    expense = expense_service.get_expense_by_id(expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
```

---

## Testing Recommendations

### Unit Tests
- Test service functions with mock data
- Test validation with invalid inputs
- Test settlement calculations

### Integration Tests
- Test complete workflows (signup → create group → add expense → settle)
- Test authentication token flow
- Test MongoDB CRUD operations

### End-to-End Tests
- Test API endpoints with real server
- Test error responses
- Test edge cases (empty groups, single member, etc)

---

## Performance Considerations

### Current Limitations
- No pagination (all items returned)
- No caching
- No rate limiting
- No database indexing configured

### Recommendations
- Add indexes on frequently queried fields:
  ```javascript
  db.users.createIndex({"email": 1})
  db.groups.createIndex({"members": 1})
  db.expenses.createIndex({"groupId": 1})
  ```
- Implement pagination for large result sets
- Add caching for settlements
- Consider denormalizing frequently accessed data

---

## Security Checklist

- ✅ Passwords hashed (Werkzeug)
- ✅ JWT tokens for authentication
- ✅ Token expiry (2 days)
- ⚠️ HTTPS not enforced (add in production)
- ⚠️ No rate limiting
- ⚠️ No CORS configured
- ⚠️ No input sanitization beyond validation

### Production Recommendations
1. Enable HTTPS only
2. Add rate limiting
3. Configure CORS properly
4. Add request logging
5. Use environment-based secrets
6. Implement API versioning
7. Add comprehensive logging
8. Set up monitoring/alerts

---

## Debugging Tips

### Enable Detailed Logging
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### MongoDB Debug Queries
```python
# Check collection contents
db.users.find().pretty()
db.groups.find().pretty()
```

### JWT Debug
```python
# Decode token to verify contents
from jose import jwt
payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
print(payload)
```

---

## Future Enhancements

1. **User Profiles**
   - Profile pictures
   - User preferences
   - Social connections

2. **Advanced Settlements**
   - Mark payments as verified
   - Partial payments
   - Payment history

3. **Expense Tracking**
   - Recurring expenses
   - Budget limits
   - Expense analytics

4. **Notifications**
   - Email reminders
   - Push notifications
   - In-app notifications

5. **Mobile App**
   - React Native app
   - Offline support
   - Image receipt upload

---

Generated: November 12, 2025
