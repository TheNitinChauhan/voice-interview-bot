from dotenv import load_dotenv
load_dotenv(dotenv_path=".env")


from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from openai import OpenAI
from prompts import SYSTEM_PROMPT
from intents import detect_intent
from answers import ANSWERS
import os




app = FastAPI()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def home():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    user_text = data.get("message", "")

    intent = detect_intent(user_text)

    if intent in ANSWERS:
        return JSONResponse({"reply": ANSWERS[intent]})

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_text}
        ]
    )

    reply = response.choices[0].message.content
    return JSONResponse({"reply": reply})
