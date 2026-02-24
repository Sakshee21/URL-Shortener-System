from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserLogin, Token, UserResponse
from app.services.auth_service import register_user, authenticate_user
from app.db.session import get_db
from app.dependencies.auth_dependencies import get_current_user
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    token = authenticate_user(
        db,
        form_data.username,   # username field
        form_data.password
    )
    return {"access_token": token, "token_type": "bearer"}



@router.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    return register_user(db, user.email, user.password)


@router.get("/me", response_model=UserResponse)
def get_me(current_user = Depends(get_current_user)):
    return current_user