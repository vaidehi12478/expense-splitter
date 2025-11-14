from datetime import datetime, timedelta
from bson import ObjectId
from app.database import db
from app.config import JWT_SECRET
from app.models.user import UserSignup, UserLogin, UserBase
from werkzeug.security import generate_password_hash, check_password_hash
from jose import jwt  # instead of PyJWT

# Constants
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 2

# Ensure JWT_SECRET is set
if not JWT_SECRET:
    raise ValueError("JWT_SECRET is not set in environment variables")


def signup_user(payload: UserSignup):
    """
    Register a new user in MongoDB using Werkzeug hashing.
    """
    # Check if email already exists
    exists = db.users.find_one({"email": payload.email})
    if exists:
        return None  # Email already registered

    # Hash password
    hashed_password = generate_password_hash(payload.password)

    # Create user document
    user_doc = {
        "name": payload.name,
        "email": payload.email,
        "passwordHash": hashed_password,
        "avatarUrl": None,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }

    # Insert into MongoDB
    result = db.users.insert_one(user_doc)

    # Return basic user info (without password)
    return UserBase(
        id=str(result.inserted_id),
        name=payload.name,
        email=payload.email,
        createdAt=user_doc["createdAt"]
    )


def create_access_token(data: dict):
    """
    Create JWT token using jose.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})

    token = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return token


def login_user(payload: UserLogin):
    """
    Verify user credentials and return JWT token.
    """
    user = db.users.find_one({"email": payload.email})
    if not user:
        return None

    # Verify password using Werkzeug
    if not check_password_hash(user["passwordHash"], payload.password):
        return None

    # Generate JWT (no manual encode)
    token = create_access_token({
        "user_id": str(user["_id"]),
        "email": user["email"]
    })

    return token
