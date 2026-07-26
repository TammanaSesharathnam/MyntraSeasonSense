import os
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
from sklearn.metrics.pairwise import cosine_similarity
from pymongo import MongoClient
import time
import threading

class RecommendationEngine:
    def __init__(self):
        self.products_df = None
        self.tfidf_matrix = None
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.nn_model = NearestNeighbors(metric='cosine', algorithm='brute')
        self.db = None
        
        # Thread-safe in-memory caching dictionary:
        # keys: (user_id, location, condition, budget, preferences_tuple) -> (timestamp, data)
        self.cache = {}
        self.cache_duration = 300  # 5 minutes cache expiry
        self.lock = threading.Lock()
        
        self.connect_db()

    def connect_db(self):
        try:
            mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/seasonsense")
            client = MongoClient(mongo_uri)
            self.db = client.get_database()
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")

    def train(self):
        """Loads products from MongoDB and trains the TF-IDF representation & Nearest Neighbors model"""
        if self.db is None:
            self.connect_db()
        
        try:
            products = list(self.db.products.find({}))
            if not products:
                print("No products in database to train recommendations.")
                return False

            # Convert to DataFrame
            data = []
            for p in products:
                # Compile a rich text metadata string for content matching
                ai_tags_str = " ".join(p.get("aiTags", []))
                weather_tags_str = " ".join(p.get("weatherTags", []))
                metadata = (
                    f"{p.get('name', '')} {p.get('brand', '')} {p.get('category', '')} "
                    f"{p.get('gender', 'Unisex')} {p.get('color', '')} {p.get('season', '')} "
                    f"{p.get('material', '')} {p.get('description', '')} {ai_tags_str} {weather_tags_str}"
                )
                
                data.append({
                    "id": str(p["_id"]),
                    "name": p.get("name", ""),
                    "brand": p.get("brand", ""),
                    "category": p.get("category", ""),
                    "gender": p.get("gender", "Unisex"),
                    "color": p.get("color", ""),
                    "season": p.get("season", ""),
                    "material": p.get("material", ""),
                    "description": p.get("description", ""),
                    "price": p.get("price", 0),
                    "originalPrice": p.get("originalPrice", 0),
                    "discount": p.get("discount", 0),
                    "rating": p.get("rating", 4.0),
                    "reviews": p.get("reviews", 0),
                    "purchaseCount": p.get("purchaseCount", 0),
                    "essentials": p.get("essentials", False),
                    "aiTags": p.get("aiTags", []),
                    "weatherTags": p.get("weatherTags", []),
                    "metadata": metadata
                })
            
            self.products_df = pd.DataFrame(data)

            # Fit vectorizer & nearest neighbors
            self.tfidf_matrix = self.vectorizer.fit_transform(self.products_df["metadata"])
            self.nn_model.fit(self.tfidf_matrix)
            
            # Clear cache on retrain
            with self.lock:
                self.cache.clear()
                
            print(f"ML Recommendation Engine trained successfully with {len(self.products_df)} products.")
            return True
        except Exception as e:
            print(f"Training failed: {e}")
            return False

    def get_similar_products(self, product_id, top_n=6):
        """Finds items with highest metadata similarity using trained Nearest Neighbors model"""
        if self.products_df is None:
            self.train()
        
        if self.products_df is None or product_id not in self.products_df["id"].values:
            return []

        try:
            idx = self.products_df[self.products_df["id"] == product_id].index[0]
            query_vector = self.tfidf_matrix[idx]
            
            # Find nearest neighbors (retrieve top_n + 1 since the query item itself will be closest)
            distances, indices = self.nn_model.kneighbors(query_vector, n_neighbors=min(top_n + 1, len(self.products_df)))
            
            similar_indices = indices[0][1:]  # Exclude target product itself
            similar_ids = self.products_df.iloc[similar_indices]["id"].tolist()
            
            # Load details from DB in proper order
            from bson.objectid import ObjectId
            db_products = {str(p["_id"]): p for p in self.db.products.find({"_id": {"$in": [ObjectId(sid) for sid in similar_ids]}})}
            
            results = []
            for sid in similar_ids:
                if sid in db_products:
                    p = db_products[sid]
                    p["id"] = str(p["_id"])
                    del p["_id"]
                    results.append(p)
            return results
        except Exception as e:
            print(f"Error getting similar products: {e}")
            return []

    def get_personalized_recommendations(self, user_profile, current_weather, top_n=10):
        """Calculates combined score based on weather, budget alignment, style preferences, ratings, and purchase history"""
        if self.products_df is None:
            self.train()
        
        if self.products_df is None or len(self.products_df) == 0:
            return []

        user_id = str(user_profile.get("id", "guest"))
        location = current_weather.get("location", "Mumbai") if current_weather else "Mumbai"
        condition = current_weather.get("condition", "Sunny") if current_weather else "Sunny"
        budget = int(user_profile.get("budget", 5000))
        prefs = tuple(user_profile.get("preferences", []))
        
        # Check cache
        cache_key = (user_id, location, condition, budget, prefs)
        with self.lock:
            if cache_key in self.cache:
                timestamp, data = self.cache[cache_key]
                if time.time() - timestamp < self.cache_duration:
                    return data

        df = self.products_df.copy()
        df["match_score"] = 40.0  # Base score

        # 1. Weather compatibility
        if current_weather:
            season = current_weather.get("season", "").lower()
            temp = current_weather.get("temp", 25)
            w_cond = current_weather.get("condition", "").lower()

            # Boost seasonal items
            df.loc[df["season"].str.lower() == season, "match_score"] += 25
            
            # Boost specific weather conditions
            if "rain" in w_cond or "monsoon" in season:
                # Rain gear
                df.loc[df["metadata"].str.lower().str.contains("waterproof|rain|umbrella|anti-skid|rubber|windbreaker|dry"), "match_score"] += 20
            elif temp < 20 or "winter" in season:
                # Winter warmers
                df.loc[df["metadata"].str.lower().str.contains("warm|thermal|wool|jacket|hoodie|sweatshirt|beanie|gloves|fleece|puffer"), "match_score"] += 20
            elif temp > 30 or "summer" in season:
                # Breathable lightweight wear
                df.loc[df["metadata"].str.lower().str.contains("linen|cotton|breathable|shorts|t-shirt|sunglasses|cap|sandals"), "match_score"] += 20

        # 2. User Preferences (Cos Similarity of preferences vector)
        prefs_list = list(prefs)
        if prefs_list:
            pref_text = " ".join(prefs_list)
            try:
                pref_vector = self.vectorizer.transform([pref_text])
                pref_sims = cosine_similarity(pref_vector, self.tfidf_matrix)[0]
                df["match_score"] += pref_sims * 25
            except Exception as e:
                print(f"Error calculating preferences similarity: {e}")

        # 3. User Budget alignment
        # Keep price within budget, slightly penalize items that exceed user budget
        df.loc[df["price"] <= budget, "match_score"] += 15
        # Items exceeding budget get scaled penalty
        df.loc[df["price"] > budget, "match_score"] -= (df["price"] - budget) * 0.005

        # 4. Rating and popular demand
        df["match_score"] += df["rating"] * 3.0
        df["match_score"] += np.log1p(df["purchaseCount"]) * 2.0

        # 5. Purchase History and Wishlist (Collaborative & Content boost)
        # Fetch previous purchased items (from user orders)
        purchased_product_names = []
        if user_profile and "orders" in user_profile and user_profile["orders"]:
            # Combine descriptions of all purchased products
            for order in user_profile["orders"]:
                for item in order.get("items", []):
                    purchased_product_names.append(item.get("name", ""))
                    # Penalize exact purchased products so they aren't recommended again
                    df.loc[df["name"] == item.get("name"), "match_score"] -= 100

            if purchased_product_names:
                history_text = " ".join(purchased_product_names)
                try:
                    history_vector = self.vectorizer.transform([history_text])
                    history_sims = cosine_similarity(history_vector, self.tfidf_matrix)[0]
                    # Recommend items similar to history but not exact duplicates
                    df["match_score"] += history_sims * 15
                except:
                    pass

        # Ensure gender match
        user_gender = user_profile.get("gender", "Unisex")
        if user_gender != "Unisex":
            # Penalize opposite gender items heavily
            df.loc[(df["gender"] != "Unisex") & (df["gender"] != user_gender), "match_score"] -= 50

        # Normalize score between 60% and 99% for aiConfidence
        min_score = df["match_score"].min()
        max_score = df["match_score"].max()
        if max_score > min_score:
            df["aiConfidence"] = np.round(60 + (df["match_score"] - min_score) / (max_score - min_score) * 39)
        else:
            df["aiConfidence"] = 90
        
        # Sort recommendations
        df = df.sort_values(by=["aiConfidence", "rating"], ascending=False)
        top_ids = df.head(top_n)["id"].tolist()

        # Load from DB in matching order
        from bson.objectid import ObjectId
        products_map = {str(p["_id"]): p for p in self.db.products.find({"_id": {"$in": [ObjectId(sid) for sid in top_ids]}})}
        
        sorted_products = []
        for sid in top_ids:
            if sid in products_map:
                p = products_map[sid]
                p["id"] = str(p["_id"])
                del p["_id"]
                p["aiConfidence"] = int(df.loc[df["id"] == sid, "aiConfidence"].values[0])
                sorted_products.append(p)
        
        # Cache results
        with self.lock:
            self.cache[cache_key] = (time.time(), sorted_products)

        return sorted_products

    def get_seasonal_products(self, season="Monsoon", top_n=10):
        """Returns top products filtered by season and sorted by ratings"""
        if self.products_df is None:
            self.train()
        if self.products_df is None:
            return []

        df = self.products_df[self.products_df["season"].str.lower() == season.lower()].copy()
        if df.empty:
            df = self.products_df.copy()
        
        df = df.sort_values(by=["rating", "purchaseCount"], ascending=False)
        top_ids = df.head(top_n)["id"].tolist()

        from bson.objectid import ObjectId
        db_products = list(self.db.products.find({"_id": {"$in": [ObjectId(sid) for sid in top_ids]}}))
        for p in db_products:
            p["id"] = str(p["_id"])
            del p["_id"]
            p["aiConfidence"] = 95
        return db_products

    def get_trending_products(self, season="Monsoon", weather_cond="Rain", top_n=10):
        """Identify trending products based on ratings, purchase count, season, and weather"""
        if self.products_df is None:
            self.train()
        if self.products_df is None:
            return []

        df = self.products_df.copy()
        df["trend_score"] = df["rating"] * 4 + np.log1p(df["purchaseCount"]) * 3
        
        # Boost current season and weather suitability
        df.loc[df["season"].str.lower() == season.lower(), "trend_score"] += 15
        
        if "rain" in weather_cond.lower() or "monsoon" in season.lower():
            df.loc[df["metadata"].str.lower().str.contains("waterproof|rain|umbrella|anti-skid"), "trend_score"] += 15
        elif "winter" in season.lower():
            df.loc[df["metadata"].str.lower().str.contains("warm|jacket|hoodie|thermal"), "trend_score"] += 15

        df = df.sort_values(by="trend_score", ascending=False)
        top_ids = df.head(top_n)["id"].tolist()

        from bson.objectid import ObjectId
        db_products = list(self.db.products.find({"_id": {"$in": [ObjectId(sid) for sid in top_ids]}}))
        for p in db_products:
            p["id"] = str(p["_id"])
            del p["_id"]
            p["aiConfidence"] = 92
        return db_products

    def get_weather_based_products(self, condition="Rain", temp=25, top_n=10):
        """Returns products specifically matched to current weather condition & temperature"""
        if self.products_df is None:
            self.train()
        if self.products_df is None:
            return []

        df = self.products_df.copy()
        df["weather_score"] = 50.0

        cond_lower = condition.lower()
        if "rain" in cond_lower or "monsoon" in cond_lower:
            df.loc[df["metadata"].str.lower().str.contains("waterproof|rain|umbrella|anti-skid|rubber|windbreaker"), "weather_score"] += 30
        elif temp < 20:
            df.loc[df["metadata"].str.lower().str.contains("warm|thermal|wool|jacket|hoodie|sweatshirt|beanie|gloves|fleece|puffer"), "weather_score"] += 30
        elif temp > 30:
            df.loc[df["metadata"].str.lower().str.contains("linen|cotton|breathable|shorts|t-shirt|sunglasses|cap|sandals"), "weather_score"] += 30

        df = df.sort_values(by="weather_score", ascending=False)
        top_ids = df.head(top_n)["id"].tolist()

        from bson.objectid import ObjectId
        db_products = list(self.db.products.find({"_id": {"$in": [ObjectId(sid) for sid in top_ids]}}))
        for p in db_products:
            p["id"] = str(p["_id"])
            del p["_id"]
            p["aiConfidence"] = 94
        return db_products

    def get_seasonal_bundles(self, season="Monsoon", budget=5000, preferences=[], gender="Unisex"):
        """Constructs dynamically optimized outfit combos matching target parameters (Topwear + Bottomwear + Footwear)"""
        if self.products_df is None:
            self.train()
        if self.products_df is None or len(self.products_df) == 0:
            return None

        # Filter by gender and season (or backup)
        df_gender = self.products_df.copy()
        if gender in ["Men", "Women"]:
            df_gender = df_gender[(df_gender["gender"] == "Unisex") | (df_gender["gender"] == gender)]

        # Filter products matching season
        candidates = df_gender[df_gender["season"].str.lower() == season.lower()].copy()
        if candidates.empty:
            candidates = df_gender.copy()

        # Score candidates based on preference matching
        candidates["score"] = candidates["rating"] * 2.0 + np.log1p(candidates["purchaseCount"])
        if preferences:
            pref_text = " ".join(preferences)
            try:
                pref_vector = self.vectorizer.transform([pref_text])
                pref_sims = cosine_similarity(pref_vector, self.tfidf_matrix)[0]
                candidates["score"] += pref_sims * 20
            except:
                pass

        # Split into slots
        topwear = candidates[candidates["category"] == "Topwear"].sort_values(by="score", ascending=False)
        bottomwear = candidates[candidates["category"] == "Bottomwear"].sort_values(by="score", ascending=False)
        footwear = candidates[candidates["category"] == "Footwear"].sort_values(by="score", ascending=False)

        if topwear.empty or bottomwear.empty or footwear.empty:
            # Fallback to general category slots if specific season splits are empty
            topwear = df_gender[df_gender["category"] == "Topwear"].sort_values(by="rating", ascending=False)
            bottomwear = df_gender[df_gender["category"] == "Bottomwear"].sort_values(by="rating", ascending=False)
            footwear = df_gender[df_gender["category"] == "Footwear"].sort_values(by="rating", ascending=False)

        if topwear.empty or bottomwear.empty or footwear.empty:
            return None

        # Greedy choice: try to find the highest-scoring combination that fits the budget
        selected = []
        found_combo = False
        
        # Take the top 10 scoring items of each slot and find a matching combination
        top_t = topwear.head(10)
        top_b = bottomwear.head(10)
        top_f = footwear.head(10)

        best_combo = None
        best_combo_score = -9999

        for _, t_row in top_t.iterrows():
            for _, b_row in top_b.iterrows():
                for _, f_row in top_f.iterrows():
                    total_p = t_row["price"] + b_row["price"] + f_row["price"]
                    if total_p <= budget:
                        combo_score = t_row["score"] + b_row["score"] + f_row["score"]
                        if combo_score > best_combo_score:
                            best_combo_score = combo_score
                            best_combo = [t_row["id"], b_row["id"], f_row["id"]]
                            found_combo = True

        if not found_combo:
            # Fallback to the absolute top of each list if nothing fits the budget
            best_combo = [topwear.iloc[0]["id"], bottomwear.iloc[0]["id"], footwear.iloc[0]["id"]]

        from bson.objectid import ObjectId
        db_products = list(self.db.products.find({"_id": {"$in": [ObjectId(sid) for sid in best_combo]}}))
        
        formatted_items = []
        original_total = 0
        bundle_total = 0
        for p in db_products:
            p["id"] = str(p["_id"])
            del p["_id"]
            original_total += p.get("originalPrice", p.get("price") * 1.4)
            bundle_total += p.get("price")
            formatted_items.append(p)

        # Dynamic bundle offer: extra 15% discount
        discounted_bundle_total = int(bundle_total * 0.85)
        savings = int(original_total - discounted_bundle_total)
        value_index = int((savings / original_total) * 100) if original_total > 0 else 0

        # Choose bundle name based on season
        bundle_name = f"Myntra AI Smart {season} Outfit Combo"
        if season == "Monsoon":
            bundle_name = "Myntra AI Monsoon Rain-Ready Shield Combo"
        elif season == "Winter":
            bundle_name = "Myntra AI Cozy Winter Warmth Combo"
        elif season == "Summer":
            bundle_name = "Myntra AI breezy Summer Cruise Combo"

        return {
            "bundleName": bundle_name,
            "items": formatted_items,
            "originalTotal": int(original_total),
            "bundleTotal": discounted_bundle_total,
            "savings": savings,
            "valueIndex": value_index
        }
