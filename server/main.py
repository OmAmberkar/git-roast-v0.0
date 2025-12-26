import os
import re
import json
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Git-Roast Backend")

LOG_FILE = "backend_debug.log"

def log_to_file(msg):
    with open(LOG_FILE, "a") as f:
        f.write(f"{msg}\n")
    print(msg)

log_to_file("BACKEND_STARTING_UP")

# Setup CORS to allow requests from Astro frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4321", "http://127.0.0.1:4321"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request, call_next):
    log_to_file(f"DEBUG: INCOMING: {request.method} {request.url}")
    response = await call_next(request)
    log_to_file(f"DEBUG: OUTGOING: {response.status_code}")
    return response

# Configure Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("[WARNING] GEMINI_API_KEY not found in environment")
else:
    genai.configure(api_key=GEMINI_API_KEY)

class RoastRequest(BaseModel):
    repo_url: str

def parse_github_url(url: str):
    """
    Parses a GitHub URL into owner and repo name.
    Example: https://github.com/torvalds/linux -> ('torvalds', 'linux')
    """
    pattern = r"github\.com/([^/]+)/([^/]+)"
    match = re.search(pattern, url)
    if not match:
        raise HTTPException(status_code=400, detail="INVALID_GITHUB_URL")
    
    owner = match.group(1)
    repo = match.group(2).replace(".git", "")
    return owner, repo

def fetch_repo_content(owner: str, repo: str):
    """
    Fetches README and a few code files from GitHub using the public API.
    """
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "").strip()
    if GITHUB_TOKEN == "your_github_token_here":
        GITHUB_TOKEN = "" # Reset if it's just the template value

    base_headers = {"User-Agent": "Git-Roast-App/1.0"}
    auth_headers = {**base_headers, "Authorization": f"token {GITHUB_TOKEN}"} if GITHUB_TOKEN else base_headers

    def github_get(url, use_auth=True):
        current_headers = auth_headers if use_auth else base_headers
        log_to_file(f"DEBUG: GITHUB_REQ: {url} (Auth: {use_auth})")
        try:
            res = requests.get(url, headers=current_headers, timeout=10)
            log_to_file(f"DEBUG: GITHUB_RES: {res.status_code}")
            
            # If auth fails OR if a public file is hidden by a bad token (returns 404)
            if res.status_code in [401, 403, 404] and use_auth:
                log_to_file(f"DEBUG: Request failed ({res.status_code}) with auth, retrying without auth...")
                return github_get(url, use_auth=False)
            return res
        except Exception as e:
            log_to_file(f"DEBUG: Request failed: {str(e)}")
            return None

    content = ""

    # 1. Fetch README
    readme_url = f"https://api.github.com/repos/{owner}/{repo}/readme"
    r = github_get(readme_url)
    if r and r.status_code == 200:
        readme_data = r.json()
        # Use simple get for raw content, but with User-Agent
        raw_res = github_get(readme_data["download_url"])
        if raw_res and raw_res.status_code == 200:
            content += f"--- README.md ---\n{raw_res.text[:2000]}\n\n"
    elif r:
        log_to_file(f"DEBUG: Readme status: {r.status_code}")

    # 2. Fetch file list and pick a code file
    contents_url = f"https://api.github.com/repos/{owner}/{repo}/contents"
    r = github_get(contents_url)
    
    if r and r.status_code == 200:
        files = r.json()
        code_files = [f for f in files if f["type"] == "file" and f["name"].lower().endswith(('.py', '.js', '.ts', '.jsx', '.tsx', '.go', '.rs', '.java', '.cpp', '.c', '.h', '.cs', '.php', '.rb'))]
        
        log_to_file(f"DEBUG: Found {len(code_files)} potential code files")
        
        if not code_files:
            dirs = [f for f in files if f["type"] == "dir" and not f["name"].startswith('.')]
            if dirs:
                log_to_file(f"DEBUG: No files in root, looking into {dirs[0]['name']}")
                r_sub = github_get(dirs[0]["url"])
                if r_sub and r_sub.status_code == 200:
                    sub_files = r_sub.json()
                    code_files += [f for f in sub_files if f["type"] == "file" and f["name"].lower().endswith(('.py', '.js', '.ts', '.jsx', '.tsx', '.go', '.rs', '.java', '.cpp', '.c', '.h', '.cs', '.php', '.rb'))]

        for file in code_files[:3]:
            f_res = github_get(file["download_url"])
            if f_res and f_res.status_code == 200:
                content += f"--- {file['name']} ---\n{f_res.text[:1500]}\n\n"
    elif r:
        if r.status_code == 404:
            raise HTTPException(status_code=404, detail="REPO_NOT_FOUND_OR_PRIVATE")
        elif r.status_code == 403:
            raise HTTPException(status_code=403, detail="GITHUB_RATE_LIMIT_EXCEEDED")

    if not content:
        log_to_file(f"DEBUG: CONTENT_FETCH_FAILED for {owner}/{repo}")
        raise HTTPException(status_code=502, detail=f"COULD_NOT_FETCH_GITHUB_CONTENT (Are there any code files?)")
        
    log_to_file(f"DEBUG: CONTENT_FETCH_SUCCESS for {owner}/{repo}")
    return content
        
    log_to_file(f"DEBUG: CONTENT_FETCH_SUCCESS for {owner}/{repo}")
    return content

@app.get("/")
async def root():
    return {"message": "GIT_ROAST_BACKEND_ALIVE", "status": "READY_FOR_DESTRUCTION"}

@app.post("/api/roast")
async def roast_repo(request: RoastRequest):
    print(f"DEBUG: Received request for {request.repo_url}")
    try:
        owner, repo = parse_github_url(request.repo_url)
        repo_text = fetch_repo_content(owner, repo)
        
        # Configure Gemini model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are a rude, toxic Senior Engineer who hate bad code.
        Here is the code/readme from the repository: {owner}/{repo}.
        
        ROAST IT. Be specific about the bad practices, terrible variable names, or lack of documentation you see.
        Don't hold back. Use developer slang.
        
        Return ONLY a JSON object with this exact structure:
        {{
            "roast": "your toxic roast here",
            "score": number (between 0 and 100, where 100 is pure trash)
        }}
        
        Code Content:
        {repo_text}
        """

        try:
            # Note: gemini-2.0-flash had 0 quota. Trying gemini-flash-latest or gemini-pro-latest
            model_names = ['gemini-flash-latest', 'gemini-1.5-flash', 'gemini-pro-latest']
            response = None
            last_err = None
            
            for model_name in model_names:
                try:
                    log_to_file(f"DEBUG: Attempting with model: {model_name}")
                    model = genai.GenerativeModel(model_name)
                    response = model.generate_content(prompt)
                    log_to_file(f"DEBUG: Successfully triggered {model_name}")
                    break
                except Exception as e:
                    last_err = str(e)
                    log_to_file(f"DEBUG: Model {model_name} failed: {last_err}")
            
            if not response:
                raise Exception(f"All models failed. Last error: {last_err}")

            # Extract JSON from response
            res_text = response.text
            log_to_file(f"DEBUG: Gemini raw response: {res_text[:200]}...")
            # Find JSON block if Gemini wrapped it in markdown
            json_match = re.search(r"\{.*\}", res_text, re.DOTALL)
            if json_match:
                roast_json = json.loads(json_match.group())
            else:
                roast_json = json.loads(res_text)
            return roast_json
        except Exception as ai_err:
            log_to_file(f"DEBUG: Gemini API error: {str(ai_err)}")
            # Fallback if AI fails but we have content
            return {
                "roast": "The destruction was too intense even for the AI. Your code is a black hole of despair.",
                "score": 99
            }

    except HTTPException as e:
        log_to_file(f"DEBUG: HTTP Error {e.status_code}: {e.detail}")
        raise e
    except Exception as e:
        log_to_file(f"DEBUG: Internal error during roast: {str(e)}")
        import traceback
        log_to_file(traceback.format_exc())
        raise HTTPException(status_code=500, detail="DESTRUCTION_CORE_FAILURE")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)
