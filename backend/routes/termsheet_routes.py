# routes/termsheet_routes.py

from flask import Blueprint, request, jsonify
from db import db

termsheet_collection = db["termsheet"]

termsheet_bp = Blueprint('termsheet_bp', __name__)

@termsheet_bp.route("/add_termsheet", methods=["POST"])
def add_termsheet():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400

        result = termsheet_collection.insert_one(data)

        return jsonify({
            "message": "Termsheet added successfully!",
            "termsheet_id": str(result.inserted_id)
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@termsheet_bp.route("/termsheets", methods=["GET"])
def get_all_traders():
    try:
        traders = list(termsheet_collection.find())
        for trader in traders:
            trader["_id"] = str(trader["_id"])  # Convert ObjectId to string for JSON serialization

        return jsonify(traders), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

