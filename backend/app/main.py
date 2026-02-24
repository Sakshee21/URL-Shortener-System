from fastapi import FastAPI
from app.db.database import Base, engine
from app.routes import auth
from app.models import user   

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Backend running successfully"}