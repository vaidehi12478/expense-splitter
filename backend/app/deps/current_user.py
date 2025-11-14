from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt  # instead of PyJWT
from jose.exceptions import JWTError
from bson import ObjectId
from app.config import JWT_SECRET
from app.database import db
from app.models.user import UserBase

# FastAPI built-in OAuth2 password bearer (looks for "Authorization: Bearer <token>")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(token: str = Depends(oauth2_scheme)) -> UserBase:
    """
    Decodes JWT token, fetches user from MongoDB, and returns user data.
    Raises 401 if invalid or expired.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id: str = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # fetch user from DB (convert string user_id back to ObjectId)
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
    except:
        raise credentials_exception
    if not user:
        raise credentials_exception

    return UserBase(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        createdAt=user["createdAt"]
    )
