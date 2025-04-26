# backend/validators/generate_risk_template.py

import pandas as pd
import os

def generate_risk_template(output_path="backend/validators/risk_system_template.xlsx"):
    """
    Generate a template Excel file for the risk system
    """
    # Ensure the directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Create a dictionary of dataframes for each sheet
    risk_data = {}
    
    # Parameters sheet
    risk_data["Parameters"] = pd.DataFrame({
        "parameter": [
            "min_notional", "max_notional", 
            "min_fixed_rate", "max_fixed_rate"
        ],
        "value": [100000, 1000000000, 0, 10]
    })
    
    # Common tenors
    risk_data["Tenors"] = pd.DataFrame({
        "common_tenors": [1, 2, 3, 5, 7, 10, 15, 20, 30]
    })
    
    # Allowed floating rate indices
    risk_data["Indices"] = pd.DataFrame({
        "allowed_indices": ["SOFR", "EURIBOR", "€STR", "SONIA", "LIBOR", "EONIA"]
    })
    
    # Allowed payment frequencies
    risk_data["Frequencies"] = pd.DataFrame({
        "allowed_frequencies": ["Monthly", "Quarterly", "Semi-annual", "Annual"]
    })
    
    # Allowed day count conventions
    risk_data["DayCounts"] = pd.DataFrame({
        "allowed_day_counts": ["30/360", "ACT/365", "ACT/360", "ACT/ACT"]
    })
    
    # Approved counterparties
    risk_data["Counterparties"] = pd.DataFrame({
        "approved_counterparties": [
            "Bank of America", "JPMorgan Chase", "Goldman Sachs", 
            "Morgan Stanley", "Citigroup", "Wells Fargo", 
            "Deutsche Bank", "HSBC", "Barclays", "BNP Paribas"
        ]
    })
    
    # Write to Excel
    with pd.ExcelWriter(output_path) as writer:
        for sheet_name, df in risk_data.items():
            df.to_excel(writer, sheet_name=sheet_name, index=False)
    
    print(f"Risk system template generated at: {output_path}")

if __name__ == "__main__":
    generate_risk_template()