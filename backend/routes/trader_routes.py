# routes/trader_routes.py

from flask import Blueprint, request, jsonify
from db import db
from bson import ObjectId

trader_collection = db["traders"]


trader_bp = Blueprint('trader_bp', __name__)


# 1. Create a Trader
@trader_bp.route("/traders", methods=["POST"])
def create_trader():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400
        if not trader_collection.find_one({"email": data.get("email")}):
            return jsonify({"error": "Trader with this email already exists"}), 400
        result = trader_collection.insert_one(data)

        return jsonify({
            "message": "Trader created successfully!",
            "trader_id": str(result.inserted_id)
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 2. Get All Traders
@trader_bp.route("/traders", methods=["GET"])
def get_all_traders():
    try:
        traders = list(trader_collection.find())
        for trader in traders:
            trader["_id"] = str(trader["_id"])  # Convert ObjectId to string for JSON serialization

        return jsonify(traders), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 3. Get Trader by ID
@trader_bp.route("/trader/<trader_id>", methods=["GET"])
def get_trader(trader_id):
    try:
        trader = trader_collection.find_one({"_id": ObjectId(trader_id)})

        if not trader:
            return jsonify({"error": "Trader not found"}), 404

        trader["_id"] = str(trader["_id"])
        return jsonify(trader), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 4. Update Trader by ID
@trader_bp.route("/trader/<trader_id>", methods=["PUT"])
def update_trader(trader_id):
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "No data provided"}), 400

        result = trader_collection.update_one(
            {"_id": ObjectId(trader_id)},
            {"$set": data}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Trader not found"}), 404

        return jsonify({"message": "Trader updated successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# 5. Delete Trader by ID
@trader_bp.route("/trader/<trader_id>", methods=["DELETE"])
def delete_trader(trader_id):
    try:
        result = trader_collection.delete_one({"_id": ObjectId(trader_id)})

        if result.deleted_count == 0:
            return jsonify({"error": "Trader not found"}), 404

        return jsonify({"message": "Trader deleted successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
