from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()
try:
    client = MongoClient(os.getenv("MONGODB_URI"))  
    # print(client.server_info())
    db = client["mydatabase"]  # Replace with your database name
    print(db.name)
    print("Connected to MongoDB")
    print(db.list_collection_names())
except Exception as e:
    print("Error connecting to MongoDB:", e)