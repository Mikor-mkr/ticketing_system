from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import UserCreate, Token
from app.services import auth_service

router = APIRouter(tags=["auth"])

@router.post("/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(user_create: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user_create.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed_password = auth_service.hash_password(user_create.password)
    user = User(
        username=user_create.username,
        hashed_password=hashed_password
        )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"msg": "User created successfully"}

@router.post("/auth/login", response_model=Token)
def login_user(user_create: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == user_create.username).first()
    if not user or not auth_service.verify_password(user_create.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = auth_service.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}