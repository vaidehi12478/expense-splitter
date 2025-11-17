from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, users, group, expenses, settlement
from app.database import db
import dotenv

port = dotenv.get_key(".env", "PORT") or 8080

app = FastAPI(
    title="Expense Splitter API",
    description="Backend API for Splitwise-like Expense Management App",
    version="1.0.0"
)

# CORS configuration - Allow frontend to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",      # React dev server
        "http://localhost:5173",      # Vite dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8000",      # For testing
    ],
    allow_credentials=True,
    allow_methods=["*"],              # Allow all methods (GET, POST, PUT, DELETE, OPTIONS, etc)
    allow_headers=["*"],              # Allow all headers
)

# include all routers
app.include_router(auth.router)
# app.include_router(users.router)
app.include_router(group.router)
app.include_router(expenses.router)
app.include_router(settlement.router)


# root route
@app.get("/")
def home():
    return {"message": "Welcome to Expense Splitter API"}
