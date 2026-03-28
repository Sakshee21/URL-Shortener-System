from fastapi import FastAPI
from app.db.database import Base, engine
from app.routes import auth, url
from app.models import user, url as url_model
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(url.router)

@app.get("/")
def root():
    return {"message": "Backend running successfully"}