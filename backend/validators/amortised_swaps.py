import pandas as pd
import os
import json
from datetime import datetime

# Define economic fields specific to amortized schedule swaps
ECONOMIC_FIELDS = [
    "amortization_profile",
    "initial_notional",
    "reduction_dates",
    "reduction_amounts",
    "fixed_rate",
    "floating_rate",
    "rate_type",
    "reference_rate",
    "payment_adjustment_rule",
    "residual_notional",
    "effective_date",
    "maturity_date",
    "payment_frequency",
    "day_count_convention",
    "reset_frequency",
    "spread"
]

RISK_FILE = "C:\\Users\\SURBHI\\Termsheet_Validation\\backend\\risk_system.xlsx"
SHEET_NAME = 'amortized_schedule_swap'

def load_reference_swap(trade_id):
    print(f"Looking up amortized schedule swap with trade ID: {trade_id}")
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
        
        # Get values - handle special case for reduction_dates and reduction_amounts which might be arrays
        if field in ["reduction_dates", "reduction_amounts"]:
            cur_val = current_swap.get(current_field, "")
            ref_val = reference_swap.get(reference_field, "")
            
            # Convert to lists if they are strings representing JSON
            if isinstance(cur_val, str) and (cur_val.startswith('[') or cur_val.startswith('{')):
                try:
                    cur_val = json.loads(cur_val)
                except:
                    pass
            if isinstance(ref_val, str) and (ref_val.startswith('[') or ref_val.startswith('{')):
                try:
                    ref_val = json.loads(ref_val)
                except:
                    pass
                    
            # Convert to string for comparison, but special handling for arrays
            if isinstance(cur_val, (list, dict)) and isinstance(ref_val, (list, dict)):
                cur_val_str = json.dumps(cur_val, sort_keys=True)
                ref_val_str = json.dumps(ref_val, sort_keys=True)
            else:
                cur_val_str = str(cur_val).strip()
                ref_val_str = str(ref_val).strip()
        else:
            cur_val_str = str(current_swap.get(current_field, "")).strip()
            ref_val_str = str(reference_swap.get(reference_field, "")).strip()
        
        if cur_val_str != ref_val_str:
            # Determine severity based on field importance
            severity = "high" if field in [
                "amortization_profile", "initial_notional", "reduction_dates", 
                "reduction_amounts", "effective_date", "maturity_date"
            ] else "medium"
            
            anomalies.append({
                "field": field,
                "current_value": cur_val_str,
                "reference_value": ref_val_str,
                "issue": f"Mismatch in {field}",
                "severity": severity
            })
    return anomalies

def validate_amortization_schedule(current_swap):
    """Validates that the amortization schedule is consistent"""
    anomalies = []
    
    # Get amortization profile
    amortization_profile = str(current_swap.get("amortization_profile", "")).strip().lower()
    
    # Check initial notional
    try:
        initial_notional = float(current_swap.get("initial_notional", 0))
        if initial_notional <= 0:
            anomalies.append({
                "field": "initial_notional",
                "current_value": str(initial_notional),
                "issue": "Initial notional must be positive",
                "severity": "high"
            })
    except (ValueError, TypeError):
        anomalies.append({
            "field": "initial_notional",
            "current_value": str(current_swap.get("initial_notional", "")),
            "issue": "Invalid initial notional format",
            "severity": "high"
        })
    
    # Check residual notional if present
    if "residual_notional" in current_swap:
        try:
            residual_notional = float(current_swap.get("residual_notional", 0))
            if residual_notional < 0:
                anomalies.append({
                    "field": "residual_notional",
                    "current_value": str(residual_notional),
                    "issue": "Residual notional cannot be negative",
                    "severity": "high"
                })
            if residual_notional > initial_notional:
                anomalies.append({
                    "field": "residual_notional",
                    "current_value": str(residual_notional),
                    "reference_value": str(initial_notional),
                    "issue": "Residual notional cannot be greater than initial notional",
                    "severity": "high"
                })
        except (ValueError, TypeError):
            anomalies.append({
                "field": "residual_notional",
                "current_value": str(current_swap.get("residual_notional", "")),
                "issue": "Invalid residual notional format",
                "severity": "high"
            })
    
    # Check reduction dates and amounts if custom schedule
    if amortization_profile == "custom" or amortization_profile == "custom schedule":
        # Get reduction dates and amounts
        reduction_dates = current_swap.get("reduction_dates", [])
        reduction_amounts = current_swap.get("reduction_amounts", [])
        
        # Convert to lists if they are strings representing JSON
        if isinstance(reduction_dates, str):
            try:
                reduction_dates = json.loads(reduction_dates)
            except:
                anomalies.append({
                    "field": "reduction_dates",
                    "current_value": reduction_dates,
                    "issue": "Invalid JSON format for reduction dates",
                    "severity": "high"
                })
                reduction_dates = []
                
        if isinstance(reduction_amounts, str):
            try:
                reduction_amounts = json.loads(reduction_amounts)
            except:
                anomalies.append({
                    "field": "reduction_amounts",
                    "current_value": reduction_amounts,
                    "issue": "Invalid JSON format for reduction amounts",
                    "severity": "high"
                })
                reduction_amounts = []
        
        # Check that both are lists
        if not isinstance(reduction_dates, list):
            anomalies.append({
                "field": "reduction_dates",
                "current_value": str(reduction_dates),
                "issue": "Reduction dates must be a list",
                "severity": "high"
            })
        
        if not isinstance(reduction_amounts, list):
            anomalies.append({
                "field": "reduction_amounts",
                "current_value": str(reduction_amounts),
                "issue": "Reduction amounts must be a list",
                "severity": "high"
            })
            
        # Check that lists have the same length
        if len(reduction_dates) != len(reduction_amounts):
            anomalies.append({
                "field": "amortization_schedule",
                "current_value": f"Dates: {len(reduction_dates)}, Amounts: {len(reduction_amounts)}",
                "issue": "Reduction dates and amounts must have the same length",
                "severity": "high"
            })
            
        # Check that dates are in chronological order
        if isinstance(reduction_dates, list) and len(reduction_dates) > 1:
            try:
                dates = [datetime.strptime(date, "%Y-%m-%d") if isinstance(date, str) else date for date in reduction_dates]
                if not all(dates[i] < dates[i+1] for i in range(len(dates)-1)):
                    anomalies.append({
                        "field": "reduction_dates",
                        "current_value": str(reduction_dates),
                        "issue": "Reduction dates must be in chronological order",
                        "severity": "high"
                    })
            except (ValueError, TypeError):
                anomalies.append({
                    "field": "reduction_dates",
                    "current_value": str(reduction_dates),
                    "issue": "Invalid date format in reduction dates",
                    "severity": "high"
                })
                
        # Check that amounts are positive
        if isinstance(reduction_amounts, list):
            try:
                if not all(float(amount) > 0 for amount in reduction_amounts):
                    anomalies.append({
                        "field": "reduction_amounts",
                        "current_value": str(reduction_amounts),
                        "issue": "All reduction amounts must be positive",
                        "severity": "high"
                    })
            except (ValueError, TypeError):
                anomalies.append({
                    "field": "reduction_amounts",
                    "current_value": str(reduction_amounts),
                    "issue": "Invalid amount format in reduction amounts",
                    "severity": "high"
                })
                
        # Check if total reduction exceeds initial notional
        if isinstance(reduction_amounts, list) and initial_notional > 0:
            try:
                total_reduction = sum(float(amount) for amount in reduction_amounts)
                if total_reduction > initial_notional:
                    anomalies.append({
                        "field": "amortization_schedule",
                        "current_value": f"Total reduction: {total_reduction}, Initial notional: {initial_notional}",
                        "issue": "Total reduction amount exceeds initial notional",
                        "severity": "high"
                    })
            except (ValueError, TypeError):
                pass  # Already handled above
    
    # For linear amortization, check if necessary fields are present
    elif amortization_profile == "linear":
        if not current_swap.get("payment_frequency"):
            anomalies.append({
                "field": "payment_frequency",
                "issue": "Payment frequency required for linear amortization",
                "severity": "medium"
            })
    
    return anomalies

def validate_rate_specifications(current_swap):
    """Validates the fixed/floating rate specifications"""
    anomalies = []
    
    # Check rate type
    rate_type = str(current_swap.get("rate_type", "")).strip().lower()
    
    if rate_type == "fixed":
        # Check for fixed rate
        fixed_rate = current_swap.get("fixed_rate")
        if not fixed_rate:
            anomalies.append({
                "field": "fixed_rate",
                "issue": "Fixed rate is required for fixed rate swaps",
                "severity": "high"
            })
        else:
            try:
                fixed_rate_value = float(fixed_rate)
                if fixed_rate_value < 0:
                    anomalies.append({
                        "field": "fixed_rate",
                        "current_value": str(fixed_rate),
                        "issue": "Fixed rate cannot be negative",
                        "severity": "medium"
                    })
            except (ValueError, TypeError):
                anomalies.append({
                    "field": "fixed_rate",
                    "current_value": str(fixed_rate),
                    "issue": "Invalid fixed rate format",
                    "severity": "high"
                })
    
    elif rate_type == "floating":
        # Check for reference rate
        reference_rate = current_swap.get("reference_rate")
        if not reference_rate:
            anomalies.append({
                "field": "reference_rate",
                "issue": "Reference rate is required for floating rate swaps",
                "severity": "high"
            })
            
        # Check for reset frequency
        reset_frequency = current_swap.get("reset_frequency")
        if not reset_frequency:
            anomalies.append({
                "field": "reset_frequency",
                "issue": "Reset frequency is required for floating rate swaps",
                "severity": "medium"
            })
            
        # Check spread for floating rate (if present)
        spread = current_swap.get("spread")
        if spread:
            try:
                spread_value = float(spread)
            except (ValueError, TypeError):
                anomalies.append({
                    "field": "spread",
                    "current_value": str(spread),
                    "issue": "Invalid spread format",
                    "severity": "medium"
                })
    
    elif rate_type:  # Invalid rate type
        anomalies.append({
            "field": "rate_type",
            "current_value": rate_type,
            "issue": "Invalid rate type (should be 'fixed' or 'floating')",
            "severity": "high"
        })
    else:  # Missing rate type
        anomalies.append({
            "field": "rate_type",
            "issue": "Rate type is required",
            "severity": "high"
        })
    
    return anomalies

def validate_payment_adjustment(current_swap):
    """Validates payment adjustment rules"""
    anomalies = []
    
    # Check payment adjustment rule
    payment_rule = str(current_swap.get("payment_adjustment_rule", "")).strip().lower()
    
    valid_rules = ["following", "modified following", "preceding", "modified preceding", "unadjusted"]
    
    if payment_rule and payment_rule not in valid_rules:
        anomalies.append({
            "field": "payment_adjustment_rule",
            "current_value": payment_rule,
            "issue": f"Invalid payment adjustment rule. Valid rules are: {', '.join(valid_rules)}",
            "severity": "medium"
        })
    
    return anomalies

def validate_amortized_swap_against_risk_file(current_swap):
    # First identify the trade ID field in the current swap (case-insensitive)
    trade_id_field = None
    for field in current_swap:
        if field.lower() == "tradeid":
            trade_id_field = field
            break
    
    if trade_id_field is None:
        return {"error": "tradeId is required"}, 400
    
    trade_id = current_swap.get(trade_id_field)
    print(f"Validating amortized schedule swap with tradeId: {trade_id}")
    
    if not trade_id:
        return {"error": "tradeId is required"}, 400

    # Perform internal validations
    amortization_anomalies = validate_amortization_schedule(current_swap)
    rate_anomalies = validate_rate_specifications(current_swap)
    payment_anomalies = validate_payment_adjustment(current_swap)
    
    internal_anomalies = amortization_anomalies + rate_anomalies + payment_anomalies
    
    # Check against reference data
    reference_swap = load_reference_swap(trade_id)
    print(f"Reference swap found: {reference_swap is not None}")
    
    if reference_swap is None:
        if internal_anomalies:
            return {
                "valid": False,
                "anomalies": internal_anomalies,
                "message": f"No reference swap found in risk file for tradeId {trade_id}, and internal validation found issues."
            }, 404
        else:
            return {
                "valid": False,
                "message": f"No reference swap found in risk file for tradeId {trade_id}."
            }, 404

    # Compare with reference swap
    reference_anomalies = compare_economic_factors(current_swap, reference_swap)
    
    # Combine all anomalies
    all_anomalies = internal_anomalies + reference_anomalies
    
    if all_anomalies:
        return {
            "valid": False,
            "anomalies": all_anomalies,
            "message": "Amortized schedule swap validation found issues"
        }, 200
    else:
        return {
            "valid": True,
            "message": "Amortized schedule swap matches reference swap in risk file on all economic factors"
        }, 200