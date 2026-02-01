INTENTS = {
    "life_story": ["life story", "about yourself", "background", "tell me about you"],
    "superpower": ["superpower", "strength", "best skill"],
    "growth": ["grow", "improve", "weakness"],
    "misconception": ["misconception", "people think", "coworkers think"],
    "boundaries": ["push limits", "comfort zone", "boundaries"]
}

def detect_intent(text):
    text = text.lower()
    for intent, keywords in INTENTS.items():
        for k in keywords:
            if k in text:
                return intent
    return "unknown"
