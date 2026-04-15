from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate
from app.utils.auth import get_current_user

router = APIRouter(prefix="/tasks")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    try:
        token = authorization.split(" ")[1]
    except:
        raise HTTPException(status_code=401, detail="Invalid token format")

    return get_current_user(token)

@router.post("/")
def create_task(task: TaskCreate, db: Session = Depends(get_db), user=Depends(get_user)):
    new_task = Task(
        title=task.title,
        description=task.description,
        user_id=user.id
    )
    db.add(new_task)
    db.commit()
    return {"message": "Task created"}

@router.get("/")
def get_tasks(db: Session = Depends(get_db), user=Depends(get_user)):
    tasks = db.query(Task).filter(Task.user_id == user.id).all()
    return tasks

@router.put("/{task_id}")
def update_task(task_id: int, updated: TaskUpdate, db: Session = Depends(get_db), user=Depends(get_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user.id).first()
    
    if not task:
        return {"error": "Task not found"}

    if updated.title is not None:
        task.title = updated.title
    if updated.description is not None:
        task.description = updated.description
    if updated.completed is not None:
        task.completed = updated.completed

    db.commit()
    return {"message": "Task updated"}

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), user=Depends(get_user)):
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user.id).first()

    if not task:
        return {"error": "Task not found"}

    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}