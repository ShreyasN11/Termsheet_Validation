# backend/init_swap_validation.py

import os
import shutil

def initialize_swap_validation():
    """
    Initialize the directory structure and files needed for swap validation
    """
    # Create validators directory if it doesn't exist
    validators_dir = os.path.join("backend", "validators")
    os.makedirs(validators_dir, exist_ok=True)
    
    # Generate the risk system template
    try:
        from validators.generate_risk_template import generate_risk_template
        generate_risk_template()
        print("Risk system template generated successfully")
    except Exception as e:
        print(f"Error generating risk template: {str(e)}")
# end/requirements.txt' to install new dependencies")

if __name__ == "__main__":
    initialize_swap_validation()