import json
import asyncio
import httpx
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
from typing import Optional

app = FastAPI(title="AstroFlow Status")


_client = httpx.AsyncClient(timeout=10)


async def check_url(url: str):
    try:
        r = await _client.get(url, follow_redirects=True)
        if r.status_code < 400:
            return {"url": url, "status": "online", "code": r.status_code}
        else:
            return {"url": url, "status": "error", "code": r.status_code}
    except Exception as e:
        print(f"Error checking {url}: {e}")
        return {"url": url, "status": "offline", "code": None}


@app.get("/status")
async def status(url: str):
    return await check_url(url)


app.mount("/config", StaticFiles(directory="../config"), name="config")


app.mount("/static", StaticFiles(directory="../frontend"), name="static")


@app.get("/")
def root():
    return FileResponse("../frontend/index.html")


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
