from fastapi import FastAPI, Request, Form
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

app = FastAPI()

templates = Jinja2Templates(directory="app/templates")

app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "short_url": None}
    )

@app.post("/shorten")
def shorten_url(request: Request, long_url: str = Form(...)):
    # TEMP logic (replace later with DB logic)
    short_code = "abc123"
    short_url = f"http://localhost:8000/{short_code}"

    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "short_url": short_url,
            "long_url": long_url
        }
    )
