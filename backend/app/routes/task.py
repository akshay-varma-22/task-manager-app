from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate
from app.utils.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])


# ---------------- DB Dependency ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- Auth Dependency ----------------
def get_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    try:
        scheme, token = authorization.split(" ")
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid auth scheme")
    except:
        raise HTTPException(status_code=401, detail="Invalid token format")

    return get_current_user(token)


# ---------------- CREATE TASK ----------------
@router.post("/")
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    user=Depends(get_user),
):
    new_task = Task(
        title=task.title,
        description=task.description,
        priority=task.priority,
        due_date=task.due_date,
        user_id=user.id,
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return {
        "message": "Task created successfully",
        "task": new_task,
    }


# ---------------- GET TASKS ----------------
@router.get("/")
def get_tasks(
    search: str = "",
    status: str = "",
    priority: str = "",
    db: Session = Depends(get_db),
    user=Depends(get_user)
):
    query = db.query(Task).filter(Task.user_id == user.id)

    if search:
        query = query.filter(Task.title.contains(search))

    if status == "completed":
        query = query.filter(Task.completed == True)
    elif status == "pending":
        query = query.filter(Task.completed == False)

    if priority:
        query = query.filter(Task.priority == priority)

    return query.all()


# ---------------- UPDATE TASK ----------------
@router.put("/{task_id}")
def update_task(
    task_id: int,
    updated: TaskUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_user),
):
    task = (
        db.query(Task)
        .filter(Task.id == task_id, Task.user_id == user.id)
        .first()
    )

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if updated.title is not None:
        task.title = updated.title

    if updated.description is not None:
        task.description = updated.description

    if updated.completed is not None:
        task.completed = updated.completed

    if updated.priority is not None:
        task.priority = updated.priority

    if updated.due_date is not None:
        task.due_date = updated.due_date

    db.commit()
    db.refresh(task)

    return {
        "message": "Task updated successfully",
        "task": task,
    }


# ---------------- DELETE TASK ----------------
@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_user),
):
    task = (
        db.query(Task)
        .filter(Task.id == task_id, Task.user_id == user.id)
        .first()
    )

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"message": "Task deleted successfully"}