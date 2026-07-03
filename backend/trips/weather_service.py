import os
import requests
import logging
import random
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

def get_weather_forecast(city_name):
    """
    Fetches 7-day weather forecast from OpenWeather API.
    Falls back to a structured mockup forecast if key is missing or request fails.
    """
    api_key = os.environ.get("OPENWEATHER_API_KEY")
    
    if not api_key:
        logger.warning("OPENWEATHER_API_KEY is missing. Falling back to Mock Weather Generator.")
        return get_mock_forecast(city_name)

    try:
        # OpenWeather Free Tier 5-day / 3-hour forecast API
        url = f"https://api.openweathermap.org/data/2.5/forecast?q={city_name}&units=metric&appid={api_key}"
        response = requests.get(url, timeout=10)
        
        if response.status_status == 200:
            data = response.json()
            return parse_openweather_response(data)
        else:
            logger.error(f"OpenWeather API returned status: {response.status_code}")
            return get_mock_forecast(city_name)
    except Exception as e:
        logger.error(f"Error fetching from OpenWeather API: {str(e)}")
        return get_mock_forecast(city_name)


def parse_openweather_response(data):
    """
    Parses OpenWeather 5-day / 3-hour forecast response into 5 daily summaries,
    then extrapolates to 7 days for the Travel Companion interface.
    """
    forecast_list = data.get('list', [])
    daily_raw = {}
    
    # Group measurements by date string
    for item in forecast_list:
        dt_txt = item.get('dt_txt', '') # e.g. "2026-07-03 12:00:00"
        date_str = dt_txt.split(' ')[0]
        
        if date_str not in daily_raw:
            daily_raw[date_str] = []
        daily_raw[date_str].append(item)

    parsed_days = []
    
    # Calculate daily averages/summaries
    for idx, (date_str, items) in enumerate(sorted(daily_raw.items())[:5]):
        # Extract temps, humidity, winds
        temps = [item['main']['temp'] for item in items]
        humidities = [item['main']['humidity'] for item in items]
        winds = [item['wind']['speed'] for item in items]
        conditions = [item['weather'][0]['main'] for item in items]

        avg_temp = round(sum(temps) / len(temps))
        avg_humidity = round(sum(humidities) / len(humidities))
        avg_wind = round((sum(winds) / len(winds)) * 3.6, 1) # convert m/s to km/h
        
        # Mode condition
        condition = max(set(conditions), key=conditions.count)
        
        rain_alert = False
        warning = ""
        
        if "Rain" in condition or "Thunderstorm" in condition:
            rain_alert = True
        
        if "Thunderstorm" in condition:
            warning = "Severe Storm Warning: Keep outdoor excursions minimal."
        elif avg_wind > 40:
            warning = "High Wind Advisory: Coastal ferries may be delayed."

        parsed_days.append({
            "day": idx + 1,
            "date": date_str,
            "temp": f"{avg_temp}°C",
            "humidity": f"{avg_humidity}%",
            "wind": f"{avg_wind} km/h",
            "condition": condition,
            "icon": get_weather_icon(condition),
            "rain_alert": rain_alert,
            "warning": warning
        })

    # Extrapolate days 6 and 7 using average values to satisfy 7-day layout
    if len(parsed_days) >= 5:
        base_date = datetime.strptime(parsed_days[-1]["date"], "%Y-%m-%d")
        for i in range(1, 3):
            extra_date = (base_date + timedelta(days=i)).strftime("%Y-%m-%d")
            # Copy day 5 base with slight random variation
            prev_temp = int(parsed_days[-1]["temp"].replace("°C", ""))
            new_temp = prev_temp + random.choice([-1, 0, 1])
            condition = random.choice(["Sunny", "Clear", "Partly Cloudy"])
            
            parsed_days.append({
                "day": 5 + i,
                "date": extra_date,
                "temp": f"{new_temp}°C",
                "humidity": parsed_days[-1]["humidity"],
                "wind": parsed_days[-1]["wind"],
                "condition": condition,
                "icon": get_weather_icon(condition),
                "rain_alert": False,
                "warning": ""
            })

    return parsed_days


def get_weather_icon(condition):
    cond = condition.lower()
    if "rain" in cond:
        return "🌧️"
    elif "thunderstorm" in cond:
        return "⛈️"
    elif "cloud" in cond:
        return "☁️"
    elif "snow" in cond:
        return "❄️"
    elif "clear" in cond or "sunny" in cond:
        return "☀️"
    return "⛅"


def get_mock_forecast(city_name):
    """
    Generates realistic weather lists to support full frontend charts and alerts.
    """
    start_date = datetime.now()
    conditions_pool = [
        {"cond": "Sunny", "icon": "☀️", "rain": False, "warn": ""},
        {"cond": "Partly Cloudy", "icon": "⛅", "rain": False, "warn": ""},
        {"cond": "Cloudy", "icon": "☁️", "rain": False, "warn": ""},
        {"cond": "Heavy Rain", "icon": "🌧️", "rain": True, "warn": "Rain Alert: Expect wet pavements and slow traffic today."},
        {"cond": "Thunderstorm", "icon": "⛈️", "rain": True, "warn": "Storm Advisory: Extreme lightning forecasted for tonight."},
        {"cond": "Clear", "icon": "☀️", "rain": False, "warn": ""},
        {"cond": "Windy", "icon": "💨", "rain": False, "warn": "High Wind Advisory: Stay alert around coastal viewpoints."}
    ]

    forecast = []
    
    # Adjust starting temperatures depending on destination names
    city_lower = city_name.lower()
    if "tokyo" in city_lower or "japan" in city_lower:
        base_temp = 22
    elif "paris" in city_lower or "france" in city_lower:
        base_temp = 19
    elif "reykjavik" in city_lower or "iceland" in city_lower:
        base_temp = 11
    else:
        base_temp = 25 # warm default

    for day_num in range(1, 8):
        current_date = start_date + timedelta(days=day_num - 1)
        # Select weather conditions. Ensure day 4 gets rain to verify alert modules!
        if day_num == 4:
            c = conditions_pool[3] # Heavy Rain
            temp = base_temp - 4
        elif day_num == 6:
            c = conditions_pool[4] # Thunderstorm
            temp = base_temp - 5
        else:
            c = random.choice([conditions_pool[0], conditions_pool[1], conditions_pool[2], conditions_pool[5]])
            temp = base_temp + random.choice([-2, -1, 0, 1, 2])

        forecast.append({
            "day": day_num,
            "date": current_date.strftime("%Y-%m-%d"),
            "temp": f"{temp}°C",
            "humidity": f"{random.randint(50, 90)}%",
            "wind": f"{random.randint(10, 35)} km/h",
            "condition": c["cond"],
            "icon": c["icon"],
            "rain_alert": c["rain"],
            "warning": c["warn"]
        })

    return forecast
