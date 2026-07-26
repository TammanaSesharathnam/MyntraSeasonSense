import jwt
from functools import wraps
from flask import request, jsonify, current_app
from pymongo import MongoClient
from bson.objectid import ObjectId
import os

def get_db():
    mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/seasonsense")
    client = MongoClient(mongo_uri)
    return client.get_database()

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({"error": "Authorization token is missing!"}), 401
        
        try:
            secret = os.getenv("JWT_SECRET_KEY", "seasonsense-super-secret-key-123")
            data = jwt.decode(token, secret, algorithms=["HS256"])
            db = get_db()
            current_user = db.users.find_one({"_id": ObjectId(data["user_id"])})
            if not current_user:
                return jsonify({"error": "Invalid token user!"}), 401
            
            # Format user details
            current_user["id"] = str(current_user["_id"])
            del current_user["_id"]
            if "password" in current_user:
                del current_user["password"]
                
        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token has expired!"}), 401
        except Exception as e:
            return jsonify({"error": f"Invalid token: {str(e)}"}), 401
            
        return f(current_user, *args, **kwargs)
        
    return decorated

def admin_required(f):
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        if current_user.get("role") != "admin":
            return jsonify({"error": "Admin access is required!"}), 403
        return f(current_user, *args, **kwargs)
    return decorated
