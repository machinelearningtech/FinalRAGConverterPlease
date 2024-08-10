from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app import crud, models, schemas
from app.api import deps
from app.core import security
from app.services import file_converter
from app.core.config import settings
from datetime import timedelta

auth_router = APIRouter()
users_router = APIRouter()
convert_router = APIRouter()

@auth_router.post("/login", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    user = crud.user.authenticate(db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@users_router.post("/", response_model=schemas.User)
def create_user(*, db: Session = Depends(deps.get_db), user_in: schemas.UserCreate):
    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = crud.user.create(db, obj_in=user_in)
    return user

@users_router.get("/me", response_model=schemas.User)
def read_user_me(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    return current_user

@users_router.post("/upgrade", response_model=schemas.User)
def upgrade_to_pro(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    if current_user.is_pro:
        raise HTTPException(status_code=400, detail="User is already a Pro member")
    user = crud.user.upgrade_to_pro(db, user=current_user)
    return user

@convert_router.post("/", response_model=schemas.ConversionResult)
async def convert_file(
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    if not current_user.is_pro and current_user.conversion_count >= settings.FREE_TIER_LIMIT:
        raise HTTPException(status_code=400, detail="Free tier conversion limit reached")
    
    result = await file_converter.convert_file(file, current_user.is_pro)
    
    if not current_user.is_pro:
        crud.user.increment_conversion_count(db, user=current_user)
    
    return result

router = APIRouter()
router.include_router(auth_router, prefix="/auth", tags=["auth"])
router.include_router(users_router, prefix="/users", tags=["users"])
router.include_router(convert_router, prefix="/convert", tags=["convert"])
