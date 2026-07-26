import os
from pymongo import MongoClient
import bcrypt

def seed_db():
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/seasonsense")
    client = MongoClient(mongo_uri)
    db = client.get_database()

    print("Resetting database collections...")
    db.users.drop()
    db.products.drop()
    db.campaigns.drop()
    db.weather.drop()
    db.analytics.drop()
    db.orders.drop()
    db.pricelocks.drop()
    db.coupons.drop()
    db.notifications.drop()

    # 1. Create Default Users (hashing passwords)
    user_pw = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    admin_pw = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    db.users.insert_many([
        {
            "email": "user@seasonsense.com",
            "password": user_pw,
            "username": "FashionEnthusiast",
            "role": "user",
            "location": "Mumbai",
            "address": "402, High Street Phoenix, Senapati Bapat Marg, Lower Parel, Mumbai - 400013",
            "preferences": ["Casual Fits", "Athleisure", "Waterproof Gear"],
            "budget": 6000,
            "wishlist": [],
            "recentlyViewed": [],
            "orders": []
        },
        {
            "email": "admin@seasonsense.com",
            "password": admin_pw,
            "username": "SystemAdministrator",
            "role": "admin",
            "location": "Bengaluru",
            "address": "Myntra Headquarters, Indiranagar, Bengaluru - 560038",
            "preferences": ["Designer", "Premium Wear"],
            "budget": 15000,
            "wishlist": [],
            "recentlyViewed": [],
            "orders": []
        }
    ])
    print("Seeded default users (user@seasonsense.com / password123, admin@seasonsense.com / admin123).")

    # 2. Seed Products (adding detailed tags for the ML Engine)
    products_data = [
        # Monsoon Category
        {
            "name": "Myntra Active Waterproof Raincoat",
            "brand": "Roadster",
            "price": 1299,
            "originalPrice": 1999,
            "rating": 4.3,
            "reviews": 1205,
            "category": "Monsoon",
            "gender": "Unisex",
            "color": "Yellow",
            "season": "Monsoon",
            "image": "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?w=500&q=80",
            "description": "Double layer waterproof breathable raincoat with mesh lining and adjustable hood. Engineered with high-strength seam sealing to withstand heavy rain downpours.",
            "stock": 45,
            "aiTags": ["waterproof", "coat", "outerwear", "breathable", "safety-strips", "essential"],
            "weatherTags": ["rain", "wet", "monsoon", "humid", "overcast"],
            "essentials": True,
            "combo": {
                "name": "Monsoon Shield Combo",
                "companionName": "Anti-Skid Waterproof Boots",
                "companionPrice": 999,
                "bundlePrice": 1799,
                "savingsValue": 499
            }
        },
        {
            "name": "Quick-Dry Breathable Windbreaker",
            "brand": "HRX by Hrithik Roshan",
            "price": 1899,
            "originalPrice": 2999,
            "rating": 4.5,
            "reviews": 843,
            "category": "Monsoon",
            "gender": "Men",
            "color": "Black",
            "season": "Monsoon",
            "image": "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=500&q=80",
            "description": "Ultra light windproof jacket with ventilation slots. Quick-dry mesh layers prevent sweat accumulation during humid outdoor runs.",
            "stock": 28,
            "aiTags": ["windbreaker", "running", "sportswear", "lightweight", "quick-dry"],
            "weatherTags": ["windy", "breeze", "drizzle", "monsoon"],
            "essentials": True,
            "combo": {
                "name": "Dry & Active Combo",
                "companionName": "Waterproof Sport Watch",
                "companionPrice": 1499,
                "bundlePrice": 2699,
                "savingsValue": 699
            }
        },
        {
            "name": "Anti-Skid Rain-Ready Boots",
            "brand": "Mast & Harbour",
            "price": 1499,
            "originalPrice": 2499,
            "rating": 4.1,
            "reviews": 512,
            "category": "Monsoon",
            "gender": "Women",
            "color": "Olive Green",
            "season": "Monsoon",
            "image": "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=500&q=80",
            "description": "Durable rubber boots with extra grip sole layout. Protects feet from mud and water puddles while walking slippery streets.",
            "stock": 35,
            "aiTags": ["boots", "rubber", "outdoor", "footwear", "grip"],
            "weatherTags": ["muddy", "flood", "heavy-rain", "monsoon"],
            "essentials": True
        },
        # Winter Category
        {
            "name": "Thermoregulation Puffer Jacket",
            "brand": "Wildcraft",
            "price": 3499,
            "originalPrice": 4999,
            "rating": 4.7,
            "reviews": 3209,
            "category": "Winter",
            "gender": "Men",
            "color": "Navy Blue",
            "season": "Winter",
            "image": "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=500&q=80",
            "description": "High loft synthetic down puffer jacket. Retains body heat and maintains temperature index in cold wind chills.",
            "stock": 20,
            "aiTags": ["puffer", "jacket", "heavy", "warmth", "insulated"],
            "weatherTags": ["cold", "chill", "fog", "frost", "winter"],
            "essentials": True,
            "combo": {
                "name": "Sub-Zero Protection Kit",
                "companionName": "Merino Wool Thermal Innerwear",
                "companionPrice": 1299,
                "bundlePrice": 3999,
                "savingsValue": 799
            }
        },
        {
            "name": "Merino Wool Thermal Inner Set",
            "brand": "Marks & Spencer",
            "price": 1999,
            "originalPrice": 2999,
            "rating": 4.6,
            "reviews": 1445,
            "category": "Winter",
            "gender": "Unisex",
            "color": "Grey",
            "season": "Winter",
            "image": "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?w=500&q=80",
            "description": "Premium ultra-soft merino wool thermal set. Non-itch weave ideal for sub-clothing insulation base layers.",
            "stock": 50,
            "aiTags": ["thermals", "merino", "innerwear", "set", "soft"],
            "weatherTags": ["cold", "snow", "dense-fog", "winter"],
            "essentials": True,
            "combo": {
                "name": "Thermal Warmth Set",
                "companionName": "Fleece Lined Beanie & Gloves",
                "companionPrice": 799,
                "bundlePrice": 2299,
                "savingsValue": 499
            }
        },
        {
            "name": "Knitted Fleece Beanie and Gloves Set",
            "brand": "DressBerry",
            "price": 699,
            "originalPrice": 999,
            "rating": 4.2,
            "reviews": 730,
            "category": "Winter",
            "gender": "Women",
            "color": "Pink",
            "season": "Winter",
            "image": "https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?w=500&q=80",
            "description": "Soft knit beanie and touchscreen-friendly gloves set. Lined with thermal micro-fleece for cozy winter commutes.",
            "stock": 60,
            "aiTags": ["beanie", "gloves", "knit", "fleece", "commute"],
            "weatherTags": ["windy", "frost", "cold", "winter"],
            "essentials": False
        },
        # Summer Category
        {
            "name": "Ultra-Light Breathable Linen Shirt",
            "brand": "WROGN",
            "price": 1199,
            "originalPrice": 1999,
            "rating": 4.4,
            "reviews": 2110,
            "category": "Summer",
            "gender": "Men",
            "color": "White",
            "season": "Summer",
            "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80",
            "description": "Premium pure linen-cotton blended shirt. High porosity fabric maximizes air flow keeping you fresh under high sun.",
            "stock": 30,
            "aiTags": ["linen", "shirt", "casual", "breathable", "lightweight"],
            "weatherTags": ["hot", "sunny", "humid", "summer"],
            "essentials": True,
            "combo": {
                "name": "Summer Cruise Outfit",
                "companionName": "Polarized UV Sunglasses",
                "companionPrice": 899,
                "bundlePrice": 1699,
                "savingsValue": 399
            }
        },
        {
            "name": "UV Protection Polarized Sunglasses",
            "brand": "Ray-Ban",
            "price": 2499,
            "originalPrice": 3999,
            "rating": 4.8,
            "reviews": 642,
            "category": "Summer",
            "gender": "Unisex",
            "color": "Brown",
            "season": "Summer",
            "image": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&q=80",
            "description": "Polarized protective sun lenses. Eliminates glare reflection from roads and water while blocking 100% UV rays.",
            "stock": 15,
            "aiTags": ["polarized", "sunglasses", "eyewear", "uv-protection", "luxury"],
            "weatherTags": ["sunny", "glare", "hot", "summer"],
            "essentials": True,
            "combo": {
                "name": "Cool Vision Combo",
                "companionName": "Breathable Cotton Sun Cap",
                "companionPrice": 499,
                "bundlePrice": 2699,
                "savingsValue": 299
            }
        },
        {
            "name": "Cotton Casual Cap with Sweatband",
            "brand": "Puma",
            "price": 599,
            "originalPrice": 899,
            "rating": 4.3,
            "reviews": 994,
            "category": "Summer",
            "gender": "Unisex",
            "color": "Red",
            "season": "Summer",
            "image": "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&q=80",
            "description": "Comfort-fit canvas cap with inner elastic headband. Wicks sweat and blocks direct solar glare from the eyes.",
            "stock": 40,
            "aiTags": ["cap", "puma", "headwear", "sporty", "sweat-wicking"],
            "weatherTags": ["sunny", "dry", "hot", "summer"],
            "essentials": False
        }
    ]

    db.products.insert_many(products_data)
    print(f"Seeded {len(products_data)} products into database.")

    # 3. Seed Campaigns
    db.campaigns.insert_many([
        {
            "title": "Pre-Monsoon Splash Sale",
            "subtitle": "Prepare before the skies open up. Lock prices now!",
            "discount": "Up to 40% Off on Waterproof Gear",
            "bgGradient": "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
            "active": True
        },
        {
            "title": "Winter Warm-Up Campaign",
            "subtitle": "Pre-book winter jackets at summer rates.",
            "discount": "Price Lock enabled for all Thermals & Coats",
            "bgGradient": "linear-gradient(135deg, #4c1d95 0%, #d946ef 100%)",
            "active": True
        }
    ])
    print("Seeded active seasonal campaigns.")

    # 4. Seed Weather configurations
    db.weather.insert_many([
        {
            "location": "Mumbai",
            "temp": 28,
            "humidity": 92,
            "condition": "Heavy Rain",
            "season": "Monsoon",
            "readinessScore": 40,
            "missingEssentials": ["Myntra Active Waterproof Raincoat", "Anti-Skid Rain-Ready Boots"]
        },
        {
            "location": "Delhi",
            "temp": 9,
            "humidity": 60,
            "condition": "Dense Fog & Chill",
            "season": "Winter",
            "readinessScore": 35,
            "missingEssentials": ["Thermoregulation Puffer Jacket", "Merino Wool Thermal Inner Set"]
        },
        {
            "location": "Bangalore",
            "temp": 34,
            "humidity": 45,
            "condition": "Sunny & Dry",
            "season": "Summer",
            "readinessScore": 50,
            "missingEssentials": ["Ultra-Light Breathable Linen Shirt", "UV Protection Polarized Sunglasses"]
        }
    ])
    print("Seeded municipal weather presets.")

    # 5. Seed Coupons
    db.coupons.insert_many([
        {
            "code": "SEASONSENSE",
            "description": "Unlock 20% Instant Discount on the overall checkout cart.",
            "discountType": "percentage",
            "value": 20,
            "active": True
        },
        {
            "code": "MONSOON20",
            "description": "Monsoon outfit extra savings coupon.",
            "discountType": "percentage",
            "value": 15,
            "active": True
        }
    ])
    print("Seeded coupon promotion codes.")

    # 6. Seed Analytics
    db.analytics.insert_one({
        "sales": 24890,
        "revenue": 3204900,
        "bundleConversion": 18.4,
        "aiAccuracy": 94.2,
        "mostPurchasedCombo": "Monsoon Shield Combo",
        "seasonalDemand": [
            { "name": "Monsoon", "value": 45 },
            { "name": "Winter", "value": 35 },
            { "name": "Summer", "value": 20 }
        ],
        "revenueTrend": [
            { "date": "Mon", "revenue": 420000 },
            { "date": "Tue", "revenue": 380000 },
            { "date": "Wed", "revenue": 510000 },
            { "date": "Thu", "revenue": 490000 },
            { "date": "Fri", "revenue": 620000 },
            { "date": "Sat", "revenue": 780000 },
            { "date": "Sun", "revenue": 840000 }
        ]
    })
    print("Seeded initial analytics dashboards history.")
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_db()
