# File: term_sheet_classifier_v5.py

import json
from pathlib import Path
import re
from typing import Dict, Set, List, Tuple, Any, Optional

# --- Configuration ---

# Define ALL commonly expected keys for each type
# (Updated IRS to include dayCountConvention)
TERM_SHEET_STRUCTURES: Dict[str, Set[str]] = {
    "InterestRateSwap": {
        "instrumentType", "tradeId", "firmId", "accountId", "currency",
        "effectiveDate", "maturityDate", "notional", "direction",
        "payLeg", "receiveLeg", "dayCountConvention", # Added based on mandatory list
        "businessDayConvention" # Often present
    },
    "CrossCurrencySwap": {
        "instrumentType", "tradeId", "firmId", "accountId", "payCurrency",
        "receiveCurrency", "effectiveDate", "maturityDate", "payNotional",
        "receiveNotional", "payLeg", "receiveLeg", "exchangeRates",
        "businessDayConvention" # Often present
    },
    "AmortisedScheduleSwap": {
        "instrumentType", "tradeId", "firmId", "accountId", "currency",
        "effectiveDate", "maturityDate", "notionalSchedule",
        "amortizationMethod", "payLeg", "receiveLeg",
        "businessDayConvention" # Often present
    },
    "MoneyMarketDeposit": {
        "instrumentType", "tradeId", "firmId", "accountId", "currency",
        "depositDate", "maturityDate", "principal", "interestRate",
        "interestCalculation", "dayCountConvention", "businessDayConvention"
    },
    "SingleSpreadOption": {
        "instrumentType", "tradeId", "firmId", "accountId", "underlying",
        "optionType", "strike", "spread", "notional", "currency",
        "expiryDate", "settlementDate", "dayCountConvention",
        "businessDayConvention"
    },
    "FXDigital": {
        "instrumentType", "tradeId", "firmId", "accountId", "payCurrency",
        "receiveCurrency", "payAmount", "receiveAmount", "strikeRate",
        "expiryDate", "settlementDate", "optionType", "dayCountConvention",
        "businessDayConvention"
    }
}

# Define MANDATORY keys based on user input and interpretation
# Uses canonical, normalized keys
MANDATORY_KEYS_DEF: Dict[str, Set[str]] = {
    "InterestRateSwap": {
        "effectiveDate", "maturityDate", "notional", "payLeg", "receiveLeg",
        "dayCountConvention", "firmId"
    },
    "CrossCurrencySwap": {
        "payCurrency", "receiveCurrency", "payNotional", "receiveNotional",
        "effectiveDate", "maturityDate", "payLeg", "receiveLeg", "exchangeRates"
    },
    "AmortisedScheduleSwap": {
        "amortizationMethod", "notionalSchedule", "effectiveDate", "maturityDate",
        "payLeg", "receiveLeg"
    },
    "MoneyMarketDeposit": {
        "principal", "depositDate", "maturityDate", "interestRate",
        "dayCountConvention"
    },
    "SingleSpreadOption": {
        "underlying", "strike", "spread", "expiryDate", "optionType"
    },
    "FXDigital": {
        "payCurrency", "receiveCurrency", "strikeRate", "expiryDate",
        "payAmount", "receiveAmount", "optionType"
    }
}


# Define aliases for canonical keys (lowercase, stripped)
# Maps alias -> canonical_key
KEY_ALIASES: Dict[str, str] = {
    # General
    "termination date": "maturityDate",
    "end date": "maturityDate",
    "maturity": "maturityDate",
    "start date": "effectiveDate",
    "value date": "effectiveDate", # More common for MMD/FX
    "effective start date": "effectiveDate",
    "trade date": "tradeDate", # Keep if needed, though not in mandatory lists
    "notional amount": "notional",
    "business day convention": "businessDayConvention",
    "day count basis": "dayCountConvention",
    "day count fraction": "dayCountConvention",
    "payment frequency": "paymentFrequency", # Add canonical if we define it
    # IRS specific
    "fixed rate": "payLeg", # Alias points to the leg which *contains* the rate
    "floating rate index": "receiveLeg", # Alias points to the leg
    # MMD specific
    "principal amount": "principal",
    "issue date": "depositDate",
    "rate": "interestRate",
    # Option specific
    "expiration date": "expiryDate",
    "option expiry": "expiryDate",
    "expiry": "expiryDate",
    "settlement": "settlementDate",
    "underlying asset": "underlying",
    "strike price": "strike",
    # FX specific
    "payment currency": "payCurrency",
    "receipt currency": "receiveCurrency",
    "fx rate": "exchangeRates", # For CCS
    "spot rate": "exchangeRates", # For CCS
    "barrier level": "strikeRate", # For FX Digital
    "payout amount": "payAmount", # Or receiveAmount depending on context
    # Add more based on data...
    "party a": "firmId", # Assuming firmId represents one of the parties
    "party b": "counterpartyId", # Add canonical if needed
}

# --- Helper Functions ---

def normalize_key(key: str) -> str:
    """Normalizes a key for comparison (lowercase, strip whitespace)."""
    if not isinstance(key, str):
        return ""
    return key.lower().strip()

def build_normalized_structures(
    structures: Dict[str, Set[str]],
    mandatory_defs: Dict[str, Set[str]],
    aliases: Dict[str, str]
) -> Tuple[Dict[str, Set[str]], Dict[str, Set[str]], Dict[str, str], Dict[str, str]]:
    """Normalizes keys in structures, mandatory sets, and aliases."""
    normalized_structures = {
        term_type: {normalize_key(k) for k in keyset}
        for term_type, keyset in structures.items()
    }
    normalized_mandatory = {
        term_type: {normalize_key(k) for k in keyset}
        for term_type, keyset in mandatory_defs.items()
    }
    normalized_aliases = {
        normalize_key(alias): normalize_key(canonical)
        for alias, canonical in aliases.items()
    }
    # Reverse mapping: canonical -> set of aliases (optional but useful)
    reverse_aliases: Dict[str, Set[str]] = {}
    for alias_norm, canonical_norm in normalized_aliases.items():
        reverse_aliases.setdefault(canonical_norm, set()).add(alias_norm)

    return normalized_structures, normalized_mandatory, normalized_aliases, reverse_aliases

# Pre-normalize structures and aliases once
NORMALIZED_TERM_STRUCTURES, NORMALIZED_MANDATORY_KEYS, NORMALIZED_ALIASES, REVERSE_ALIASES = build_normalized_structures(
    TERM_SHEET_STRUCTURES, MANDATORY_KEYS_DEF, KEY_ALIASES
)

def load_json_data(file_path: Path) -> Any:
    """Loads JSON, handles file errors and basic type validation."""
    if not file_path.is_file():
        raise FileNotFoundError(f"Error: Input file not found at {file_path}")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if not content:
                raise ValueError("Error: Input JSON file is empty.")
            data = json.loads(content)
        if not isinstance(data, (dict, list)):
             raise ValueError(f"Error: Expected JSON root to be an object or array, got {type(data)}.")
        return data
    except json.JSONDecodeError as e:
        raise json.JSONDecodeError(f"Error: Invalid JSON format in {file_path}: {e.msg}", e.doc, e.pos)
    except Exception as e:
        raise Exception(f"Error reading or parsing file {file_path}: {e}")

def extract_all_keys_normalized(data: Any) -> Set[str]:
    """Recursively extracts all unique string keys and normalizes them."""
    keys = set()
    if isinstance(data, dict):
        for key, value in data.items():
            normalized = normalize_key(key)
            if normalized:
                keys.add(normalized)
            keys.update(extract_all_keys_normalized(value))
    elif isinstance(data, list):
        for item in data:
            keys.update(extract_all_keys_normalized(item))
    return keys

def calculate_scores(
    normalized_input_keys: Set[str]
) -> Dict[str, Dict[str, Any]]:
    """Calculates Mandatory Coverage and Jaccard scores."""
    results: Dict[str, Dict[str, Any]] = {}

    if not normalized_input_keys:
        print("Warning: No keys extracted from the input JSON.")
        # Return empty scores if no input keys
        for term_type, norm_mand_keys in NORMALIZED_MANDATORY_KEYS.items():
             norm_all_keys = NORMALIZED_TERM_STRUCTURES.get(term_type, set())
             results[term_type] = {
                 "mandatory_coverage": 0.0,
                 "jaccard_score": 0.0,
                 "matched_mandatory_keys": [],
                 "missing_mandatory_keys": sorted(list(norm_mand_keys)),
                 "matched_all_keys": [],
                 "missing_all_keys": sorted(list(norm_all_keys)),
                 "extra_input_keys": []
             }
        return results

    for term_type, norm_mand_keys in NORMALIZED_MANDATORY_KEYS.items():
        norm_all_expected_keys = NORMALIZED_TERM_STRUCTURES.get(term_type, set())

        # --- Find matched canonical keys (considering aliases) ---
        matched_canonical_keys_found = set()
        contributing_input_keys = set() # Track which input keys led to a match
        for input_key in normalized_input_keys:
            # Direct match to a canonical key (either mandatory or optional)
            if input_key in norm_all_expected_keys:
                matched_canonical_keys_found.add(input_key)
                contributing_input_keys.add(input_key)
            # Match via an alias
            elif input_key in NORMALIZED_ALIASES:
                canonical_key = NORMALIZED_ALIASES[input_key]
                # Check if the alias maps to a key expected for THIS term type
                if canonical_key in norm_all_expected_keys:
                    matched_canonical_keys_found.add(canonical_key)
                    contributing_input_keys.add(input_key)

        # --- Calculate Mandatory Coverage ---
        matched_mandatory = matched_canonical_keys_found.intersection(norm_mand_keys)
        mandatory_coverage = len(matched_mandatory) / len(norm_mand_keys) if norm_mand_keys else 1.0 # 100% if no mandatory keys defined

        # --- Calculate Jaccard Score (based on ALL expected keys for the type) ---
        jaccard_intersection = matched_canonical_keys_found # Canonical keys found that are in the 'all expected' set
        jaccard_union = normalized_input_keys.union(norm_all_expected_keys)
        jaccard_score = len(jaccard_intersection) / len(jaccard_union) if jaccard_union else 0.0

        # --- Detailed lists for output ---
        missing_mandatory = norm_mand_keys - matched_mandatory
        missing_all = norm_all_expected_keys - matched_canonical_keys_found
        extra_input = normalized_input_keys - contributing_input_keys

        results[term_type] = {
            "mandatory_coverage": round(mandatory_coverage, 4),
            "jaccard_score": round(jaccard_score, 4),
            "matched_mandatory_keys": sorted(list(matched_mandatory)),
            "missing_mandatory_keys": sorted(list(missing_mandatory)),
            "matched_all_keys": sorted(list(matched_canonical_keys_found)), # All canonical keys matched for this type
            "missing_all_keys": sorted(list(missing_all)), # All expected canonical keys not matched
            "extra_input_keys": sorted(list(extra_input)) # Input keys that didn't match anything for this type
        }
    return results

def rank_results(scores: Dict[str, Dict[str, Any]], sort_key: str) -> List[Tuple[str, Dict[str, Any]]]:
    """Sorts results by score, handling potential empty scores."""
    if not scores: return []
    first_score_dict = next(iter(scores.values()), None)
    if first_score_dict is None or sort_key not in first_score_dict:
         print(f"Warning: Sort key '{sort_key}' not found in score data. Cannot rank.")
         return list(scores.items())
    return sorted(scores.items(), key=lambda item: (item[1].get(sort_key, 0.0), item[0]), reverse=True)

def display_results(ranked_lists: Dict[str, List[Tuple[str, Dict[str, Any]]]]):
    """Displays classification results, focusing on mandatory coverage."""
    print("\n--- Classification Results ---")

    # Determine Top Match and Confidence based on Mandatory Coverage
    top_mandatory_match: Optional[Tuple[str, Dict[str, Any]]] = None
    if ranked_lists["ranked_by_mandatory"]:
        top_mandatory_match = ranked_lists["ranked_by_mandatory"][0]
        confidence_score = top_mandatory_match[1].get('mandatory_coverage', 0.0) * 100
        print(f"\nPrimary Classification: {top_mandatory_match[0]}")
        print(f"Confidence Score: {confidence_score:.2f}%")
        print("(Confidence based on percentage of *mandatory* keys found)")
    else:
        print("\nNo classification possible based on mandatory key coverage.")

    # Display Mandatory Coverage Ranking Details
    print("\nRanked by Mandatory Key Coverage:")
    if not ranked_lists["ranked_by_mandatory"]:
        print("  No results.")
    else:
        for rank, (term_type, metrics) in enumerate(ranked_lists["ranked_by_mandatory"], 1):
            mand_cov = metrics.get('mandatory_coverage', 0.0)
            jacc_score = metrics.get('jaccard_score', 0.0)
            matched_mand = metrics.get('matched_mandatory_keys', [])
            missing_mand = metrics.get('missing_mandatory_keys', [])

            print(f"  {rank}. {term_type} (Mandatory Coverage: {mand_cov:.2%}, Jaccard: {jacc_score:.4f})")
            print(f"     - Matched Mandatory Keys ({len(matched_mand)}): {matched_mand}")
            if missing_mand:
                print(f"     - Missing Mandatory Keys ({len(missing_mand)}): {missing_mand}")
            # Optionally show non-mandatory matches/misses/extras here if needed for detail
            if metrics.get('extra_input_keys'):
                 max_extra_keys_to_show = 15
                 extra_keys_list = metrics['extra_input_keys']
                 print(f"     - Non-matching Input Keys ({len(extra_keys_list)}): {extra_keys_list[:max_extra_keys_to_show]}{'...' if len(extra_keys_list) > max_extra_keys_to_show else ''}")


    # Display Jaccard Ranking Summary
    print("\nRanked by Jaccard Score (Overall Similarity - Using All Expected Keys):")
    if not ranked_lists["ranked_by_jaccard"]:
        print("  No results.")
    else:
        for rank, (term_type, metrics) in enumerate(ranked_lists["ranked_by_jaccard"], 1):
            mand_cov = metrics.get('mandatory_coverage', 0.0)
            jacc_score = metrics.get('jaccard_score', 0.0)
            print(f"  {rank}. {term_type} (Jaccard: {jacc_score:.4f}, Mandatory Coverage: {mand_cov:.2%})")

    print("\n--- End of Results ---")

def classify_term_sheet_from_file(
    file_path_str: str
) -> Optional[Dict[str, List[Tuple[str, Dict[str, Any]]]]]:
    """Main function to load, classify, and return results."""
    file_path = Path(file_path_str)
    print(f"Attempting to load JSON from: {file_path.resolve()}")

    input_data = load_json_data(file_path)
    normalized_input_keys = extract_all_keys_normalized(input_data)

    if not normalized_input_keys:
        print("\nError: Could not extract any keys from the JSON data. Cannot classify.")
        return None

    print(f"\nSuccessfully loaded JSON. Found {len(normalized_input_keys)} unique normalized keys:")
    max_keys_to_print = 100
    sorted_keys = sorted(list(normalized_input_keys))
    print(f"{sorted_keys[:max_keys_to_print]}{'...' if len(sorted_keys) > max_keys_to_print else ''}")

    scores = calculate_scores(normalized_input_keys)
    print("\nCalculated Mandatory Coverage and Jaccard Scores using normalized keys and aliases.")

    ranked_by_mandatory = rank_results(scores, 'mandatory_coverage')
    ranked_by_jaccard = rank_results(scores, 'jaccard_score')

    return {
        "ranked_by_mandatory": ranked_by_mandatory,
        "ranked_by_jaccard": ranked_by_jaccard
    }

# --- Main Execution ---

def classify_termsheet():
    """Process all version files in the folder structure"""
    base_path = Path("./metadata")
    results = []
    print(f"Base directory: {base_path.resolve()}")
    # Check if base directory exists
    if not base_path.exists():
        print(f"Base directory not found: {base_path.resolve()}")
        return results
        
    print("hello")
    # Walk through all trade ID folders
    for trade_id_folder in base_path.iterdir():
        if not trade_id_folder.is_dir():
            continue
            
        # Check for versions folder
        versions_folder = trade_id_folder / "versions"
        if not versions_folder.exists() or not versions_folder.is_dir():
            continue
            
        # Process all JSON files in the versions folder
        for version_file in versions_folder.glob("*.json"):
            try:
                print(f"Processing: {version_file}")
                classification_result = classify_term_sheet_from_file(version_file)
                
                if classification_result:
                    # Add trade ID and version info to results
                    classification_result["trade_id"] = trade_id_folder.name
                    classification_result["version"] = version_file.stem
                    
                    # Display individual results
                    display_results(classification_result)
                    
                    # Add to overall results
                    results.append(classification_result)
            except Exception as e:
                print(f"Error processing {version_file}: {e}")
    
    for result in results:
        print(f"\nFinal Classification Result for Trade ID {result['trade_id']} Version {result['version']}:")
        display_results(result)
    return results
    

