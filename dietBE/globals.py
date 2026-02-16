from pymongo import MongoClient

SECRET_KEY = 'mysecretKey'


client = MongoClient("mongodb://localhost:27017")
db = client.Health_profiles