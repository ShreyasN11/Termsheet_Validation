# routes/trader_stats_routes.py

from flask import Blueprint, request, jsonify
from db import db

from bson import ObjectId

termsheet_collection = db["termsheet"]

stats_bp = Blueprint('stats_bp', __name__)


@stats_bp.route("/trader_stats", methods=["GET"])
def trader_statistics():
    try:
        # get trader email from query params
        trader_email = request.args.get("email")
        print(trader_email)
        if not trader_email:
            return jsonify({"error": "Trader email is required"}), 400

        # 1. Find all termsheets for this trader
        trader_termsheets = list(termsheet_collection.find({"traderId": trader_email}))

        total_documents = len(trader_termsheets)

        fully_validated_count = 0
        total_unvalidated_fields = 0

        # 2. For each termsheet, check if fully validated
        for sheet in trader_termsheets:
            validated = True

            for key, value in sheet.items():
                if isinstance(value, dict) and "validated" in value:
                    if not value["validated"]:
                        validated = False
                        total_unvalidated_fields += 1

            if validated:
                fully_validated_count += 1

        # 3. Calculate validation rate
        validation_rate = ( (fully_validated_count*100.0) / total_documents) if total_documents else 0

        return jsonify({
            "total_documents": total_documents,
            "validation_rate": round(validation_rate, 2),
            "total_unvalidated_fields": total_unvalidated_fields
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
