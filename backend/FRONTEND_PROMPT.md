# Frontend Development Prompt for LLM

Copy this entire prompt and paste it into Claude, ChatGPT, or your preferred LLM to generate frontend code.

---

## COMPLETE FRONTEND DEVELOPMENT BRIEF

You are an expert React/Vue/Next.js frontend developer. Your task is to build a complete frontend application for an **Expense Splitter App** (similar to Splitwise).

### PROJECT OVERVIEW

**App Name:** Expense Splitter  
**Purpose:** Help groups split and manage shared expenses  
**Stack:** React + TypeScript (or Vue 3 + TypeScript)  
**UI Framework:** Tailwind CSS  
**State Management:** Redux Toolkit or Pinia  
**HTTP Client:** Axios  
**Authentication:** JWT (stored in localStorage)  
**Backend API:** http://localhost:8000

### CORE FEATURES TO BUILD

#### 1. Authentication Module
- **Sign Up Page**
  - Fields: Name, Email, Password, Confirm Password
  - Form validation (email format, password strength)
  - Success → Redirect to login
  - Error handling & display

- **Login Page**
  - Fields: Email, Password
  - "Remember me" checkbox (optional)
  - Store JWT token in localStorage
  - Success → Redirect to dashboard
  - Error handling & display

- **Logout**
  - Clear token from localStorage
  - Redirect to login page

#### 2. Dashboard
- **Header**
  - User name & email display
  - Logout button
  - Navigation menu

- **Main Content**
  - List of groups user is member of
  - "Create Group" button
  - Quick stats (total paid, total owed, net balance)

#### 3. Group Management
- **Create Group Page**
  - Fields: Group name, Description
  - Add members (multi-select or email input with suggestions)
  - Submit button
  - Success → Redirect to group page

- **Group Detail Page**
  - Group name & description
  - List of members with badges
  - "Add Member" button
  - Tabs: Expenses | Settlements

- **Group Expenses Tab**
  - List of all expenses in group
  - Expense details: amount, paid by, category, date, how split
  - "Add Expense" button
  - Filter/sort options
  - Edit & Delete buttons for user's expenses

- **Group Settlements Tab**
  - List of who owes whom
  - Settlement status (pending/settled)
  - "Calculate Settlements" button (shows preview)
  - "Mark as Settled" button (records settlements)

#### 4. Expense Management
- **Create/Edit Expense Modal or Page**
  - Fields:
    - Amount (number, must be > 0)
    - Description (optional)
    - Category (dropdown: Food, Transport, Accommodation, etc)
    - Paid by (auto-set to current user, editable)
    - Split type (radio buttons or dropdown):
      - Equal (all members or selected members)
      - Unequal (custom amounts per member)
      - Percentage (custom percentages per member)
    - Members involved (checkboxes for equal split with participating members)
    - Date (optional, defaults to today)

  - Dynamic Split Calculator:
    - For "Equal": Shows amount per person
    - For "Unequal": Input fields for each member's amount
    - For "Percentage": Input fields for each member's percentage (shows total%)
    - Real-time validation (amounts sum to total, percentages sum to 100%)

  - Submit & Cancel buttons
  - For edit: Pre-populate existing expense data

#### 5. Settlement Flow
- **Settlement Preview Screen**
  - Shows calculated settlements (who pays whom and how much)
  - Generated from Calculate Settlements API
  - Clear presentation (cards or list)
  - "Confirm & Save" button

- **Settlement History**
  - List of past settlements
  - Date, amount, from, to
  - Mark as verified (optional UI)

### API INTEGRATION DETAILS

#### Base Configuration
```javascript
const API_BASE_URL = "http://localhost:8000";

// Axios instance with token
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### Authentication Endpoints
- `POST /auth/signup` - Create account
- `POST /auth/login` - Get JWT token

#### Group Endpoints
- `GET /groups/` - Get user's groups
- `POST /groups/` - Create group
- `POST /groups/{group_id}/add-member` - Add single member
- `POST /groups/{group_id}/add-members` - Add multiple members
- `POST /groups/{group_id}/remove-member` - Remove member

#### Expense Endpoints
- `GET /expenses/group/{group_id}` - Get group expenses
- `GET /expenses/my` - Get user's paid expenses
- `GET /expenses/{expense_id}` - Get single expense
- `POST /expenses/` - Create expense
- `PUT /expenses/{expense_id}` - Update expense
- `DELETE /expenses/{expense_id}` - Delete expense

#### Settlement Endpoints
- `POST /settlements/calculate/{group_id}` - Calculate settlements (preview)
- `POST /settlements/settle/{group_id}` - Record settlements
- `GET /settlements/{group_id}` - Get group settlements

### UI/UX REQUIREMENTS

#### Design Principles
- Clean, modern interface
- Mobile-responsive (works on phone, tablet, desktop)
- Intuitive navigation
- Clear error messages
- Loading states (spinners, skeleton screens)
- Success toast notifications

#### Color Scheme (Suggested)
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Danger: Red (#EF4444)
- Warning: Yellow (#F59E0B)
- Background: Light gray (#F3F4F6)
- Text: Dark gray (#1F2937)

#### Key Pages/Components
1. **Auth Pages** (Public)
   - /login
   - /signup

2. **Main Pages** (Protected)
   - / (Dashboard)
   - /groups (Groups list)
   - /groups/:id (Group detail)
   - /expenses/create (Create expense)
   - /expenses/:id/edit (Edit expense)
   - /profile (User profile)

3. **Reusable Components**
   - Header/Navigation
   - Button variants (primary, secondary, danger)
   - Input fields (text, email, number)
   - Modal/Dialog
   - Toast notifications
   - Loading spinner
   - Card component
   - Badge component
   - Currency formatter
   - Date formatter

### STATE MANAGEMENT (Redux/Pinia Example)

**Redux Store Structure:**
```
auth/
  - currentUser
  - token
  - isLoading
  - error
  - isAuthenticated

groups/
  - allGroups
  - currentGroup
  - isLoading
  - error

expenses/
  - allExpenses
  - currentExpense
  - isLoading
  - error

settlements/
  - calculatedSettlements
  - recordedSettlements
  - isLoading
  - error
```

### VALIDATION RULES

**Signup**
- Name: 2-100 characters
- Email: Valid email format
- Password: Minimum 8 characters

**Login**
- Email: Valid email format
- Password: Non-empty

**Create Group**
- Name: 2-50 characters
- Description: 0-200 characters
- Members: Valid emails

**Create Expense**
- Amount: Greater than 0, max 2 decimal places
- Category: Non-empty
- Paid by: Valid email
- Group: Must exist
- Split validation:
  - Equal: At least 2 members
  - Unequal: Amounts must sum to total
  - Percentage: Must sum to exactly 100%

### ERROR HANDLING

**HTTP Errors**
- 401: Redirect to login
- 404: Show "Not found" message
- 400: Show validation errors from API
- 422: Show field-specific errors
- 500: Show generic error message

**Network Errors**
- Show "Connection error, please try again"
- Provide retry button

**User Errors**
- Clear, helpful error messages
- Highlight invalid fields in forms

### KEY USER WORKFLOWS

#### Workflow 1: Create Group and Add Expense
1. User logs in
2. Goes to dashboard
3. Clicks "Create Group"
4. Fills group name, adds members
5. Submits → Group created
6. From group page, clicks "Add Expense"
7. Enters expense details (one person paid $300 for 3 people)
8. Selects "Equal" split with 3 members
9. Submits → Expense created
10. App calculates: Each owes $100

#### Workflow 2: Settle Expenses
1. User clicks "Settlements" tab in group
2. Clicks "Calculate Settlements"
3. App shows: "John pays Alice $100", "Bob pays Alice $100"
4. User reviews and clicks "Confirm & Save"
5. Settlements recorded in database
6. Settlement history updated

#### Workflow 3: Edit Expense
1. User goes to group expenses
2. Finds their expense
3. Clicks edit button
4. Changes amount or split type
5. Recalculates automatically
6. Saves changes

### PERFORMANCE CONSIDERATIONS

- Lazy load group expenses (pagination or virtual scrolling)
- Cache API responses (React Query or SWR)
- Debounce search/filter inputs
- Optimize renders with React.memo/useMemo
- Code splitting by route
- Asset optimization (images, fonts)

### ACCESSIBILITY REQUIREMENTS

- ARIA labels on all interactive elements
- Keyboard navigation support
- Color contrast ratios meet WCAG AA
- Form labels associated with inputs
- Error messages linked to form fields
- Focus indicators visible

### TESTING REQUIREMENTS

- Unit tests for utilities (calculations, formatters)
- Component tests for critical components
- Integration tests for workflows
- Mock API responses

### DELIVERABLES

1. **Folder Structure**
   ```
   src/
   ├── components/
   ├── pages/
   ├── store/
   ├── services/
   ├── hooks/
   ├── utils/
   ├── types/
   ├── styles/
   └── App.tsx
   ```

2. **Type Definitions** (TypeScript)
   - User types
   - Group types
   - Expense types
   - Settlement types
   - API response types

3. **API Service Layer**
   - Centralized API calls
   - Error handling
   - Request/response interceptors

4. **Custom Hooks**
   - useAuth (login, logout, user state)
   - useGroups (fetch, create, update groups)
   - useExpenses (CRUD operations)
   - useSettlements (calculate, record)

5. **Environment Configuration**
   ```
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_ENV=development
   ```

### OPTIONAL ENHANCEMENTS

- Dark mode toggle
- Export expense report (PDF/CSV)
- Group chat/comments
- Recurring expenses
- Budget tracking
- Mobile app (React Native)
- PWA support
- Real-time updates (WebSocket)
- User avatars
- Search/filter functionality
- Undo/Redo actions

### TESTING SCENARIOS

1. **Authentication Flow**
   - Sign up with valid data
   - Sign up with duplicate email
   - Login with correct credentials
   - Login with wrong password
   - Token refresh on page reload

2. **Group Management**
   - Create group
   - Add members (single and bulk)
   - Remove members
   - Update group details

3. **Expense Management**
   - Create equal split expense
   - Create unequal split expense
   - Create percentage split expense
   - Edit expense
   - Delete expense
   - Validate split calculations

4. **Settlements**
   - Calculate settlements
   - Verify settlement accuracy
   - Record settlements
   - View settlement history

---

## START BUILDING!

Begin with the authentication module, then move to groups, then expenses, and finally settlements. Use this backend API specification and build the best user experience possible!

**Backend API Docs Location:** See API_DOCUMENTATION.md for complete endpoint reference

**Questions?**
- Refer to API_DOCUMENTATION.md for all endpoint details
- Refer to TECHNICAL_DOCUMENTATION.md for backend architecture
- Refer to EXPENSE_SPLIT_GUIDE.md for split calculation logic

Good luck! 🚀
