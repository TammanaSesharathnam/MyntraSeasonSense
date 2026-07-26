import os
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
import bcrypt
import jwt

from config import Config
from services.ml_engine import RecommendationEngine
from middleware.auth_guard import token_required, admin_required

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Initialize MongoDB Connection
client = MongoClient(app.config["MONGO_URI"])
db = client.get_database()

# Initialize ML Engine
ml_engine = RecommendationEngine()
ml_engine.train()

# Helpers
def calculate_readiness(location, user_items=[]):
    weather = db.weather.find_one({"location": location})
    if not weather:
        weather = db.weather.find_one({"location": "Mumbai"})
    
    season = weather.get("season", "Monsoon")
    total_essentials = list(db.products.find({"season": season, "essentials": True}))
    essential_names = [p["name"] for p in total_essentials]
    
    if not essential_names:
        return 100, []

    # Check which essentials are in user items
    purchased_essentials = []
    for ess in essential_names:
        for item in user_items:
            if ess.lower() in item.get("name", "").lower():
                purchased_essentials.append(ess)
                break
                
    owned_essentials = list(set(purchased_essentials))
    score = int((len(owned_essentials) / len(essential_names)) * 100)
    missing = [ess for ess in essential_names if ess not in owned_essentials]
    
    return score, missing

# ----------------- AUTHENTICATION ROUTES -----------------

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    if not data or not data.get("email") or not data.get("password") or not data.get("username"):
        return jsonify({"error": "Missing registration details"}), 400

    existing_user = db.users.find_one({"email": data["email"]})
    if existing_user:
        return jsonify({"error": "Email already registered"}), 409

    hashed_pw = bcrypt.hashpw(data["password"].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    new_user = {
        "email": data["email"],
        "password": hashed_pw,
        "username": data["username"],
        "role": data.get("role", "user"),
        "location": data.get("location", "Mumbai"),
        "address": data.get("address", ""),
        "preferences": data.get("preferences", ["Casual Fits"]),
        "budget": int(data.get("budget", 5000)),
        "wishlist": [],
        "recentlyViewed": [],
        "orders": []
    }

    db.users.insert_one(new_user)
    return jsonify({"success": True, "message": "User registered successfully!"}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Missing login credentials"}), 400

    user = db.users.find_one({"email": data["email"]})
    if not user or not bcrypt.checkpw(data["password"].encode('utf-8'), user["password"].encode('utf-8')):
        return jsonify({"error": "Invalid email or password"}), 401

    # Generate JWT Token
    secret = app.config["JWT_SECRET_KEY"]
    payload = {
        "user_id": str(user["_id"]),
        "role": user.get("role", "user"),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    token = jwt.encode(payload, secret, algorithm="HS256")

    user_details = {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "role": user.get("role", "user"),
        "location": user.get("location", "Mumbai"),
        "preferences": user.get("preferences", []),
        "budget": user.get("budget", 5000),
        "address": user.get("address", "")
    }

    return jsonify({
        "success": True,
        "token": token,
        "user": user_details
    }), 200

@app.route('/api/auth/profile', methods=['GET', 'PUT'])
@token_required
def profile_handler(current_user):
    if request.method == 'GET':
        return jsonify(current_user), 200

    # PUT request
    data = request.json
    if not data:
        return jsonify({"error": "No update fields provided"}), 400

    update_fields = {}
    if "username" in data:
        update_fields["username"] = data["username"]
    if "location" in data:
        update_fields["location"] = data["location"]
    if "address" in data:
        update_fields["address"] = data["address"]
    if "preferences" in data:
        update_fields["preferences"] = data["preferences"]
    if "budget" in data:
        update_fields["budget"] = int(data["budget"])

    db.users.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": update_fields}
    )
    
    updated = db.users.find_one({"_id": ObjectId(current_user["id"])})
    updated["id"] = str(updated["_id"])
    del updated["_id"]
    if "password" in updated:
        del updated["password"]
        
    return jsonify({"success": True, "user": updated}), 200

@app.route('/api/auth/reset', methods=['POST'])
def reset_password():
    data = request.json
    if not data or not data.get("email") or not data.get("newPassword"):
        return jsonify({"error": "Missing credentials"}), 400

    user = db.users.find_one({"email": data["email"]})
    if not user:
        return jsonify({"error": "User not found"}), 404

    hashed_pw = bcrypt.hashpw(data["newPassword"].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    db.users.update_one({"email": data["email"]}, {"$set": {"password": hashed_pw}})
    return jsonify({"success": True, "message": "Password updated successfully!"}), 200


# ----------------- CATALOG & WEATHER ROUTES -----------------

@app.route('/api/weather', methods=['GET'])
def get_weather():
    location = request.args.get("location", "Mumbai")
    weather = db.weather.find_one({"location": location})
    if not weather:
        weather = db.weather.find_one({"location": "Mumbai"})
    
    weather["id"] = str(weather["_id"])
    del weather["_id"]

    # Calculate initial readiness
    score, missing = calculate_readiness(location, [])
    weather["readinessScore"] = score
    weather["missingEssentials"] = missing

    return jsonify(weather), 200

@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get("category")
    gender = request.args.get("gender")      # Men | Women | Kids | Unisex
    style = request.args.get("style")        # Beauty | GenZ | Studio | Formal | Sport
    limit = int(request.args.get("limit", 100))

    query = {}

    # Season filter (climate zone chips)
    if category:
        if category in ["Monsoon", "Winter", "Summer", "Spring"]:
            query["season"] = category
        elif category in ["Topwear", "Bottomwear", "Footwear", "Accessories"]:
            query["category"] = category
        # Named navbar categories resolve via gender/style below

    # Gender filter: Men → Men, Women → Women, Kids → Unisex (fallback)
    if gender:
        if gender == "Kids":
            # Kids: short items, unisex, or items with kid keywords
            query["$or"] = [
                {"gender": "Unisex"},
                {"name": {"$regex": "kids|junior|boy|girl|child|youth", "$options": "i"}},
                {"description": {"$regex": "kids|junior|children|boy|girl", "$options": "i"}}
            ]
        else:
            query["gender"] = gender

    # Style filter: maps navbar tabs to aiTags / name keywords
    if style:
        style_lower = style.lower()
        if style_lower == "beauty":
            # Beauty: accessories, jewellery, sunglasses, bags, watches
            query["$or"] = [
                {"category": "Accessories"},
                {"name": {"$regex": "sunglasses|bag|watch|belt|jewel|perfume|cosmetic|beauty|makeup|lipstick|nail|earring|necklace|bracelet|wallet|purse|sunglass|cap|hat|scarf|stole|muffler", "$options": "i"}},
            ]
        elif style_lower == "genz":
            # GenZ: streetwear, athleisure, trending, casual tags
            query["aiTags"] = {"$in": ["sporty", "athleisure", "streetwear", "casual"]}
        elif style_lower == "studio":
            # Studio: formal, office, premium, designer
            query["aiTags"] = {"$in": ["formal", "office", "premium"]}

    products = list(db.products.find(query).limit(limit))
    for p in products:
        p["id"] = str(p["_id"])
        del p["_id"]
    return jsonify(products), 200

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product_details(product_id):
    try:
        p = db.products.find_one({"_id": ObjectId(product_id)})
        if not p:
            return jsonify({"error": "Product not found"}), 404
        
        p["id"] = str(p["_id"])
        del p["_id"]
        return jsonify(p), 200
    except Exception as e:
        return jsonify({"error": f"Invalid ID format: {e}"}), 400

@app.route('/api/similar-products/<product_id>', methods=['GET'])
@app.route('/similar-products/<product_id>', methods=['GET'])
@app.route('/api/products/<product_id>/similar', methods=['GET'])
def get_similar_products(product_id):
    try:
        similar = ml_engine.get_similar_products(product_id)
        return jsonify(similar), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/campaigns', methods=['GET'])
def get_campaigns():
    camps = list(db.campaigns.find({"active": True}))
    for c in camps:
        c["id"] = str(c["_id"])
        del c["_id"]
    return jsonify(camps), 200


# ----------------- AI RECOMMENDATIONS & BUNDLES -----------------

@app.route('/api/recommendations', methods=['GET'])
@app.route('/recommendations', methods=['GET'])
def get_recommendations():
    # Supports optional token, fallback to default profile if unauthenticated
    user_profile = None
    token = None
    if 'Authorization' in request.headers:
        auth_header = request.headers['Authorization']
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    if token:
        try:
            secret = app.config["JWT_SECRET_KEY"]
            data = jwt.decode(token, secret, algorithms=["HS256"])
            user_profile = db.users.find_one({"_id": ObjectId(data["user_id"])})
        except:
            pass

    # Default profile fallback
    if not user_profile:
        user_profile = {
            "preferences": ["Casual"],
            "gender": "Unisex",
            "budget": 5000,
            "orders": []
        }
    else:
        user_profile["id"] = str(user_profile["_id"])

    # Fetch weather parameters
    location = request.args.get("location", "Mumbai")
    weather = db.weather.find_one({"location": location})
    if not weather:
        weather = db.weather.find_one({"location": "Mumbai"})
        if not weather:
            weather = {"season": "Monsoon", "temp": 26, "condition": "Heavy Monsoonal Rain", "location": "Mumbai"}

    # Fetch user orders to calculate wardrobe readiness score
    user_items = []
    if user_profile and "id" in user_profile:
        orders = list(db.orders.find({"userId": user_profile["id"]}))
        for o in orders:
            user_items.extend(o.get("items", []))

    score, missing = calculate_readiness(location, user_items)
    weather["readinessScore"] = score
    weather["missingEssentials"] = missing

    recs = ml_engine.get_personalized_recommendations(user_profile, weather)
    
    # Generate outfit combo
    season = weather.get("season", "Monsoon")
    budget = user_profile.get("budget", 5000)
    prefs = user_profile.get("preferences", [])
    gender = user_profile.get("gender", "Unisex")
    combo = ml_engine.get_seasonal_bundles(season, budget, prefs, gender)

    response_data = {
        "recommendations": recs,
        "combo": combo,
        "weather": {
            "location": location,
            "temp": weather.get("temp", 26),
            "humidity": weather.get("humidity", 95),
            "condition": weather.get("condition", "Heavy Monsoonal Rain"),
            "season": season,
            "readinessScore": score,
            "missingEssentials": missing
        },
        "userBudget": budget,
        "aiConfidenceScore": int(recs[0].get("aiConfidence", 95)) if recs else 95
    }
    return jsonify(response_data), 200

@app.route('/api/bundles/generate', methods=['POST'])
def generate_bundle():
    data = request.json or {}
    season = data.get("season", "Monsoon")
    budget = int(data.get("budget", 5000))
    preferences = data.get("preferences", [])
    gender = data.get("gender", "Unisex")

    bundle = ml_engine.get_seasonal_bundles(season, budget, preferences, gender)
    if not bundle:
        return jsonify({"error": "Failed to generate AI bundle"}), 500
    return jsonify(bundle), 200

@app.route('/api/seasonal-products', methods=['GET'])
@app.route('/seasonal-products', methods=['GET'])
def get_seasonal_products_api():
    season = request.args.get("season", "Monsoon")
    limit = int(request.args.get("limit", 12))
    products = ml_engine.get_seasonal_products(season, top_n=limit)
    return jsonify(products), 200

@app.route('/api/trending-products', methods=['GET'])
@app.route('/trending-products', methods=['GET'])
def get_trending_products_api():
    season = request.args.get("season", "Monsoon")
    condition = request.args.get("condition", "Rain")
    limit = int(request.args.get("limit", 12))
    products = ml_engine.get_trending_products(season, condition, top_n=limit)
    return jsonify(products), 200

@app.route('/api/weather-based-products', methods=['GET'])
@app.route('/weather-based-products', methods=['GET'])
def get_weather_based_products_api():
    condition = request.args.get("condition", "Rain")
    temp = int(request.args.get("temp", 26))
    limit = int(request.args.get("limit", 12))
    products = ml_engine.get_weather_based_products(condition, temp, top_n=limit)
    return jsonify(products), 200

@app.route('/api/combo-offers', methods=['GET'])
@app.route('/combo-offers', methods=['GET'])
def get_combo_offers_api():
    season = request.args.get("season", "Monsoon")
    budget = int(request.args.get("budget", 5000))
    preferences_raw = request.args.get("preferences", "")
    preferences = [p.strip() for p in preferences_raw.split(",") if p.strip()]
    gender = request.args.get("gender", "Unisex")
    combo = ml_engine.get_seasonal_bundles(season, budget, preferences, gender)
    return jsonify(combo), 200


# ----------------- PRICE LOCKS & NOTIFICATIONS -----------------

@app.route('/api/pricelocks', methods=['GET'])
def get_pricelocks():
    locks = list(db.pricelocks.find({}))
    for l in locks:
        l["id"] = str(l["_id"])
        del l["_id"]
    return jsonify(locks), 200

@app.route('/api/pricelock', methods=['POST'])
def create_pricelock():
    data = request.json
    if not data or not data.get("productId"):
        return jsonify({"error": "Product ID required"}), 400

    product_id = data["productId"]
    p = db.products.find_one({"_id": ObjectId(product_id)})
    if not p:
        return jsonify({"error": "Product not found"}), 404

    # Format product
    p["id"] = str(p["_id"])
    del p["_id"]

    existing = db.pricelocks.find_one({"product.id": product_id})
    if existing:
        existing["id"] = str(existing["_id"])
        del existing["_id"]
        return jsonify(existing), 200

    new_lock = {
        "product": p,
        "lockedPrice": p["price"],
        "lockFee": int(data.get("lockFee", 99)),
        "expiresAt": (datetime.datetime.utcnow() + datetime.timedelta(days=30)).isoformat(),
        "daysRemaining": 30
    }

    db.pricelocks.insert_one(new_lock)
    new_lock["id"] = str(new_lock["_id"])
    del new_lock["_id"]

    # Record lock in analytics
    db.analytics.update_one({}, {"$inc": {"sales": 1, "revenue": new_lock["lockFee"]}})

    return jsonify(new_lock), 201

@app.route('/api/pricelock/<lock_id>', methods=['DELETE'])
def remove_pricelock(lock_id):
    try:
        db.pricelocks.delete_one({"_id": ObjectId(lock_id)})
        return jsonify({"success": True, "message": "Price lock removed"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    location = request.args.get("location", "Mumbai")
    weather = db.weather.find_one({"location": location})
    if not weather:
        weather = {"season": "Monsoon", "temp": 28, "condition": "Heavy Rain"}

    notifs = [
        {
            "id": "notif-1",
            "type": "weather",
            "title": f"{weather.get('season')} alert for {location}",
            "message": f"Weather is {weather.get('condition')} at {weather.get('temp')}°C. Adapt your wardrobe readiness.",
            "time": "Just now"
        },
        {
            "id": "notif-2",
            "type": "deal",
            "title": "AI combo offer unlocked",
            "message": "Double down on clothing items and save up to 45% with our Smart Choice combos.",
            "time": "5 mins ago"
        }
    ]

    locks_count = db.pricelocks.count_documents({})
    if locks_count > 0:
        notifs.append({
            "id": "notif-3",
            "type": "lock",
            "title": "Active Price Locks Protected",
            "message": f"You have {locks_count} item(s) locked at pre-season discounts.",
            "time": "1 hour ago"
        })

    return jsonify(notifs), 200


# ----------------- CHECKOUT & HISTORY ROUTES -----------------

@app.route('/api/checkout', methods=['POST'])
def checkout():
    data = request.json
    if not data or not data.get("items"):
        return jsonify({"error": "No checkout items"}), 400

    items = data["items"]
    discount_type = data.get("selectedDiscountType", "none")
    location = data.get("location", "Mumbai")

    cart_total = sum(int(item["price"]) for item in items)
    original_total = sum(int(item.get("originalPrice", item["price"] * 1.3)) for item in items)
    
    checkout_total = cart_total
    discount_label = "none"
    
    if discount_type == "instant_20":
        checkout_total = int(cart_total * 0.8)
        discount_label = "20% Instant discount coupon code"
    elif discount_type == "combo_offer":
        checkout_total = int(cart_total * 0.85)
        discount_label = "AI curated combo outfit package"

    order_id = f"order-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}"
    new_order = {
        "orderId": order_id,
        "items": items,
        "originalTotal": original_total,
        "checkoutTotal": checkout_total,
        "discountApplied": discount_label,
        "savings": original_total - checkout_total,
        "date": datetime.datetime.utcnow().isoformat()
    }

    db.orders.insert_one(new_order)
    new_order["id"] = str(new_order["_id"])
    del new_order["_id"]

    # Increment analytics
    db.analytics.update_one({}, {
        "$inc": {"sales": len(items), "revenue": checkout_total}
    })

    # Update dynamic readiness score
    score, missing = calculate_readiness(location, items)

    return jsonify({
        "success": True,
        "order": new_order,
        "readinessScore": score,
        "missingEssentials": missing
    }), 201

@app.route('/api/orders', methods=['GET'])
def get_orders():
    orders = list(db.orders.find({}))
    for o in orders:
        o["id"] = str(o["_id"])
        del o["_id"]
    return jsonify(orders), 200


# ----------------- ADMIN & ANALYTICS ROUTES -----------------

@app.route('/api/analytics', methods=['GET'])
def get_analytics():
    stats = db.analytics.find_one({})
    if stats:
        stats["id"] = str(stats["_id"])
        del stats["_id"]
    else:
        stats = {}
    return jsonify(stats), 200

@app.route('/api/admin/products', methods=['POST'])
def add_admin_product():
    data = request.json
    if not data or not data.get("name") or not data.get("price") or not data.get("category"):
        return jsonify({"error": "Missing essential fields"}), 400

    new_prod = {
        "name": data["name"],
        "brand": data.get("brand", "Myntra Brand"),
        "price": int(data["price"]),
        "originalPrice": int(data.get("originalPrice", int(data["price"]) * 1.5)),
        "rating": 4.2,
        "reviews": 12,
        "category": data["category"],
        "gender": data.get("gender", "Unisex"),
        "color": data.get("color", "Multi"),
        "season": data.get("category"),  # Maps to category
        "image": data.get("image") or "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&q=80",
        "description": data.get("reason") or "Seasonal fashion catalog addition.",
        "stock": 50,
        "aiTags": ["new-arrival", "admin-seed"],
        "weatherTags": [data["category"].lower()],
        "essentials": data.get("essentials", True)
    }

    db.products.insert_one(new_prod)
    new_prod["id"] = str(new_prod["_id"])
    del new_prod["_id"]

    # Retrain ML Engine on Catalog Updates
    ml_engine.train()

    return jsonify({"success": True, "product": new_prod}), 201

@app.route('/api/admin/campaigns', methods=['POST'])
def add_admin_campaign():
    data = request.json
    if not data or not data.get("title"):
        return jsonify({"error": "Campaign title required"}), 400

    new_camp = {
        "title": data["title"],
        "subtitle": data.get("subtitle", ""),
        "discount": data.get("discount", ""),
        "bgGradient": data.get("bgGradient", "linear-gradient(135deg, #10b981 0%, #059669 100%)"),
        "active": True
    }

    db.campaigns.insert_one(new_camp)
    new_camp["id"] = str(new_camp["_id"])
    del new_camp["_id"]

    return jsonify({"success": True, "campaign": new_camp}), 201
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True, use_reloader=False)
