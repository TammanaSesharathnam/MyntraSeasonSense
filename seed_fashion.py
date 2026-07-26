import os
import random
import bcrypt
import kagglehub
import pandas as pd
from pymongo import MongoClient

def get_deterministic_image(brand, name, category, gender):
    # Deterministic hash index
    import hashlib
    h = int(hashlib.md5(f"{brand} {name}".encode("utf-8")).hexdigest(), 16)
    
    men_topwear = [
        "1503342217505-b0a15ec3261c", "1596755094514-f87e34085b2c", "1617137968427-85924c800a22",
        "1583743814966-8936f5b7be1a", "1618354691373-d851c5c3a990", "1620799140408-edc6dcb6d633",
        "1492562080023-ab3db95bfbce", "1507679799987-c73779587ccf", "1519085360753-af0119f7cbe7",
        "1602810318383-e386cc2a3ccf", "1603252109303-2751441dd157", "1500648767791-00dcc994a43e",
        "1505022610485-0249ba5b3675", "1618517351616-38fb9c5210c6"
    ]
    men_bottomwear = [
        "1542272604-787c3835535d", "1624378439575-d8705ad7ae80", "1479064555552-3ef4979f8908",
        "1591195853828-11db59a44f6b", "1517445312882-bc9910d016b7", "1617137984095-74e4e5e3613f",
        "1506630448388-4e683c67ddb0"
    ]
    men_footwear = [
        "1549298916-b41d501d3772", "1595950653106-6c9ebd614d3a", "1560769629-975ec94e6a86",
        "1539185441755-769473a23570", "1606107557195-0e29a4b5b4aa", "1543163521-1bf539c55dd2",
        "1534438327276-14e5300c3a48"
    ]
    women_topwear = [
        "1509631179647-0177331693ae", "1494790108377-be9c29b29330", "1529139574466-a303027c1d8b",
        "1515886657613-9f3515b0c78f", "1539109136881-3be0616acf4b", "1496747611176-843222e1e57c",
        "1581044777550-4cfa60707c03", "1618244972963-dbee1a7edc95", "1572804013309-59a88b7e92f1"
    ]
    women_bottomwear = [
        "1541099649105-f69ad21f3246", "1551854838-212c50b4c184"
    ]
    women_footwear = [
        "1562183241-b937e95585b6", "1543163521-1bf539c55dd2", "1595950653106-6c9ebd614d3a"
    ]
    accessories = [
        "1511499767150-a48a237f0083", "1588850561407-ed78c282e89b", "1523275335684-37898b6baf30",
        "1527853787696-f7be74f2e39a", "1553062407-98eeb64c6a62", "1598440947619-2c35fc9aa908"
    ]
    kids = [
        "1596464716127-f2a82984de30", "1502086223501-7ea6ecd79368",
        "1509631179647-0177331693ae", "1494790108377-be9c29b29330", "1529139574466-a303027c1d8b",
        "1515886657613-9f3515b0c78f", "1503342217505-b0a15ec3261c", "1596755094514-f87e34085b2c",
        "1618354691373-d851c5c3a990"
    ]

    name_lower = f"{brand} {name}".lower()
    is_kid = any(w in name_lower for w in ["kids", "junior", "boy", "girl", "child", "youth", "baby"])
    
    if is_kid:
        photo_id = kids[h % len(kids)]
    elif category == "Accessories":
        photo_id = accessories[h % len(accessories)]
    elif category == "Bottomwear":
        pool = women_bottomwear if gender == "Women" else men_bottomwear
        photo_id = pool[h % len(pool)]
    elif category == "Footwear":
        pool = women_footwear if gender == "Women" else men_footwear
        photo_id = pool[h % len(pool)]
    else: # Topwear
        pool = women_topwear if gender == "Women" else men_topwear
        photo_id = pool[h % len(pool)]
        
    return f"https://images.unsplash.com/photo-{photo_id}?w=600&q=80"

def download_and_preprocess():
    print("Step 1: Downloading fashion clothing products catalog dataset from Kaggle...")
    path = kagglehub.dataset_download("shivamb/fashion-clothing-products-catalog")
    csv_file = None
    for root, dirs, files in os.walk(path):
        for f in files:
            if f.endswith('.csv'):
                csv_file = os.path.join(root, f)
                break
    
    if not csv_file:
        raise FileNotFoundError("Could not find Myntra products CSV file in downloaded archive.")

    print(f"Step 2: Loading dataset from: {csv_file}")
    df = pd.read_csv(csv_file)
    
    print(f"Original record count: {len(df)}")
    
    # Preprocessing
    # 1. Remove duplicate products based on name
    df.drop_duplicates(subset=["ProductName"], keep="first", inplace=True)
    print(f"Record count after removing duplicates: {len(df)}")
    
    # 2. Handle missing values
    df["ProductBrand"].fillna("Myntra Brand", inplace=True)
    df["Description"].fillna("Premium apparel catalog item from Myntra. Designed with high comfort fabric and modern fit styling.", inplace=True)
    df["PrimaryColor"].fillna("Multi", inplace=True)
    
    # 3. Clean Gender
    df["Gender"] = df["Gender"].apply(lambda g: "Women" if "women" in str(g).lower() else ("Men" if "men" in str(g).lower() else "Unisex"))
    
    # 4. Limit to 3000 items to keep things highly responsive
    df = df.sample(n=min(3000, len(df)), random_state=42).reset_index(drop=True)
    print(f"Curated list count for seeding: {len(df)}")

    processed_products = []
    
    for idx, row in df.iterrows():
        name = str(row["ProductName"])
        desc = str(row["Description"])
        brand = str(row["ProductBrand"])
        gender = str(row["Gender"])
        color = str(row["PrimaryColor"])
        raw_price = row["Price (INR)"]
        
        # Ensure reasonable price boundaries
        price = int(raw_price) if not pd.isna(raw_price) and raw_price > 0 else random.randint(599, 4999)
        if price < 299:
            price = random.randint(299, 999)
        
        # Assign category using keyword matching
        name_lower = name.lower() + " " + desc.lower()
        
        category = "Accessories"
        if any(w in name_lower for w in ["shirt", "tshirt", "t-shirt", "top", "tunics", "kurtas", "blazer", "jacket", "sweatshirt", "hoodie", "raincoat", "shrug", "sweater", "cardigan", "kurta", "sherwani", "waistcoat"]):
            category = "Topwear"
        elif any(w in name_lower for w in ["jeans", "trousers", "pants", "shorts", "skirt", "leggings", "chinos", "track pants", "jeggings", "capris", "salwar", "palazzos"]):
            category = "Bottomwear"
        elif any(w in name_lower for w in ["shoes", "sneakers", "boots", "sandals", "flats", "heels", "slippers", "flip flops", "loafers", "oxfords"]):
            category = "Footwear"

        # Assign season based on keywords or distribute evenly
        season = "Spring"
        if any(w in name_lower for w in ["raincoat", "waterproof", "quick dry", "umbrella", "anti-skid", "monsoon", "rain", "drizzle"]):
            season = "Monsoon"
        elif any(w in name_lower for w in ["jacket", "hoodie", "sweatshirt", "sweater", "wool", "fleece", "puffer", "thermal", "beanie", "gloves", "muffler", "winter"]):
            season = "Winter"
        elif any(w in name_lower for w in ["linen", "shorts", "t-shirt", "sunglasses", "sandals", "cap", "summer", "sun", "sleeveless"]):
            season = "Summer"
        else:
            # Distribute residual items randomly to ensure all season categories are rich
            season = random.choice(["Spring", "Summer", "Winter", "Monsoon"])

        # Extract material
        material = "Cotton Blend"
        for mat in ["cotton", "linen", "wool", "polyester", "leather", "denim", "silk", "nylon", "fleece", "viscose", "acrylic", "suede", "rubber", "canvas"]:
            if mat in name_lower:
                material = mat.capitalize()
                break

        # Map to Unsplash Image
        image_url = get_deterministic_image(brand, name, category, gender)

        # Generate weather suitability tags based on season
        weather_tags = []
        if season == "Monsoon":
            weather_tags = ["rain", "wet", "monsoon", "drizzle", "overcast", "humid"]
        elif season == "Winter":
            weather_tags = ["cold", "chill", "fog", "frost", "snow", "windy"]
        elif season == "Summer":
            weather_tags = ["sunny", "hot", "dry", "humid", "summer", "glare"]
        else: # Spring
            weather_tags = ["sunny", "breeze", "mild", "pleasant", "spring", "cloudy"]

        # Generate AI tags
        ai_tags = ["casual"]
        if "formal" in name_lower or "office" in name_lower or "suit" in name_lower or "blazer" in name_lower or brand in ["Marks & Spencer"]:
            ai_tags = ["formal", "office", "premium"]
        elif "active" in name_lower or "sport" in name_lower or "run" in name_lower or "fit" in name_lower or brand in ["Puma", "HRX by Hrithik Roshan"]:
            ai_tags = ["sporty", "athleisure", "activewear"]
        else:
            ai_tags = ["casual", "streetwear", "everyday"]

        if random.random() < 0.25:
            ai_tags.append("essential")
        
        rating = round(random.uniform(3.6, 4.9), 1)
        reviews = random.randint(15, 2400)
        discount = random.choice([10, 15, 20, 30, 40, 50])
        original_price = int(price / (1 - discount / 100))

        processed_products.append({
            "name": name,
            "brand": brand,
            "price": price,
            "originalPrice": original_price,
            "discount": discount,
            "rating": rating,
            "reviews": reviews,
            "category": category,
            "gender": gender,
            "color": color,
            "season": season,
            "material": material,
            "image": image_url,
            "description": desc,
            "stock": random.randint(10, 100),
            "aiTags": ai_tags,
            "weatherTags": weather_tags,
            "essentials": "essential" in ai_tags,
            "purchaseCount": random.randint(5, 500)
        })

    return processed_products

def seed_db():
    try:
        products = download_and_preprocess()
    except Exception as e:
        print(f"Error during dataset processing: {e}")
        return

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
            "email": "user@myntra.com",
            "password": user_pw,
            "username": "MyntraFashionista",
            "role": "user",
            "location": "Mumbai",
            "address": "Flat 402, Sea Green Apartments, Senapati Bapat Marg, Lower Parel, Mumbai - 400013",
            "preferences": ["Casual", "Athleisure", "Premium Wear"],
            "budget": 6000,
            "wishlist": [],
            "recentlyViewed": [],
            "orders": []
        },
        {
            "email": "admin@myntra.com",
            "password": admin_pw,
            "username": "MyntraAdministrator",
            "role": "admin",
            "location": "Bengaluru",
            "address": "Myntra Tech Park, Indiranagar, Bengaluru - 560038",
            "preferences": ["Designer", "Premium Wear"],
            "budget": 15000,
            "wishlist": [],
            "recentlyViewed": [],
            "orders": []
        }
    ])
    print("Seeded default users (user@myntra.com / password123, admin@myntra.com / admin123).")

    # 2. Insert Products
    db.products.insert_many(products)
    print(f"Seeded {len(products)} products into database.")

    # 3. Seed Campaigns
    db.campaigns.insert_many([
        {
            "title": "Myntra Monsoon End-of-Reason Sale",
            "subtitle": "Adapt to heavy downpours. High quality rainwear at 40% off.",
            "discount": "Up to 50% Off on Waterproof Gears & Windbreakers",
            "bgGradient": "linear-gradient(135deg, #1e3a8a 0%, #0284c7 100%)",
            "active": True
        },
        {
            "title": "Winter Wear Pre-Booking Campaign",
            "subtitle": "Beat the winter chill. Lock prices for winter collection today.",
            "discount": "Price Lock enabled for Hoodies, Sweaters & Puffers",
            "bgGradient": "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
            "active": True
        }
    ])
    print("Seeded active seasonal campaigns.")

    # 4. Seed Weather configurations
    db.weather.insert_many([
        {
            "location": "Mumbai",
            "temp": 26,
            "humidity": 95,
            "condition": "Heavy Monsoonal Rain",
            "season": "Monsoon",
            "readinessScore": 40,
            "missingEssentials": []
        },
        {
            "location": "Delhi",
            "temp": 12,
            "humidity": 55,
            "condition": "Foggy & Cold Breeze",
            "season": "Winter",
            "readinessScore": 30,
            "missingEssentials": []
        },
        {
            "location": "Bangalore",
            "temp": 32,
            "humidity": 40,
            "condition": "Sunny & Dry Clear Skies",
            "season": "Summer",
            "readinessScore": 55,
            "missingEssentials": []
        }
    ])
    print("Seeded municipal weather presets.")

    # 5. Seed Coupons
    db.coupons.insert_many([
        {
            "code": "MYNTRA20",
            "description": "Unlock 20% Instant Discount on the overall checkout cart.",
            "discountType": "percentage",
            "value": 20,
            "active": True
        },
        {
            "code": "MONSOONCOMBO",
            "description": "Monsoon outfit extra savings coupon.",
            "discountType": "percentage",
            "value": 15,
            "active": True
        }
    ])
    print("Seeded promotion coupon codes.")

    # 6. Seed Analytics
    db.analytics.insert_one({
        "sales": 58940,
        "revenue": 7654300,
        "bundleConversion": 24.6,
        "aiAccuracy": 95.8,
        "mostPurchasedCombo": "Active Monsoon Outfit Combo",
        "seasonalDemand": [
            { "name": "Monsoon", "value": 45 },
            { "name": "Winter", "value": 30 },
            { "name": "Summer", "value": 15 },
            { "name": "Spring", "value": 10 }
        ],
        "revenueTrend": [
            { "date": "Mon", "revenue": 890000 },
            { "date": "Tue", "revenue": 940000 },
            { "date": "Wed", "revenue": 1050000 },
            { "date": "Thu", "revenue": 1120000 },
            { "date": "Fri", "revenue": 1420000 },
            { "date": "Sat", "revenue": 1780000 },
            { "date": "Sun", "revenue": 1840000 }
        ]
    })
    print("Seeded initial analytics dashboards history.")
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_db()
