from __future__ import annotations

from fastapi import FastAPI

from .routes import router

app = FastAPI(title="Conference Tracker API", version="1.0.0")
app.include_router(router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api.main:app", host="0.0.0.0", port=8460, reload=True)
