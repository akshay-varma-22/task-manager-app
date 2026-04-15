from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.utils.auth import hash_password, verify_password, create_token

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    try:
        hashed = hash_password(user.password)
        new_user = User(email=user.email, password=hashed)

        db.add(new_user)
        db.commit()

        return {"message": "User created"}

    except Exception as e:
        print("ERROR:", e)   # 👈 THIS IS KEY
        return {"error": str(e)}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    
    if not db_user or not verify_password(user.password, db_user.password):
        return {"error": "Invalid credentials"}
    
    token = create_token({"sub": db_user.email})
    return {"access_token": token}