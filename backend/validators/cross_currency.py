import pandas as pd
import os

# Define economic fields specific to currency swaps
ECONOMIC_FIELDS = [
    "base_currency",
    "quote_currency",
    "base_notional_amount",
    "quote_notional_amount",
    "principal_exchange_initial",
    "principal_exchange_final",
    "amortization_schedule",
    "base_leg_rate_type",
    "quote_leg_rate_type",
    "base_leg_fixed_rate",
    "quote_leg_fixed_rate",
    "base_leg_floating_index",
    "quote_leg_floating_index",
    "basis_spread",
    "base_payment_frequency",
    "quote_payment_frequency",
    "fx_spot_rate",
    "base_holiday_calendar",
    "quote_holiday_calendar",
    "collateral_agreement",
    "effective_date",
    "maturity_date"
]

RISK_FILE = "C:\\Users\\SURBHI\\Termsheet_Validation\\backend\\risk_system.xlsx"
SHEET_NAME = 'currency_risk_swap'

def load_reference_swap(trade_id):
    print(f"Looking up currency swap with trade ID: {trade_id}")
    if not os.path.exists(RISK_FILE):
        print(f"Risk file not found: {RISK_FILE}")
        return None
    try:
        df = pd.read_excel(RISK_FILE, sheet_name=SHEET_NAME)
        print(f"Successfully loaded Excel file with sheet: {SHEET_NAME}")
        
        # Find the trade ID column (case-insensitive)
        trade_id_col = None
        print(f"Available columns: {df.columns.tolist()}")
        
        for col in df.columns:
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
        if not match.empty:
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
            # Determine severity based on field importance
            severity = "high" if field in [
                "base_currency", "quote_currency", "base_notional_amount", 
                "quote_notional_amount", "fx_spot_rate", "effective_date", "maturity_date"
            ] else "medium"
            
            anomalies.append({
                "field": field,
                "current_value": cur_val,
                "reference_value": ref_val,
                "issue": f"Mismatch in {field}",
                "severity": severity
            })
    return anomalies

def validate_currency_notionals(current_swap, fx_tolerance=0.0001):
    """Validates that the notional amounts are consistent with the FX spot rate"""
    try:
        base_notional = float(current_swap.get("base_notional_amount", 0))
        quote_notional = float(current_swap.get("quote_notional_amount", 0))
        fx_rate = float(current_swap.get("fx_spot_rate", 0))
        
        if base_notional <= 0 or quote_notional <= 0 or fx_rate <= 0:
            return [{
                "field": "notional_amounts",
                "issue": "Invalid notional amounts or FX rate (must be positive)",
                "severity": "high"
            }]
            
        # Calculate expected quote notional
        expected_quote_notional = base_notional * fx_rate
        
        # Check if within tolerance
        relative_diff = abs(expected_quote_notional - quote_notional) / quote_notional
        if relative_diff > fx_tolerance:
            return [{
                "field": "notional_amounts",
                "current_value": f"Base: {base_notional}, Quote: {quote_notional}, FX: {fx_rate}",
                "expected_value": f"Expected Quote Notional: {expected_quote_notional}",
                "issue": "Notional amounts inconsistent with FX spot rate",
                "severity": "high"
            }]
        
        return []
    except (ValueError, TypeError, ZeroDivisionError) as e:
        return [{
            "field": "notional_amounts",
            "issue": f"Error validating notional amounts: {str(e)}",
            "severity": "high"
        }]

def validate_currency_swap_against_risk_file(current_swap):
    # First identify the trade ID field in the current swap (case-insensitive)
    trade_id_field = None
    for field in current_swap:
        if field.lower() == "tradeid":
            trade_id_field = field
            break
    
    if trade_id_field is None:
        return {"error": "tradeId is required"}, 400
    
    trade_id = current_swap.get(trade_id_field)
    print(f"Validating currency swap with tradeId: {trade_id}")
    
    if not trade_id:
        return {"error": "tradeId is required"}, 400

    # Internal validation for currency notionals consistency
    notional_anomalies = validate_currency_notionals(current_swap)
    
    # Check against reference data
    reference_swap = load_reference_swap(trade_id)
    print(f"Reference swap found: {reference_swap is not None}")
    
    if reference_swap is None:
        if notional_anomalies:
            return {
                "valid": False,
                "anomalies": notional_anomalies,
                "message": f"No reference swap found in risk file for tradeId {trade_id}, and internal validation found issues."
            }, 404
        else:
            return {
                "valid": False,
                "message": f"No reference swap found in risk file for tradeId {trade_id}."
            }, 404

    # Compare with reference swap
    economic_anomalies = compare_economic_factors(current_swap, reference_swap)
    
    # Combine all anomalies
    all_anomalies = notional_anomalies + economic_anomalies
    
    if all_anomalies:
        return {
            "valid": False,
            "anomalies": all_anomalies,
            "message": "Currency swap validation found issues"
        }, 200
    else:
        return {
            "valid": True,
            "message": "Currency swap matches reference swap in risk file on all economic factors"
        }, 200

# Additional helper functions for more specific validations

def validate_principal_exchange_consistency(current_swap):
    """Validates that principal exchange flags are consistent with amortization"""
    has_amortization = current_swap.get("amortization_schedule", "").strip().lower() not in ["", "none", "bullet"]
    initial_exchange = str(current_swap.get("principal_exchange_initial", "")).strip().lower() == "true"
    final_exchange = str(current_swap.get("principal_exchange_final", "")).strip().lower() == "true"
    
    anomalies = []
    
    if has_amortization and not initial_exchange:
        anomalies.append({
            "field": "principal_exchange_initial",
            "current_value": str(current_swap.get("principal_exchange_initial", "")),
            "issue": "Amortizing swap should have initial principal exchange",
            "severity": "medium"
        })
        
    if has_amortization and not final_exchange:
        anomalies.append({
            "field": "principal_exchange_final",
            "current_value": str(current_swap.get("principal_exchange_final", "")),
            "issue": "Amortizing swap should have final principal exchange",
            "severity": "medium"
        })
    
    return anomalies

def validate_leg_rate_types(current_swap):
    """Validates that the rate types are properly specified"""
    base_rate_type = str(current_swap.get("base_leg_rate_type", "")).strip().lower()
    quote_rate_type = str(current_swap.get("quote_leg_rate_type", "")).strip().lower()
    
    anomalies = []
    
    # Check base leg rate type
    if base_rate_type == "fixed":
        if not current_swap.get("base_leg_fixed_rate"):
            anomalies.append({
                "field": "base_leg_fixed_rate",
                "issue": "Base leg is fixed but no fixed rate specified",
                "severity": "high"
            })
    elif base_rate_type == "floating":
        if not current_swap.get("base_leg_floating_index"):
            anomalies.append({
                "field": "base_leg_floating_index",
                "issue": "Base leg is floating but no floating index specified",
                "severity": "high"
            })
    elif base_rate_type:
        anomalies.append({
            "field": "base_leg_rate_type",
            "current_value": base_rate_type,
            "issue": "Invalid base leg rate type (should be 'fixed' or 'floating')",
            "severity": "high"
        })
        
    # Check quote leg rate type
    if quote_rate_type == "fixed":
        if not current_swap.get("quote_leg_fixed_rate"):
            anomalies.append({
                "field": "quote_leg_fixed_rate",
                "issue": "Quote leg is fixed but no fixed rate specified",
                "severity": "high"
            })
    elif quote_rate_type == "floating":
        if not current_swap.get("quote_leg_floating_index"):
            anomalies.append({
                "field": "quote_leg_floating_index",
                "issue": "Quote leg is floating but no floating index specified",
                "severity": "high"
            })
    elif quote_rate_type:
        anomalies.append({
            "field": "quote_leg_rate_type",
            "current_value": quote_rate_type,
            "issue": "Invalid quote leg rate type (should be 'fixed' or 'floating')",
            "severity": "high"
        })
    
    return anomalies