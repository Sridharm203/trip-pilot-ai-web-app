import os
import json
import logging
from datetime import datetime
import google.generativeai as genai

logger = logging.getLogger(__name__)

def generate_trip_itinerary(destination, budget, start_date, end_date, num_travelers, travel_type, interests):
    """
    Takes user inputs from React frontend and sends them to the Gemini API.
    If the API key is missing or the call fails, it automatically returns structured mock data.
    """
    # Fetch the Gemini API key from environment variables
    api_key = os.environ.get("GEMINI_API_KEY")
    
    # Fallback to Mock Data generator if the API key is missing
    if not api_key:
        logger.warning("GEMINI_API_KEY missing! Falling back to Mock Generator.")
        return get_mock_itinerary(destination, budget, start_date, end_date, num_travelers, travel_type, interests)

    try:
        # Configure the Gemini API client
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')

        # Convert the interests list into a single comma-separated string
        interest_list = ", ".join(interests) if interests else "Sightseeing, Local Food"
        
        prompt = f"""
        You are an AI Travel Companion. Create a detailed travel itinerary based on:
        Destination: {destination}
        Total Budget: ${budget}
        Dates: {start_date} to {end_date}
        Number of Travelers: {num_travelers}
        Travel Type: {travel_type}
        Interests: {interest_list}

        Return the response STRICTLY as a JSON object matching this schema format:
        {{
          "summary": "Short paragraph summarizing the trip theme",
          "itinerary": [
            {{
              "day": 1,
              "theme": "Day focus",
              "activities": [
                {{ "time": "09:00 AM", "title": "Activity name", "description": "details", "cost": "$15" }}
              ]
            }}
          ],
          "hotels": [
            {{ "name": "Hotel name", "rating": "4.5/5", "price_range": "$$", "description": "review", "why_recommend": "reason" }}
          ],
          "restaurants": [
            {{ "name": "Restaurant name", "cuisine": "style", "price_range": "$$", "description": "review", "why_recommend": "reason" }}
          ],
          "transport": [
            {{ "type": "Metro", "description": "how to move", "cost_estimate": "$10" }}
          ],
          "things_to_do": [
            {{ "title": "Place name", "description": "why famous" }}
          ],
          "travel_tips": ["Tip 1", "Tip 2"]
        }}

        Ensure budget allocations align with ${budget}. Use real places in {destination}. Return ONLY raw JSON object.
        """

        # Call Gemini API and request a structured JSON response
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        # Parse the JSON text into a Python dictionary to return to the frontend
        return json.loads(response.text.strip())

    except Exception as e:
        logger.error(f"Gemini error: {str(e)}. Falling back to Mock Generator.")
        return get_mock_itinerary(destination, budget, start_date, end_date, num_travelers, travel_type, interests)


def get_mock_itinerary(destination, budget, start_date, end_date, num_travelers, travel_type, interests):
    """
    Generates hardcoded static data if the API fails, preventing the React UI from crashing.
    """
    # Calculate the total number of travel days
    try:
        s_date = datetime.strptime(str(start_date), "%Y-%m-%d")
        e_date = datetime.strptime(str(end_date), "%Y-%m-%d")
        days_count = max(1, (e_date - s_date).days + 1)
    except Exception:
        days_count = 3

    dest_lower = destination.lower()
    
    # Static data block for Tokyo city trips
    if "tokyo" in dest_lower:
        mock_summary = f"An immersion into the electric neon streets of Tokyo for a budget of ${budget}."
        mock_hotels = [{"name": "Shinjuku Granbell Hotel", "rating": "4.2/5", "price_range": "$$", "description": "Trendy hotel.", "why_recommend": "Central location."}]
        mock_restaurants = [{"name": "Ichiran Ramen", "cuisine": "Ramen", "price_range": "$", "description": "Classic Tonkotsu.", "why_recommend": "Iconic local style."}]
        mock_transport = [{"type": "Suica Pass", "description": "Prepaid metro card.", "cost_estimate": "$10 daily"}]
        mock_things_to_do = [{"title": "Senso-ji Temple", "description": "Tokyo's oldest temple."}]
        mock_tips = ["Buy an eSIM at the airport.", "Tipping is strictly not customary."]

    # Static data block for Japan country-level trips
    elif "japan" in dest_lower:
        mock_summary = f"A scenic journey across Japan, from historic temples in Kyoto to the modern skylines of Tokyo for a budget of ${budget}."
        mock_hotels = [{"name": "Traditional Ryokan Iwaso", "rating": "4.8/5", "price_range": "$$$", "description": "A classic ryokan in Miyajima.", "why_recommend": "Traditional tatami rooms and hot spring baths."}]
        mock_restaurants = [{"name": "Local Izakayas", "cuisine": "Japanese Pub Food", "price_range": "$$", "description": "Authentic neighborhood dining spots.", "why_recommend": "Perfect for trying local sake and small plates."}]
        mock_transport = [{"type": "Japan Rail Pass", "description": "Unlimited travel on the Shinkansen bullet trains.", "cost_estimate": "$300 for 7 days"}]
        mock_things_to_do = [{"title": "Mount Fuji Viewpoint", "description": "Witness Japan's iconic snow-capped peak."}, {"title": "Fushimi Inari Shrine", "description": "Walk through thousands of vibrant red torii gates."}]
        mock_tips = ["Always keep some cash, as smaller shops do not accept credit cards.", "Do not tip at restaurants, as it is considered impolite."]

    # Static data block for Paris city trips
    elif "paris" in dest_lower:
        mock_summary = f"A romantic getaway in Paris, balancing neighborhood bistros with legendary museums."
        mock_hotels = [{"name": "Hotel Caron de Beaumarchais", "rating": "4.6/5", "price_range": "$$", "description": "Charming Parisian vibe.", "why_recommend": "Close to Louvre."}]
        mock_restaurants = [{"name": "L'As du Fallafel", "cuisine": "Middle Eastern", "price_range": "$", "description": "Legendary falafel.", "why_recommend": "Best budget eats."}]
        mock_transport = [{"type": "Paris Metro", "description": "Efficient subway line.", "cost_estimate": "$2.30 per ticket"}]
        mock_things_to_do = [{"title": "Eiffel Tower Picnic", "description": "Relax on the Champ de Mars lawn."}]
        mock_tips = ["Book Louvre tickets weeks in advance.", "Say 'Bonjour' when entering any shop."]

    # Static data block for France country-level trips
    elif "france" in dest_lower:
        mock_summary = f"A grand tour of France, exploring historic châteaux, world-class vineyards, and cultural landmarks for a budget of ${budget}."
        mock_hotels = [{"name": "Château de la Bourdaisière", "rating": "4.7/5", "price_range": "$$$", "description": "A historic château hotel in the Loire Valley.", "why_recommend": "Experience classic French estate living."}]
        mock_restaurants = [{"name": "La Mère Poulard", "cuisine": "Traditional French", "price_range": "$$", "description": "Famous historic restaurant in Mont Saint-Michel.", "why_recommend": "World-renowned wood-fire soufflé omelets."}]
        mock_transport = [{"type": "SNCF TGV Train Pass", "description": "High-speed rail system connecting all regions.", "cost_estimate": "$45 per trip"}]
        mock_things_to_do = [{"title": "Palace of Versailles", "description": "The epic center of French royal history."}, {"title": "Mont Saint-Michel", "description": "Stunning medieval island abbey."}]
        mock_tips = ["Validate your train tickets before boarding.", "Learn a few basic French phrases like 'S'il vous plaît' and 'Merci'."]

    # Default fallback data block for all other destinations
    else:
        mock_summary = f"An optimized multi-day trip to {destination} featuring local cultural sights."
        mock_hotels = [{"name": "Central Plaza Lodge", "rating": "4.3/5", "price_range": "$$", "description": "Safe neighborhood hotel.", "why_recommend": "Friendly staff."}]
        mock_restaurants = [{"name": "The Local Spoon", "cuisine": "Traditional Local", "price_range": "$$", "description": "Cozy cafe.", "why_recommend": "Pocket-friendly."}]
        mock_transport = [{"type": "Public Buses & Trains", "description": "Standard transit.", "cost_estimate": "$2-$3 per ride"}]
        mock_things_to_do = [{"title": "Old Town Square", "description": "Vibrant pedestrian hub."}]
        mock_tips = ["Keep some local physical currency.", "Download local offline maps."]

    # Use a loop to dynamically generate day schedules based on the computed day count
    mock_itinerary = []
    for day in range(1, days_count + 1):
        if day == 1:
            theme = "Arrival and Exploration"
            if "tokyo" in dest_lower:
                acts = [
                    {"time": "10:00 AM", "title": "Check-in at Hotel in Shinjuku", "description": "Drop off bags.", "cost": "Free"},
                    {"time": "02:00 PM", "title": "Shinjuku Gyoen National Garden Walk", "description": "Stroll in peaceful scenery.", "cost": "Free"}
                ]
            elif "japan" in dest_lower:
                acts = [
                    {"time": "10:00 AM", "title": "Check-in at Traditional Ryokan", "description": "Relax and drink green tea.", "cost": "Free"},
                    {"time": "02:00 PM", "title": "Historic Temple Walk", "description": "Explore local streets and gardens.", "cost": "Free"}
                ]
            elif "paris" in dest_lower:
                acts = [
                    {"time": "10:00 AM", "title": "Check-in at Hotel", "description": "Drop off bags.", "cost": "Free"},
                    {"time": "02:00 PM", "title": "Latin Quarter Walk", "description": "Explore historic Parisian avenues.", "cost": "Free"}
                ]
            elif "france" in dest_lower:
                acts = [
                    {"time": "10:00 AM", "title": "Check-in at Château de la Bourdaisière", "description": "Drop off bags.", "cost": "Free"},
                    {"time": "02:00 PM", "title": "Loire Valley Gardens", "description": "Explore the beautiful chateau grounds.", "cost": "Free"}
                ]
            else:
                acts = [
                    {"time": "10:00 AM", "title": "Check-in at Hotel", "description": "Drop off bags.", "cost": "Free"},
                    {"time": "02:00 PM", "title": "Old Town Walk", "description": "Explore central streets.", "cost": "Free"}
                ]
        elif day == days_count:
            theme = "Farewell Sights"
            acts = [
                {"time": "09:00 AM", "title": "Local Market Shopping", "description": "Pick up souvenirs.", "cost": "Varies"},
                {"time": "06:00 PM", "title": "Departure Prep", "description": "Head back to station/airport.", "cost": "Varies"}
            ]
        else:
            theme = "Deep Dive Adventures"
            if "tokyo" in dest_lower:
                acts = [
                    {"time": "09:00 AM", "title": "Senso-ji Temple Visit", "description": "Explore Tokyo's oldest temple.", "cost": "Free"},
                    {"time": "01:00 PM", "title": "Shibuya Crossing & Hachiko", "description": "Experience Shibuya's bustling vibe.", "cost": "Free"}
                ]
            elif "japan" in dest_lower:
                acts = [
                    {"time": "09:00 AM", "title": "Bullet Train to Mount Fuji Viewpoint", "description": "Enjoy scenic views of Japan's peak.", "cost": "$35"},
                    {"time": "02:00 PM", "title": "Fushimi Inari Shrine Hike", "description": "Walk through thousands of red torii gates.", "cost": "Free"}
                ]
            elif "paris" in dest_lower:
                acts = [
                    {"time": "09:00 AM", "title": "Louvre Museum Tour", "description": "See the Mona Lisa and famous art.", "cost": "$22"},
                    {"time": "02:00 PM", "title": "Eiffel Tower Picnic", "description": "Picnic on Champ de Mars lawns.", "cost": "Free"}
                ]
            elif "france" in dest_lower:
                acts = [
                    {"time": "09:00 AM", "title": "Palace of Versailles Grand Tour", "description": "See the Hall of Mirrors.", "cost": "$20"},
                    {"time": "03:00 PM", "title": "Mont Saint-Michel Abbey Hike", "description": "Explore the historic medieval abbey.", "cost": "$12"}
                ]
            else:
                acts = [
                    {"time": "09:00 AM", "title": "Top Museum Visit", "description": "Explore local art collections.", "cost": "$15"}
                ]
        
        mock_itinerary.append({
            "day": day,
            "theme": theme,
            "activities": acts
        })


    # Return structured full data object to the frontend matching expected types
    return {
        "summary": mock_summary,
        "itinerary": mock_itinerary,
        "hotels": mock_hotels,
        "restaurants": mock_restaurants,
        "transport": mock_transport,
        "things_to_do": mock_things_to_do,
        "travel_tips": mock_tips
    }


def generate_packing_checklist(destination, days, travel_style):
    """
    Generates a personalized JSON packing list based on trip style and duration.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return get_mock_packing_checklist(destination, days, travel_style)
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Generate a packing checklist for a trip to {destination} for {days} days. Style: {travel_style}.
        Return strictly as a JSON list matching this format:
        [
          {{ "id": 1, "category": "Clothes", "name": "Light jacket", "packed": false }},
          {{ "id": 2, "category": "Documents", "name": "Passport", "packed": false }}
        ]
        Categories must only be: "Clothes", "Documents", "Medicines", or "Electronics". Give 3 items per category.
        """
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text.strip())
    except Exception as e:
        logger.error(f"Error packing checklist: {str(e)}")
        return get_mock_packing_checklist(destination, days, travel_style)


def get_mock_packing_checklist(destination, days, travel_style):
    """
    Returns a generic fallback packing list if the API fails.
    """
    return [
        {"id": 1, "category": "Clothes", "name": f"Daily clothes for {days} days", "packed": False},
        {"id": 2, "category": "Clothes", "name": "Comfortable walking shoes", "packed": False},
        {"id": 3, "category": "Documents", "name": "Passport & ID cards", "packed": False},
        {"id": 4, "category": "Medicines", "name": "First-aid essentials", "packed": False},
        {"id": 5, "category": "Electronics", "name": "Mobile phone & charger", "packed": False}
    ]


def replan_itinerary(current_itinerary, current_budget, disruption_type, details):
    """
    Dynamically recalculates schedules or indoor swaps if a travel disruption occurs.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return get_mock_replanned_itinerary(current_itinerary, current_budget, disruption_type, details)
        
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        An unexpected disruption occurred. Re-plan this travel itinerary:
        Disruption: {disruption_type} ({details})
        Current Budget: ${current_budget}
        Current Itinerary JSON: {json.dumps(current_itinerary)}

        Rules:
        - heavy_rain: Swap outdoor spots with indoor alternative names.
        - budget_exceeded: Replace premium options with free/cheap spots.
        - place_closed: Swap closed attraction with another local landmark.

        Return strictly an updated JSON object matching this schema:
        {{
          "itinerary": [
            {{ "day": 1, "theme": "Updated Theme", "activities": [ {{ "time": "Time", "title": "New Title", "description": "swapped due to disruption", "cost": "$0" }} ] }}
          ],
          "budget": 1000.00
        }}
        """
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text.strip())
    except Exception as e:
        logger.error(f"Error replanning: {str(e)}")
        return get_mock_replanned_itinerary(current_itinerary, current_budget, disruption_type, details)


def get_mock_replanned_itinerary(current_itinerary, current_budget, disruption_type, details):
    """
    Performs deterministic local adjustments on the itinerary parameters when offline.
    """
    updated_itinerary = list(current_itinerary)
    updated_budget = float(current_budget)
    
    if disruption_type == 'heavy_rain':
        for day_plan in updated_itinerary:
            day_plan["theme"] = "Cozy Indoor Sights (Weather Adapted)"
            for act in day_plan.get("activities", []):
                act["title"] = "Metropolitan Fine Arts Museum (Indoor)"
                act["description"] = "Adjusted due to heavy rain. Explore premium painting galleries."
                act["cost"] = "$10"
    elif disruption_type == 'budget_exceeded':
        updated_budget = round(updated_budget * 0.75, 2)
        for day_plan in updated_itinerary:
            for act in day_plan.get("activities", []):
                act["title"] = f"{act['title']} (Budget Choice)"
                act["cost"] = "Free"
    elif disruption_type == 'place_closed':
        for day_plan in updated_itinerary:
            for act in day_plan.get("activities", []):
                act["title"] = "Alternative Landmark Replacement"
                act["description"] = f"Original spot closed ({details}). Swapped for safety."
                act["cost"] = "Free"
                    
    return {"itinerary": updated_itinerary, "budget": updated_budget}


def ask_local_guide(destination, travel_type, query):
    """
    Answers freeform conversational text queries from the user with custom local suggestions.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return get_mock_guide_recommendation(destination, travel_type, query)
        
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are a local travel guide in {destination} for a {travel_type} traveler.
        Answer this query: "{query}"
        Provide specific names of cafes, restaurants, or spots. Format response in markdown with bullet points. Under 200 words.
        """
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error local guide: {str(e)}")
        return get_mock_guide_recommendation(destination, travel_type, query)


def get_mock_guide_recommendation(destination, travel_type, query):
    """
    Provides mock local guidelines depending on matched keywords in the query string.
    """
    q = query.lower()
    if "cafe" in q:
        return f"### Recommended Cafes in {destination}\n- **The Golden Bean**: Charming rustic aesthetic with amazing pour-overs.\n- **Velvet Brews**: Highly rated pastries."
    elif "hidden" in q:
        return f"### Off-the-beaten-path Sights in {destination}\n- **Whispering Stone Alley**: A quiet historic pathway.\n- **Green Canopy Vista**: Small hill path offering panoramic views."
    else:
        return f"### AI Local Guide for {destination}\nRegarding: *\"{query}\"*\n\n1. **Culinary Tip**: Local food stalls offer authentic flavors at cheap price.\n2. **Best Time**: Early mornings are perfect to avoid city crowd."


def analyze_budget_expenses(total_budget, expense_list):
    """
    Audits the current trip logs and outputs actionable cash-saving markdown summaries.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return get_mock_budget_analysis(total_budget, expense_list)
        
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Audit these trip expenses against a budget of ${total_budget}:
        Expenses: {json.dumps(expense_list)}
        Summarize spending percentages, highlight overspending, and give 2 tips to save money. Under 150 words using markdown.
        """
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error budget analysis: {str(e)}")
        return get_mock_budget_analysis(total_budget, expense_list)


def get_mock_budget_analysis(total_budget, expense_list):
    """
    Calculates numerical metrics locally to display mock budget details when offline.
    """
    total_spent = sum(float(exp.get('amount', 0)) for exp in expense_list)
    if not expense_list:
        return "### AI Budget Audit\nNo expenses logged yet! Add expenses to analyze."
        
    breakdown = []
    for exp in expense_list:
        cat = exp.get('category', 'Other')
        amt = float(exp.get('amount', 0))
        pct = round((amt / total_budget) * 100) if total_budget > 0 else 0
        breakdown.append(f"- **{cat}**: ${amt} ({pct}%)")
        
    analysis_text = "### AI Budget Audit\nBreakdown:\n" + "\n".join(breakdown)
    remaining = float(total_budget) - total_spent
    
    if remaining < 0:
        analysis_text += f"\n\n⚠️ **Exceeded budget by ${abs(remaining)}!**\nTip: Swap rental cabs for public metros."
    else:
        analysis_text += f"\n\n👍 You have **${remaining}** remaining."
        
    return analysis_text


def generate_journal_story(destination, title, image_data=None):
    """
    Multimodal Vision interface: Generates text context summaries based on image descriptors.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return get_mock_journal_story(destination, title)

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Write a first-person travel story (100 words) for a photo titled "{title}" from {destination}.
        Return strictly as a JSON object matching this schema format:
        {{
          "content": "story text...",
          "caption": "one sentence social media caption",
          "summary": "one brief memory sentence"
        }}
        """
        
        if image_data:
            image_part = {'mime_type': 'image/jpeg', 'data': image_data}
            response = model.generate_content([prompt, image_part], generation_config={"response_mime_type": "application/json"})
        else:
            response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            
        return json.loads(response.text.strip())
    except Exception as e:
        logger.error(f"Error image story: {str(e)}")
        return get_mock_journal_story(destination, title)


def get_mock_journal_story(destination, title):
    """
    Returns standard fallback journal content when vision capabilities are offline.
    """
    return {
        "content": f"Exploring {destination} was magical, and capturing '{title}' was the perfect memory.",
        "caption": f"Lost in the beauty of {destination} ✨ #{title.replace(' ', '')}",
        "summary": f"Logged a beautiful memory at {destination}."
    }