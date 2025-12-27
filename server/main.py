import os
import re
import json
import time
import random
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
current_dir = Path(__file__).resolve().parent
load_dotenv(current_dir / ".env")
load_dotenv(current_dir.parent / ".env")

app = FastAPI(title="Git-Roast Backend")

LOG_FILE = "backend_debug.log"
ACTIVE_MODEL = None  # <--- CACHE: Remembers the working model

def log_to_file(msg):
    with open(LOG_FILE, "a") as f:
        f.write(f"{msg}\n")
    print(msg)

log_to_file("BACKEND_STARTING_UP")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4321", "http://127.0.0.1:4321", "http://localhost:4322", "http://127.0.0.1:4322", "http://localhost:4323", "http://127.0.0.1:4323"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RoastRequest(BaseModel):
    repo_url: str

# --- 1. GITHUB HELPER (Unchanged) ---
def fetch_repo_content(owner: str, repo: str):
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "").strip()
    if GITHUB_TOKEN == "your_github_token_here": GITHUB_TOKEN = "" 

    headers = {"User-Agent": "Git-Roast-App/1.0"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"token {GITHUB_TOKEN}"

    def get_url(url):
        try:
            r = requests.get(url, headers=headers, timeout=10)
            if r.status_code in [401, 403, 404] and GITHUB_TOKEN:
                r = requests.get(url, headers={"User-Agent": "Git-Roast-App/1.0"}, timeout=10)
            return r
        except: return None

    content = ""
    r = get_url(f"https://api.github.com/repos/{owner}/{repo}/readme")
    if r and r.status_code == 200:
        try:
            dl_url = r.json()["download_url"]
            text = requests.get(dl_url).text
            content += f"--- README.md ---\n{text[:2500]}\n\n"
        except: pass

    queue = [(f"https://api.github.com/repos/{owner}/{repo}/contents", 0)]
    found = 0
    EXTS = ('.py', '.js', '.ts', '.jsx', '.tsx', '.go', '.rs', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.html', '.css')
    visited = set()
    
    while queue and found < 4:
        url, depth = queue.pop(0)
        if depth > 2 or url in visited: continue
        visited.add(url)
        r = get_url(url)
        if not r or r.status_code != 200: continue
        try:
            items = r.json()
            if not isinstance(items, list): continue
            for item in items:
                if item["type"] == "file" and item["name"].lower().endswith(EXTS):
                    try:
                        code = requests.get(item["download_url"]).text
                        if len(code) > 50:
                            content += f"--- {item['path']} ---\n{code[:1500]}\n\n"
                            found += 1
                            if found >= 4: break
                    except: pass
            if found < 4:
                for item in items:
                    if item["type"] == "dir": queue.append((item["url"], depth+1))
        except: pass

    if not content:
        raise HTTPException(status_code=422, detail="NO_CODE_FOUND")
    return content

# --- 2. OPTIMIZED AI HELPER ---
def get_working_model(api_key):
    """
    Finds a valid model. Used only when cache is empty or stale.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    try:
        res = requests.get(url, timeout=5)
        if res.status_code != 200: return "gemini-1.5-flash"
        
        data = res.json()
        models = data.get("models", [])
        priorities = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-pro"]
        
        for p in priorities:
            for m in models:
                if p in m["name"] and "generateContent" in m.get("supportedGenerationMethods", []):
                    return m["name"].replace("models/", "")
        
        for m in models:
            if "generateContent" in m.get("supportedGenerationMethods", []):
                return m["name"].replace("models/", "")
                
        return "gemini-1.5-flash"
    except: return "gemini-1.5-flash"

def call_gemini(api_key, prompt, model):
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "safetySettings": [
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"}
        ]
    }
    return requests.post(url, headers=headers, json=payload, timeout=40)

@app.post("/api/roast")
async def roast_repo(request: RoastRequest):
    global ACTIVE_MODEL
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key: raise HTTPException(status_code=503, detail="MISSING_API_KEY")

    try:
        # 1. Parse & Fetch (The cheap part)
        pattern = r"github\.com/([^/]+)/([^/]+)"
        match = re.search(pattern, request.repo_url)
        if not match: raise HTTPException(status_code=400, detail="BAD_URL")
        owner, repo = match.group(1), match.group(2).replace(".git", "")
        code_content = fetch_repo_content(owner, repo)

        # 2. Prepare Prompt
        prompt = f"""
        You are a rude, toxic Senior Engineer. Repo: {owner}/{repo}.
        ROAST THE CODE. Be mean. Use slang.
        Return ONLY valid JSON: {{ "roast": "string", "score": number }}
        Code: {code_content}
        """

        # 3. Smart Execution Loop (Cache + Retry)
        max_retries = 3
        for attempt in range(max_retries):
            # A. Load Model (Lazy Load)
            if not ACTIVE_MODEL:
                log_to_file("DEBUG: Finding best model...")
                ACTIVE_MODEL = get_working_model(api_key)
                log_to_file(f"DEBUG: Selected {ACTIVE_MODEL}")

            # B. Call API
            log_to_file(f"DEBUG: Sending roast request (Attempt {attempt+1})...")
            res = call_gemini(api_key, prompt, ACTIVE_MODEL)

            # C. Handle Success
            if res.status_code == 200:
                try:
                    raw_text = res.json()["candidates"][0]["content"]["parts"][0]["text"]
                    raw_text = raw_text.replace("```json", "").replace("```", "").strip()
                    return json.loads(raw_text)
                except:
                    return {"roast": raw_text, "score": 88}

            # D. Handle Errors
            error_msg = res.text
            
            # Case: 404 (Model Not Found) -> Clear Cache & Retry immediately
            if res.status_code == 404:
                log_to_file(f"DEBUG: Model {ACTIVE_MODEL} died (404). Resetting...")
                ACTIVE_MODEL = None
                continue # Try loop again, will find new model
            
            # Case: 429 (Rate Limit) -> Backoff & Retry
            if res.status_code == 429:
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2 + random.uniform(0, 1) # 2s, 4s...
                    log_to_file(f"DEBUG: Rate limit hit. Cooling down for {wait_time:.1f}s...")
                    time.sleep(wait_time)
                    continue
                else:
                    return {"roast": "I'm smoking! Too many requests. Wait 60s.", "score": 69}

            # Other errors -> Crash
            raise Exception(f"API Error {res.status_code}: {error_msg}")

    except HTTPException as e: raise e
    except Exception as e:
        log_to_file(f"CRITICAL ERROR: {e}")
        return {"roast": f"System Crash: {str(e)}", "score": 0}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)