# routes/termsheet_routes.py

from flask import Blueprint, request, jsonify
from db import db
import os
from validators.swap_validator import load_reference_swap, validate_swap_against_risk_file

termsheet_collection = db["termsheet"]

termsheet_bp = Blueprint('termsheet_bp', __name__)

# Set path to risk system file
RISK_SYSTEM_FILE = os.path.join(os.path.dirname(__file__), "..", "validators", "risk_system_template.xlsx")

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

@termsheet_bp.route("/get_termsheets", methods=["GET"])
def get_termsheets():
    try:
        email = request.args.get("email")
        if not email:
            return jsonify({"error": "Email parameter is required"}), 400
        traders = list(termsheet_collection.find({"traderId": email}))
        if not traders:
            return jsonify({"message": "No termsheets found for this trader"}), 404
        for trader in traders:
            trader["_id"] = str(trader["_id"])  # Convert ObjectId to string for JSON serialization
        print(traders)
        return jsonify(traders), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@termsheet_bp.route("/validate_swap", methods=["POST"])
def validate_swap():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        result, status = validate_swap_against_risk_file(data)
        return jsonify(result), status

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
from bson.json_util import dumps
from bson.objectid import ObjectId
from flask import Response
@termsheet_bp.route("/get_term", methods=["GET"])
def get_term():
    trader_email = request.args.get("email")
    print("tRADER MAIL", trader_email)

    if not trader_email:
        return jsonify({"error": "Trader email is required"}), 400
    
    # print("hello")
    # all_termsheets = list(termsheet_collection.find())
    # print(f"All termsheets in the database: {all_termsheets}")

    # 1. Find all termsheets for this trader
    trader_termsheets = list(termsheet_collection.find({"_id": ObjectId(trader_email)}))
    print(trader_termsheets)
    result = []

    for termsheet in trader_termsheets:
        tradeId = termsheet.get("tradeId")
        reference_swap = None
        if tradeId:
            reference_swap = load_reference_swap(tradeId)
        result.append({
            "tradeId": tradeId,
            "termsheet": termsheet,
            "reference_swap": reference_swap
        })

    # Convert the result to JSON using bson's dumps function
    return Response(dumps(result), mimetype='application/json')

