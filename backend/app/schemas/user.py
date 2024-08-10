from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    is_pro: bool = False
    conversion_count: int = 0

class UserCreate(UserBase):
    email: EmailStr
    password: str

class UserInDBBase(UserBase):
    id: Optional[int] = None

    class Config:
        orm_mode = True

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str
