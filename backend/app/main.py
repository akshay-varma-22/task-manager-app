from fastapi import FastAPI
from app.database import Base, engine
from app.routes import auth

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)

@app.get("/")
def home():
    return {"message": "Task Manager Backend Running 🚀"}