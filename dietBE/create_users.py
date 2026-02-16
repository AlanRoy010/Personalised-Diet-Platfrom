from pymongo import MongoClient
import bcrypt
from bson.binary import Binary

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017")
db = client.Health_profiles

clients = db.clients   
users = db.users       


all_clients = clients.find({})

for data in all_clients:
    personal_info = data.get("Personal_info", {})
    username = personal_info.get("username")
    name = personal_info.get("name")
    email = personal_info.get("contact", {}).get("email_id")
    password = name.split()[0].lower() + "_"
    hashed_pw = Binary(bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()))
    
    user_doc = {
        "name": name,
        "username": username,
        "password": hashed_pw,
        "email": email,
        "admin": False
    }
    
    users.insert_one(user_doc)