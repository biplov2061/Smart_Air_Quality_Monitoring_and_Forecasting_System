import os
import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Air Quality Intelligence API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY environment variable is missing.")

client = genai.Client(api_key=api_key)

# Request Model for Chatbot
class ChatRequest(BaseModel):
    message: str


# --------------------------------------------------------------------
# Synchronous Helper Function for Gemini Tool / Function Calling
# --------------------------------------------------------------------
def get_live_air_quality(city: str) -> str:
    """
    Fetches real-time Air Quality Index (AQI) and key pollutant data for a given city name.

    Args:
        city: The name of the city (e.g., 'Tokyo', 'London', 'New Delhi', 'Paris').
    """
    try:
        # Step 1: Get latitude and longitude from Open-Meteo Geocoding API
        geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json"
        geo_response = httpx.get(geo_url, timeout=5)
        geo_data = geo_response.json()

        if not geo_data.get("results"):
            return f"Error: City '{city}' could not be found."

        location = geo_data["results"][0]
        lat = location["latitude"]
        lon = location["longitude"]
        city_name = location.get("name")
        country = location.get("country", "")

        # Step 2: Fetch current Air Quality data from Open-Meteo
        aqi_url = (
            f"https://air-quality-api.open-meteo.com/v1/air-quality?"
            f"latitude={lat}&longitude={lon}&"
            f"current=us_aqi,european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,sulphur_dioxide"
        )
        aqi_response = httpx.get(aqi_url, timeout=5)
        aqi_data = aqi_response.json()

        if "current" not in aqi_data:
            return f"Error: Could not retrieve live AQI data for {city_name}."

        current = aqi_data["current"]

        # Step 3: Return formatted string context back to Gemini
        return (
            f"Live AQI Data for {city_name}, {country}:\n"
            f"- US AQI: {current.get('us_aqi')}\n"
            f"- European AQI: {current.get('european_aqi')}\n"
            f"- PM2.5: {current.get('pm2_5')} µg/m³\n"
            f"- PM10: {current.get('pm10')} µg/m³\n"
            f"- Nitrogen Dioxide (NO2): {current.get('nitrogen_dioxide')} µg/m³\n"
            f"- Ozone (O3): {current.get('ozone')} µg/m³\n"
            f"- Carbon Monoxide (CO): {current.get('carbon_monoxide')} µg/m³\n"
            f"- Sulphur Dioxide (SO2): {current.get('sulphur_dioxide')} µg/m³"
        )
    except Exception as e:
        return f"Failed to fetch live AQI data for {city}: {str(e)}"


# System prompt defining chatbot persona
SYSTEM_PROMPT = (
    "You are an AI Environmental Assistant for a Global Air Quality Intelligence and Forecasting System. "
    "When users ask for live AQI or pollution data for a city, use the 'get_live_air_quality' tool to get current numbers. "
    "Always provide health guidance based on the returned AQI level."
)

# --------------------------------------------------------------------
# 1. Chatbot Endpoint (Supports automatic Live AQI lookup)
# --------------------------------------------------------------------
@app.post("/api/v1/chat")
async def chat_with_gemini(request: ChatRequest):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    try:
        # Pass the tool function inside GenerateContentConfig
        response = client.models.generate_content(
            model="gemini-3.1-flash-lite",
            contents=request.message,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                tools=[get_live_air_quality],  # Gemini will call this automatically when needed
                temperature=0.7,
            )
        )
        return {"reply": response.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")


# --------------------------------------------------------------------
# 2. Direct REST Endpoint for Live AQI
# --------------------------------------------------------------------
@app.get("/api/v1/air-quality")
async def get_live_aqi_endpoint(city: str = Query(..., description="City name")):
    """
    Direct endpoint for fetching raw AQI JSON data (useful for dashboard widgets).
    """
    result = get_live_air_quality(city)
    if result.startswith("Error"):
        raise HTTPException(status_code=404, detail=result)
    return {"data": result}


# --------------------------------------------------------------------
# 3. Healthcheck Endpoint
# --------------------------------------------------------------------
@app.get("/")
def read_root():
    return {"status": "FastAPI Gemini AI Chatbot with Live Open-Meteo AQI Tools"}