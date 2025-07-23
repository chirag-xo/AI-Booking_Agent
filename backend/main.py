from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import os
from datetime import datetime, timedelta
from typing import Dict, Any
import json

app = FastAPI(title="AI Booking Assistant API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Google OAuth configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:5173/auth/callback")

@app.post("/api/auth/google/callback")
async def google_oauth_callback(request_data: Dict[str, str]):
    """Exchange authorization code for access tokens"""
    code = request_data.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Authorization code required")
    
    # Exchange code for tokens
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": GOOGLE_REDIRECT_URI,
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=token_data)
        
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail="Failed to exchange code for tokens")
    
    return response.json()

@app.post("/api/calendar/events")
async def create_calendar_event(
    event_data: Dict[str, Any],
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create a Google Calendar event"""
    access_token = credentials.credentials
    
    # Google Calendar API endpoint
    calendar_url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(calendar_url, json=event_data, headers=headers)
    
    if response.status_code not in [200, 201]:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Failed to create calendar event: {response.text}"
        )
    
    return response.json()

@app.post("/api/calendar/freebusy")
async def check_calendar_availability(
    request_data: Dict[str, str],
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Check calendar availability using Google Calendar API"""
    access_token = credentials.credentials
    
    freebusy_url = "https://www.googleapis.com/calendar/v3/freeBusy"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
    }
    
    freebusy_data = {
        "timeMin": request_data["timeMin"],
        "timeMax": request_data["timeMax"],
        "items": [{"id": "primary"}]
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(freebusy_url, json=freebusy_data, headers=headers)
    
    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Failed to check availability: {response.text}"
        )
    
    data = response.json()
    # Check if the time slot is available (no busy periods)
    busy_periods = data.get("calendars", {}).get("primary", {}).get("busy", [])
    available = len(busy_periods) == 0
    
    return {"available": available, "busy_periods": busy_periods}

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)