import pandas as pd
import os

ECONOMIC_FIELDS = [
    "effective_date",
    "maturity_date",
    "notional_amount",
    "fixed_rate",
    "floating_rate_index",
    "payment_frequency",
    "day_count_convention",
    "reset_dates",
    "discount_curve"
]

RISK_FILE = "C:\\Users\\SURBHI\\Termsheet_Validation\\backend\\risk_system.xlsx"
SHEET_NAME = 'interest_risk_swap'

def load_reference_swap(trade_id):
    print(trade_id)
    if not os.path.exists(RISK_FILE):
        print(f"Risk file not found: {RISK_FILE}")
        return None
    try:
        df = pd.read_excel(RISK_FILE, sheet_name=SHEET_NAME)
        print("tmkc")
        # Find the trade ID column (case-insensitive)
        trade_id_col = None
        print(df.columns)
        for col in df.columns:
            print(col)
            if col.lower() == "tradeid":
                trade_id_col = col
                break
                
        # If we can't find a column with exactly "tradeid", check for similar names
        if trade_id_col is None:
            for col in df.columns:
                if "trade" in col.lower() and "id" in col.lower():
                    trade_id_col = col
                    break
        
        if trade_id_col is None:
            print(f"Couldn't find tradeId column. Available columns: {df.columns.tolist()}")
            return None
            
        # Convert to string for comparison
        df[trade_id_col] = df[trade_id_col].astype(str).str.strip()
        trade_id_str = str(trade_id).strip()
        
        print(f"Looking for tradeId: {trade_id_str}")
        print(f"Available tradeIds: {df[trade_id_col].tolist()}")
        
        match = df[df[trade_id_col] == trade_id_str]
        if not match.empty:
            return match.iloc[0].to_dict()

        # If no exact match, try case-insensitive comparison
        match = df[df[trade_id_col].str.lower() == trade_id_str.lower()]
        print(match)
        if not match.empty:
            print(match.iloc[0])
            return match.iloc[0].to_dict()
            
        return None
    except Exception as e:
        print(f"Error loading reference swap: {e}")
        return None

def compare_economic_factors(current_swap, reference_swap):
    anomalies = []
    for field in ECONOMIC_FIELDS:
        # Handle potential case differences in field names
        current_field = next((k for k in current_swap.keys() if k.lower() == field.lower()), field)
        reference_field = next((k for k in reference_swap.keys() if k.lower() == field.lower()), field)
        
        cur_val = str(current_swap.get(current_field, "")).strip()
        ref_val = str(reference_swap.get(reference_field, "")).strip()
        
        if cur_val != ref_val:
            anomalies.append({
                "field": field,
                "current_value": cur_val,
                "reference_value": ref_val,
                "issue": f"Mismatch in {field}",
                "severity": "high"
            })
    return anomalies

def validate_swap_against_risk_file(current_swap):
    # First identify the trade ID field in the current swap (case-insensitive)
    trade_id_field = None
    for field in current_swap:
        if field.lower() == "tradeid":
            trade_id_field = field
            break
    
    if trade_id_field is None:
        return {"error": "tradeId is required"}, 400
    
    trade_id = current_swap.get(trade_id_field)
    print(f"Validating swap with tradeId: {trade_id}")
    
    if not trade_id:
        return {"error": "tradeId is required"}, 400

    reference_swap = load_reference_swap(trade_id)
    print(f"Reference swap found: {reference_swap is not None}")
    
    if reference_swap is None:
        return {
            "valid": False,
            "message": f"No reference swap found in risk file for tradeId {trade_id}."
        }, 404

    anomalies = compare_economic_factors(current_swap, reference_swap)
    if anomalies:
        return {
            "valid": False,
            "anomalies": anomalies,
            "message": "Economic factor mismatch with reference swap in risk file"
        }, 200
    else:
        return {
            "valid": True,
            "message": "Swap matches reference swap in risk file on all economic factors"
        }, 200