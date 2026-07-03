import os
import json
import logging
from datetime import datetime
import google.generativeai as genai

logger = logging.getLogger(__name__)

def generate_trip_itinerary(destination, budget, start_date, end_date, num_travelers, travel_type, interests):
    """
    Calls the Gemini API to generate a structured JSON itinerary.
    Falls back to a rich mockup generation if the API key is missing or request fails.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    
    if not api_key:
        logger.warning("GEMINI_API_KEY environment variable is missing. Falling back to Mock Generator.")
        return get_mock_itinerary(destination, budget, start_date, end_date, num_travelers, travel_type, interests)

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')

        prompt = f"""
        You are a highly capable AI Travel Companion. Create a detailed, personalized travel itinerary based on:
        Destination: {destination}
        Total Budget: ${budget}
        Dates: {start_date} to {end_date}
        Number of Travelers: {num_travelers}
        Travel Type: {travel_type}
        Interests: {", ".join(interests) if interests else "Sightseeing, Local Food"}

        Generate the response strictly as a JSON object matching this schema:
        {{
          "summary": "Short paragraph summarizing the overall style and theme of the trip",
          "itinerary": [
            {{
              "day": 1,
              "theme": "Day theme or focus",
              "activities": [
                {{
                  "time": "Time of activity (e.g. 09:00 AM)",
                  "title": "Activity name",
                  "description": "Brief details of what to see or do",
                  "cost": "Estimated cost (e.g. $15 or Free)"
                }}
              ]
            }}
          ],
          "hotels": [
            {{
              "name": "Hotel name",
              "rating": "Rating description (e.g. 4.5/5)",
              "price_range": "Price indicator (e.g. $, $$, $$$)",
              "description": "Short lodging review",
              "why_recommend": "Why this fits this user profile"
            }}
          ],
          "restaurants": [
            {{
              "name": "Restaurant name",
              "cuisine": "Cuisine style",
              "price_range": "Price indicator (e.g. $, $$, $$$)",
              "description": "Short dining review",
              "why_recommend": "Why this fits this traveler preference"
            }}
          ],
          "transport": [
            {{
              "type": "e.g. Public Transit, Walking, Rental Car",
              "description": "How to move around the city",
              "cost_estimate": "Estimated price range"
            }}
          ],
          "things_to_do": [
            {{
              "title": "Points of Interest Name",
              "description": "Brief details on what makes it famous"
            }}
          ],
          "travel_tips": [
            "Tip 1...", "Tip 2..."
          ]
        }}

        Ensure budget allocations, dining options, and sights align with the budget limits: ${budget}. 
        Use real, verified places in {destination}. Return ONLY the JSON object. Do not wrap in markdown quotes.
        """

        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        # Parse the JSON response
        data = json.loads(response.text.strip())
        return data

    except Exception as e:
        logger.error(f"Gemini generation error: {str(e)}. Falling back to Mock Generator.")
        return get_mock_itinerary(destination, budget, start_date, end_date, num_travelers, travel_type, interests)


def get_mock_itinerary(destination, budget, start_date, end_date, num_travelers, travel_type, interests):
    """
    Generates a localized, detailed mockup response to verify frontend components.
    """
    try:
        s_date = datetime.strptime(str(start_date), "%Y-%m-%d")
        e_date = datetime.strptime(str(end_date), "%Y-%m-%d")
        days_count = max(1, (e_date - s_date).days + 1)
    except Exception:
        days_count = 3

    # Localize generic details based on destination search words
    dest_lower = destination.lower()
    
    if "tokyo" in dest_lower or "japan" in dest_lower:
        mock_summary = f"An immersion into the electric neon streets and historic temples of Tokyo, curated for a budget of ${budget}."
        mock_hotels = [
            {"name": "Shinjuku Granbell Hotel", "rating": "4.2/5", "price_range": "$$", "description": "Trendy artistic hotel in Shinjuku.", "why_recommend": "Central location, easy access to metro lines."},
            {"name": "Hotel Gracery Shinjuku", "rating": "4.4/5", "price_range": "$$$", "description": "Famous hotel featuring the Godzilla head.", "why_recommend": "Superb amenities and panoramic cityscape views."}
        ]
        mock_restaurants = [
            {"name": "Ichiran Ramen", "cuisine": "Ramen", "price_range": "$", "description": "Classic individual booths serving Tonkotsu.", "why_recommend": "Quick, delicious, and highly iconic local style."},
            {"name": "Tsunahachi Tempura", "cuisine": "Traditional Tempura", "price_range": "$$", "description": "Serving crisp tempura since 1924.", "why_recommend": "Authentic Japanese cooking style with great history."}
        ]
        mock_transport = [
            {"type": "Suica / Pasmo Metro Pass", "description": "Prepaid cards covering JR and Metro subway lines.", "cost_estimate": "$10-$15 daily"},
            {"type": "Walking", "description": "Best way to absorb local street fashion and shops.", "cost_estimate": "Free"}
        ]
        mock_things_to_do = [
            {"title": "Senso-ji Temple", "description": "Tokyo's oldest and most iconic Buddhist temple in Asakusa."},
            {"title": "Shibuya Crossing", "description": "The world's busiest pedestrian intersection, best viewed from above."}
        ]
        mock_tips = [
            "Buy a Pocket Wi-Fi or eSIM at the airport to navigate maps on the go.",
            "Tipping is strictly not customary in Japan; polite service is included.",
            "Keep a small plastic bag in your pocket; street trash bins are rare."
        ]
    elif "paris" in dest_lower or "france" in dest_lower:
        mock_summary = f"A romantic, artsy getaway in Paris, balancing cozy neighborhood bistros with legendary museums."
        mock_hotels = [
            {"name": "Hotel Caron de Beaumarchais", "rating": "4.6/5", "price_range": "$$", "description": "18th-century themed hotel in the Marais.", "why_recommend": "Charming Parisian vibe, close to Louvre."},
            {"name": "Generator Paris", "rating": "4.0/5", "price_range": "$", "description": "Premium design hostel with rooftop bar.", "why_recommend": "Budget-friendly, highly popular among solo travelers."}
        ]
        mock_restaurants = [
            {"name": "L'As du Fallafel", "cuisine": "Middle Eastern", "price_range": "$", "description": "Legendary falafel spot in the Jewish Quarter.", "why_recommend": "Best budget eats in Paris with quick service."},
            {"name": "Bouillon Chartier", "cuisine": "Classic French", "price_range": "$$", "description": "Historic grand dining room serving cheap traditional food.", "why_recommend": "Amazing Belle Époque interior at a budget price."}
        ]
        mock_transport = [
            {"type": "Paris Metro (Navigo Easy)", "description": "Efficient subway line linking all key quarters.", "cost_estimate": "$2.30 per ticket"},
            {"type": "Vélib' Bike Share", "description": "Public bicycle rental system with stations everywhere.", "cost_estimate": "$5.00 daily pass"}
        ]
        mock_things_to_do = [
            {"title": "Eiffel Tower Picnic", "description": "Gather cheese and baguettes and relax on the Champ de Mars lawn."},
            {"title": "Musée de l'Orangerie", "description": "Cozy museum housing Monet's massive Water Lilies canvases."}
        ]
        mock_tips = [
            "Book Louvre and Eiffel Tower tickets weeks in advance online.",
            "Say 'Bonjour' when entering any shop; it is essential local etiquette.",
            "Water in restaurants is free; ask for a 'carafe d'eau'."
        ]
    else:
        mock_summary = f"An optimized multi-day trip to {destination} featuring local cultural sights and top culinary recommendations."
        mock_hotels = [
            {"name": "Central Plaza Lodge", "rating": "4.3/5", "price_range": "$$", "description": "Highly rated, central hotel.", "why_recommend": "Safe neighborhood and friendly staff."},
            {"name": "Backpacker Haven", "rating": "4.1/5", "price_range": "$", "description": "Clean, social budget hostel.", "why_recommend": "Affordable pricing with private locker options."}
        ]
        mock_restaurants = [
            {"name": "The Local Spoon", "cuisine": "Traditional Local", "price_range": "$$", "description": "Cozy cafe using seasonal local ingredients.", "why_recommend": "Warm ambiance and signature street eats."},
            {"name": "Market Food Stalls", "cuisine": "Street Food", "price_range": "$", "description": "Vibrant market food court.", "why_recommend": "Great variety and very pocket-friendly."}
        ]
        mock_transport = [
            {"type": "Public Buses & Trains", "description": "Standard city transit system.", "cost_estimate": "$2-$3 per ride"},
            {"type": "Walking / Biking", "description": "Eco-friendly street navigation.", "cost_estimate": "Free"}
        ]
        mock_things_to_do = [
            {"title": "Old Town Square", "description": "Vibrant pedestrian hub with local street performers."},
            {"title": "Scenic City Viewpoint", "description": "Hilltop views of the city skyline, perfect for sunset."}
        ]
        mock_tips = [
            "Keep some local physical currency for street markets.",
            "Download local offline maps in case of connectivity issues."
        ]

    # Dynamically build daily itinerary entries based on trip days count
    mock_itinerary = []
    for day in range(1, days_count + 1):
        if day == 1:
            theme = "Arrival and Neighborhood Exploration"
            acts = [
                {"time": "10:00 AM", "title": "Check-in at Hotel", "description": "Drop off heavy bags and freshen up.", "cost": "Free"},
                {"time": "02:00 PM", "title": "Old Town Walk", "description": "Explore the central streets and historical arches.", "cost": "Free"},
                {"time": "07:00 PM", "title": "Welcome Dinner", "description": "Indulge in a signature dish at a local restaurant.", "cost": "$25"}
            ]
        elif day == days_count:
            theme = "Souvenirs and Farewell Sights"
            acts = [
                {"time": "09:00 AM", "title": "Local Market Shopping", "description": "Pick up gifts, snacks, and locally crafted souvenirs.", "cost": "Varies"},
                {"time": "02:00 PM", "title": "Relaxing Garden Stroll", "description": "Reflect on the trip inside a scenic public park.", "cost": "Free"},
                {"time": "06:00 PM", "title": "Departure Prep", "description": "Head back to the airport or station for transit.", "cost": "Varies"}
            ]
        else:
            theme = "Deep Dive Sights & Adventures"
            acts = [
                {"time": "09:00 AM", "title": "Top Museum Visit", "description": "Explore local art collections and historical galleries.", "cost": "$15"},
                {"time": "01:00 PM", "title": "Bistro Lunch", "description": "Take a coffee break at a highly rated sidewalk cafe.", "cost": "$15"},
                {"time": "03:00 PM", "title": "Hidden Spot Discovery", "description": "Walk off the beaten track to find hidden alleys and boutiques.", "cost": "Free"}
            ]
        mock_itinerary.append({
            "day": day,
            "theme": theme,
            "activities": acts
        })

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
    Generates a weather-aware, duration-aware packing checklist based on traveler details.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return get_mock_packing_checklist(destination, days, travel_style)
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are an expert travel coordinator. Generate a highly customized packing checklist for a trip to {destination} for {days} days, with travel style: {travel_style}.
        
        Return the checklist strictly as a JSON list of objects matching this schema:
        [
          {{
            "id": 1,
            "category": "Clothes",
            "name": "Light jacket (highly recommended for local weather)",
            "packed": false
          }},
          {{
            "id": 2,
            "category": "Documents",
            "name": "Passport & copy of visa",
            "packed": false
          }}
        ]
        
        Categorize items exactly into one of these four categories: "Clothes", "Documents", "Medicines", or "Electronics".
        Provide 3-5 key practical items per category. Return ONLY the raw JSON list.
        """
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text.strip())
    except Exception as e:
        logger.error(f"Error generating packing checklist: {str(e)}")
        return get_mock_packing_checklist(destination, days, travel_style)


def get_mock_packing_checklist(destination, days, travel_style):
    return [
        {"id": 1, "category": "Clothes", "name": f"Daily clothes suitable for {days} days", "packed": False},
        {"id": 2, "category": "Clothes", "name": "Comfortable walking shoes", "packed": False},
        {"id": 3, "category": "Clothes", "name": "Weather-aware jacket or umbrella", "packed": False},
        
        {"id": 4, "category": "Documents", "name": "Passport & travel ID cards", "packed": False},
        {"id": 5, "category": "Documents", "name": "Flight tickets & hotel bookings copy", "packed": False},
        {"id": 6, "category": "Documents", "name": "Travel health insurance details", "packed": False},
        
        {"id": 7, "category": "Medicines", "name": "Personal prescriptions (labeled)", "packed": False},
        {"id": 8, "category": "Medicines", "name": "First-aid essentials (band-aids, ibuprofen)", "packed": False},
        {"id": 9, "category": "Medicines", "name": "Motion sickness pills", "packed": False},
        
        {"id": 10, "category": "Electronics", "name": "Mobile phone & charger adapter", "packed": False},
        {"id": 11, "category": "Electronics", "name": "Universal travel power plug", "packed": False},
        {"id": 12, "category": "Electronics", "name": "Portable power bank", "packed": False}
    ]


def replan_itinerary(current_itinerary, current_budget, disruption_type, details):
    """
    Calls Gemini to adapt the day itinerary and budget to disruptions.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return get_mock_replanned_itinerary(current_itinerary, current_budget, disruption_type, details)
        
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are an expert AI Travel Replanner. An unexpected disruption has occurred on a trip.
        Disruption Type: {disruption_type} (options: heavy_rain, budget_exceeded, place_closed)
        Details of Disruption: {details}

        Current Trip Budget: ${current_budget}
        Current Day-by-Day Itinerary:
        {json.dumps(current_itinerary)}

        Re-plan the itinerary and budget to adapt to this disruption.
        Rules:
        - If 'heavy_rain': Swap all outdoor attractions, walking tours, and activities with high-quality indoor alternatives (museums, libraries, dining halls, indoor gardens, escape rooms) and suggest indoor-friendly restaurants.
        - If 'budget_exceeded': Replace expensive activities or premium restaurants with free, low-cost or budget alternatives, and adjust the total budget figure.
        - If 'place_closed': Identify alternative local attractions or activities to replace the closed attraction listed in the details. Keep schedules consistent.

        Return the updated response strictly as a JSON object matching this schema:
        {{
          "itinerary": [
            {{
              "day": 1,
              "theme": "Updated Day Theme",
              "activities": [
                {{
                  "time": "Activity Time",
                  "title": "Updated Activity Title",
                  "description": "Updated Description explaining the swap",
                  "cost": "Updated Cost"
                }}
              ]
            }}
          ],
          "budget": 1200.00
        }}

        Do not change the number of days. Return ONLY the raw JSON object.
        """
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text.strip())
    except Exception as e:
        logger.error(f"Error replanning itinerary: {str(e)}")
        return get_mock_replanned_itinerary(current_itinerary, current_budget, disruption_type, details)


def get_mock_replanned_itinerary(current_itinerary, current_budget, disruption_type, details):
    updated_itinerary = list(current_itinerary)
    updated_budget = float(current_budget)
    
    if disruption_type == 'heavy_rain':
        # Swap activities to indoor alternatives
        for day_plan in updated_itinerary:
            if day_plan.get("day") in [1, 2]:
                day_plan["theme"] = "Cozy Indoor Sights (Weather Adapted)"
                for act in day_plan.get("activities", []):
                    title_l = act["title"].lower()
                    if "walk" in title_l or "park" in title_l or "outdoor" in title_l or "climb" in title_l or "picnic" in title_l:
                        act["title"] = "Metropolitan Fine Arts Museum (Indoor)"
                        act["description"] = "Adjusted due to heavy rain. Explore premium painting galleries and indoor botanical cafes."
                        act["cost"] = "$10"
    elif disruption_type == 'budget_exceeded':
        # Slash budget and replace dining costs
        updated_budget = round(updated_budget * 0.75, 2)
        for day_plan in updated_itinerary:
            for act in day_plan.get("activities", []):
                if act.get("cost") and act["cost"] != "Free" and act["cost"] != "Varies":
                    act["title"] = f"{act['title']} (Budget Choice)"
                    act["description"] = f"{act['description']} (Adjusted to stay under budget limits)."
                    act["cost"] = "Free"
    elif disruption_type == 'place_closed':
        # Swap out target attraction if matched
        for day_plan in updated_itinerary:
            for act in day_plan.get("activities", []):
                act["title"] = f"Alternative Attraction (Replacement)"
                act["description"] = f"Previous destination was closed ({details}). Swapped for this highly rated landmark."
                act["cost"] = "Free"
                    
    return {
        "itinerary": updated_itinerary,
        "budget": updated_budget
    }


def ask_local_guide(destination, travel_type, query):
    """
    Renders contextual guide tips based on traveler queries.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return get_mock_guide_recommendation(destination, travel_type, query)
        
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are an expert AI Local Guide for {destination}. A traveler visiting as a {travel_type} wants local advice.
        Traveler Query: "{query}"

        Provide a friendly, highly localized recommendation. Give specific names of cafes, restaurants, spots, or hospitals depending on the query. If they ask for cheap eats, name actual budget spots. If they ask for hidden places, list off-the-beaten-path streets or viewpoints.
        Provide response in a structured markdown format with bullet points and bold names. Keep it under 250 words.
        """
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error asking local guide: {str(e)}")
        return get_mock_guide_recommendation(destination, travel_type, query)


def get_mock_guide_recommendation(destination, travel_type, query):
    q = query.lower()
    if "cafe" in q:
        return f"### Recommended Cafes in {destination}\nHere are the top local picks:\n- **The Golden Bean**: Charming rustic aesthetic with amazing pour-overs.\n- **Velvet Brews**: Highly rated pastries and quick Wi-Fi. Ideal for traveler persona: {travel_type}."
    elif "hidden" in q:
        return f"### Off-the-beaten-path Sights in {destination}\nEscape the tourists at these spots:\n- **Whispering Stone Alley**: A quiet historic pathway behind the main district.\n- **Green Canopy Vista**: Small hill path offering panoramic views of the city line."
    elif "cheap" in q or "restaurant" in q:
        return f"### Budget Eats in {destination}\nEnjoy delicious food without overspending:\n- **Noodle Express**: Fresh local noodles starting at just $5.\n- **The Daily Crust**: Bakery serving authentic pizzas and sandwiches."
    elif "sunset" in q:
        return f"### Best Sunset Spots in {destination}\nCheck these locations for stunning evening colors:\n- **Horizon Bridge Overlook**: A gorgeous river view facing west.\n- **Park Hill Summit**: Perfect for photos, open until midnight."
    elif "hospital" in q or "medical" in q:
        return f"### Medical Support in {destination}\n- **City Central Emergency Clinic**: Open 24/7. Staff speak English. Address: 42 Health Lane.\n- **Red Cross Urgent Care**: Pharmacy and minor injuries department."
    else:
        return f"### AI Local Guide Response for {destination}\nRegarding your question: *\"{query}\"*\n\n1. **Local Sight Recommendation**: Try visiting the central avenues in the morning to avoid crowds.\n2. **Culinary Tip**: Local food stalls offer authentic flavors at half the restaurant price.\n3. **Safety Advice**: Emergency facilities are located near the city center. Call 112 or local dispatch in case of urgency."


def analyze_budget_expenses(total_budget, expense_list):
    """
    Feeds budget metrics and expense lists to Gemini to generate actionable saving advice.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return get_mock_budget_analysis(total_budget, expense_list)
        
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are an expert AI Budget Analyst. Audit the following trip expenses:
        Total Allocated Budget: ${total_budget}
        Expense List (category, amount, description):
        {json.dumps(expense_list)}

        Provide a structured audit summarizing the spending patterns. E.g.: "You spent X% on Food and Y% on Shopping."
        Highlight areas of overspending (if any) and suggest 2-3 specific, actionable ways to save money during the remainder of the trip.
        Keep the response friendly and under 200 words. Format with markdown bullet points.
        """
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error analyzing budget expenses: {str(e)}")
        return get_mock_budget_analysis(total_budget, expense_list)


def get_mock_budget_analysis(total_budget, expense_list):
    total_spent = sum(float(exp.get('amount', 0)) for exp in expense_list)
    if not expense_list:
        return "### AI Budget Audit\nYou have not logged any expenses yet! Once you add expenses, I will analyze your spending breakdown."
        
    # Group by category
    categories = {}
    for exp in expense_list:
        cat = exp.get('category', 'Other')
        amt = float(exp.get('amount', 0))
        categories[cat] = categories.get(cat, 0) + amt
        
    # Calculate percentages
    breakdown = []
    for cat, amt in categories.items():
        pct = round((amt / total_budget) * 100) if total_budget > 0 else 0
        breakdown.append(f"- **{cat}**: ${amt} ({pct}% of total budget)")
        
    analysis_text = "### AI Budget Audit\nHere is your spending analysis:\n" + "\n".join(breakdown)
    
    # Over budget check
    remaining = float(total_budget) - total_spent
    if remaining < 0:
        analysis_text += f"\n\n⚠️ **Warning: You have exceeded your budget by ${abs(remaining)}!**"
        analysis_text += "\n\n**Actionable saving tips:**\n1. **Lodging swap**: Consider asking for room downgrades or looking for capsule options.\n2. **Transit optimization**: Use public subway systems instead of rental cabs, saving you up to $40 daily.\n3. **Culinary control**: Dine at local street markets rather than high-end restaurants."
    else:
        analysis_text += f"\n\n👍 You have **${remaining}** remaining in your budget."
        analysis_text += "\n\n**AI Savings Recommendations:**\n1. Keep packing snacks and water bottles to save on minor restaurant markups.\n2. Leverage free walking tours and city park outings to keep entertainment costs low."
        
    return analysis_text


def generate_journal_story(destination, title, image_data=None):
    """
    multimodal vision client that reads photo bytes and crafts stories/captions.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return get_mock_journal_story(destination, title)

    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        You are an expert travel writer. A traveler uploaded a photo with the title "{title}" from their trip to {destination}.
        Write a short travel journal log for this moment.
        
        Return the response strictly as a JSON object matching this schema:
        {{
          "content": "A beautiful, creative travel story (100-150 words) describing the vibe of the place and the moment, written in the first person.",
          "caption": "A short, engaging caption (1 sentence) suitable for sharing on social media.",
          "summary": "A brief summary sentence of this memory."
        }}

        Analyze the features of the image to describe details (e.g. if the image contains coffee, water, landmarks, clouds, or people, weave it into the story).
        Return ONLY the raw JSON object. Do not wrap in markdown code blocks.
        """
        
        if image_data:
            image_part = {
                'mime_type': 'image/jpeg',
                'data': image_data
            }
            response = model.generate_content(
                [prompt, image_part],
                generation_config={"response_mime_type": "application/json"}
            )
        else:
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            
        return json.loads(response.text.strip())
    except Exception as e:
        logger.error(f"Error generating multimodal story: {str(e)}")
        return get_mock_journal_story(destination, title)


def get_mock_journal_story(destination, title):
    story = f"Exploring {destination} was on my bucket list for years, and this moment - '{title}' - captured the magic perfectly. Walking down cobblestone pathways, the local sights and smells of fresh pastries filled the air. There's a certain stillness here that makes you pause and appreciate the journey. I spent hours simply soaking in the local atmosphere, taking photos, and chatting with friendly locals. An unforgettable memory that I will cherish forever."
    caption = f"Lost in the beauty of {destination} ✨ #{title.replace(' ', '')} #travelstories"
    summary = f"Logged a beautiful memory at {destination} titled '{title}'."
    return {
        "content": story,
        "caption": caption,
        "summary": summary
    }

