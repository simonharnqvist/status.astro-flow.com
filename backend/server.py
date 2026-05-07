import json
import asyncio
import httpx
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn

app = FastAPI(title="AstroFlow Status")


def load_urls():
    with open("../config/urls.json") as f:
        return json.load(f)["urls"]


_client = httpx.AsyncClient(timeout=3.0, follow_redirects=True)


async def check_single_url(url: str):
    try:
        r = await _client.head(url, follow_redirects=True)
        if r.status_code < 400:
            return {"url": url, "status": "online", "code": r.status_code}
        else:
            return {"url": url, "status": "error", "code": r.status_code}
    except Exception as e:
        print(f"Error occurred while checking {url}: {e}")
        return {"url": url, "status": "offline", "code": None}


@app.get("/status")
async def status():
    urls = load_urls()
    tasks = [check_single_url(url["url"]) for url in urls]
    results = await asyncio.gather(*tasks)
    return {"urls": urls, "results": results}


app.mount("/config", StaticFiles(directory="../config"), name="config")


app.mount("/static", StaticFiles(directory="../frontend"), name="static")


@app.get("/")
def root():
    return FileResponse("../frontend/index.html")


if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
