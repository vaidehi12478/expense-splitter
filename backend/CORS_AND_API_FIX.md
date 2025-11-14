# CORS Configuration & API Integration Fix

## Issues Fixed

### 1. **CORS Configuration (Backend)**
✅ Added `CORSMiddleware` to `app/main.py`
✅ Allowed frontend origins:
  - `http://localhost:3000` (React)
  - `http://localhost:5173` (Vite)
  - `http://127.0.0.1:3000` & `http://127.0.0.1:5173`
✅ Enabled all HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
✅ Enabled all headers

### 2. **API Request Format (Frontend)**
✅ Fixed login endpoint to use JSON instead of form data
✅ Updated group API endpoints to match backend parameter names
✅ Corrected field names: `member_email` and `member_emails`

---

## What Changed

### Backend (app/main.py)
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[...],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Frontend (src/services/api.ts)
**Login - Before:**
```typescript
login: async (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);
  const { data } = await apiClient.post('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}
```

**Login - After:**
```typescript
login: async (email, password) => {
  const { data } = await apiClient.post('/auth/login', { 
    email, 
    password 
  });
}
```

**Groups - Updated Parameter Names:**
```typescript
// Before
addMembers: async (groupId, emails) => {
  apiClient.post(`/groups/${groupId}/add-members`, { emails });
}

// After
addMembers: async (groupId, member_emails) => {
  apiClient.post(`/groups/${groupId}/add-members`, { member_emails });
}
```

---

## How to Test

### 1. Restart Backend
```bash
cd backend
uvicorn app.main:app --reload
```

### 2. Restart Frontend
```bash
cd frontend
npm run dev
```

### 3. Test API Calls
1. Go to http://localhost:5173 (or 3000)
2. Try signing up
3. Try logging in
4. Create a group
5. Add members to group

---

## Error Messages - What They Mean

| Error | Cause | Solution |
|-------|-------|----------|
| `405 Method Not Allowed` | CORS not configured | Restart backend with CORS middleware |
| `400 Bad Request` on login | Wrong request format | Use JSON, not form data |
| `401 Unauthorized` | Token not sent | Check localStorage for token |
| `422 Unprocessable Entity` | Invalid field names | Check parameter names match backend |

---

## Backend API Parameter Reference

### Auth
- **POST /auth/signup**: `{ name, email, password }`
- **POST /auth/login**: `{ email, password }`

### Groups
- **POST /groups/**: `{ name, description }`
- **POST /groups/{group_id}/add-member**: Query param `member_email=...`
- **POST /groups/{group_id}/add-members**: Body `{ member_emails: [...] }`
- **POST /groups/{group_id}/remove-member**: Query param `member_email=...`

### Expenses
- **POST /expenses/**: `{ amount, description, paidBy, groupId, category, splitType, splits, date }`
- **PUT /expenses/{id}**: `{ amount?, description?, ... }`

### Settlements
- **POST /settlements/calculate/{group_id}**: No body
- **POST /settlements/settle/{group_id}**: No body
- **GET /settlements/{group_id}**: No body

---

## Environment Setup Checklist

- [ ] Backend running on http://localhost:8000
- [ ] Frontend running on http://localhost:5173 or 3000
- [ ] `.env` file in backend with `MONGO_URL` and `JWT_SECRET`
- [ ] CORS middleware added to FastAPI app
- [ ] API endpoint parameter names match between frontend and backend
- [ ] Token stored in localStorage after login

---

Generated: November 12, 2025
