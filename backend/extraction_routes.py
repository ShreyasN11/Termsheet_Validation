import groq
import os
from typing import Dict, List, Tuple, Optional
import json
import re
from markitdown import MarkItDown
from dotenv import load_dotenv
from db import db

load_dotenv()

# Initialize Groq client
client = groq.Client(api_key=os.environ.get("GROQ_API_KEY"))

# Define the characteristic parameters for each derivative type
DERIVATIVE_PARAMETERS = {
    "Interest Rate Swap": [
        "Effective Date", "Termination Date/Maturity", "Notional Amount", 
        "Fixed Rate", "Floating Rate Index", "Payment Frequency", 
        "Day Count Convention", "Reset Dates", "Discount Curve", 
        "Counterparty Details"
    ],
    "Cross Currency Swap": [
        "Effective Date", "Termination Date", "Notional Amount (Currency 1)", 
        "Notional Amount (Currency 2)", "Exchange Rate", "Fixed Rate (Currency 1)", 
        "Fixed Rate (Currency 2)", "Payment Frequency", "Day Count Convention", 
        "Initial Exchange", "Final Exchange", "Counterparty Details"
    ],
    "Amortised Schedule Swap": [
        "Effective Date", "Termination Date", "Initial Notional Amount", 
        "Amortization Schedule", "Fixed Rate", "Floating Rate Index", 
        "Payment Frequency", "Day Count Convention", "Reset Dates", 
        "Counterparty Details"
    ],
    "Money Market Deposit": [
        "Value Date", "Maturity Date", "Principal Amount", "Currency", 
        "Interest Rate", "Day Count Convention", "Interest Payment Date", 
        "Counterparty Details"
    ],
    "Single Spread Options": [
        "Trade Date", "Option Style", "Option Type", "Expiry Date", 
        "Strike Price", "Underlying", "Notional Amount", "Premium", 
        "Settlement Method", "Counterparty Details"
    ],
    "FX Digital": [
        "Trade Date", "Expiry Date", "Settlement Date", "Currency Pair", 
        "Strike Rate", "Notional Amount", "Payout Amount", "Payout Currency", 
        "Barrier Type", "Counterparty Details"
    ]
}

def classify_termsheet(text: str) -> str:
    """
    Classify a termsheet into one of the six derivative types.
    
    Args:
        text: The termsheet text or a summary of it
        
    Returns:
        The classified derivative type
    """
    # First, create a classification prompt that focuses on distinctive features
    classification_prompt = """
    Analyze this financial termsheet and classify it as ONE of the following derivative types:
    
    1. Interest Rate Swap - Exchanges fixed interest payments for floating interest payments
    2. Cross Currency Swap - Exchanges principal and interest payments in one currency for another
    3. Amortised Schedule Swap - An interest rate swap where the notional amount decreases over time according to a schedule
    4. Money Market Deposit - A short-term loan or deposit between banks
    5. Single Spread Options - Option contracts based on the spread between two financial instruments
    6. FX Digital - A binary option that pays a fixed amount if a specified FX rate condition is met
    
    Return ONLY the name of the derivative type that best matches this termsheet. Do not explain your reasoning or provide any other text.
    
    Termsheet:
    """
    
    # If text is very long, extract key sections for classification
    if len(text) > 10000:  # Arbitrary threshold, adjust as needed
        sections_prompt = """
        Extract only the most relevant sections from this termsheet that would help classify it as one of these derivative types:
        - Interest Rate Swap
        - Cross Currency Swap
        - Amortised Schedule Swap
        - Money Market Deposit
        - Single Spread Options
        - FX Digital
        
        Focus on headings, transaction type descriptions, and key parameters that distinguish these products.
        
        Termsheet:
        """ + text
        
        # Get the key sections
        sections_response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "user", "content": sections_prompt}],
            temperature=0.0,
            max_tokens=2000
        )
        
        key_sections = sections_response.choices[0].message.content
        classification_text = key_sections
    else:
        classification_text = text
    
    # Classify the termsheet
    response = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[{"role": "user", "content": classification_prompt + classification_text}],
        temperature=0.0,
        max_tokens=20  # Keep this small as we only need the type name
    )
    
    derivative_type = response.choices[0].message.content.strip()
    
    # Normalize the response to match our defined types
    for defined_type in DERIVATIVE_PARAMETERS.keys():
        if defined_type.lower() in derivative_type.lower():
            return defined_type
    
    # If no match found, return the raw response
    print(derivative_type)
    return derivative_type

def extract_parameters_by_chunks(text: str, derivative_type: str, chunk_size: int = 6000, overlap: int = 1000) -> Dict:
    """
    Extract parameters from a termsheet by processing it in overlapping chunks.
    
    Args:
        text: The termsheet text
        derivative_type: The type of derivative
        chunk_size: Size of each chunk to process
        overlap: Overlap between chunks to avoid missing information at boundaries
        
    Returns:
        Dictionary of extracted parameters
    """
    parameters = DERIVATIVE_PARAMETERS.get(derivative_type, [])
    
    # If the text is small enough, process it in one go
    if len(text) <= chunk_size:
        return extract_parameters_from_chunk(text, derivative_type, parameters)
    
    # Otherwise, split into chunks with overlap
    chunks = []
    for i in range(0, len(text), chunk_size - overlap):
        chunk = text[i:i + chunk_size]
        chunks.append(chunk)
    
    # Process each chunk and merge results
    all_results = {}
    for i, chunk in enumerate(chunks):
        chunk_results = extract_parameters_from_chunk(chunk, derivative_type, parameters)
        
        # Merge with existing results, preferring non-None values
        for key, value in chunk_results.items():
            if key not in all_results or (value is not None and all_results[key] is None):
                all_results[key] = value
    
    # Post-processing to ensure all expected parameters are included
    final_results = {param: all_results.get(param, None) for param in parameters}
    
    return final_results

def extract_parameters_from_chunk(text: str, derivative_type: str, parameters: List[str]) -> Dict:
    
    # Construct prompt to extract parameters
    extraction_prompt = f"""
    Extract the following parameters from this {derivative_type} termsheet:
    
    {', '.join(parameters)}
    
    Format your response as a JSON object with these parameters as keys. If a parameter isn't found, use null.
    Only include these exact parameters in your response, no additional information or explanation.
    
    Termsheet chunk:
    {text}
    """
    
    # Call the LLM
    response = client.chat.completions.create(
        model="llama3-70b-8192",
        messages=[{"role": "user", "content": extraction_prompt}],
        temperature=0.0,
        max_tokens=1500
    )
    
    result_text = response.choices[0].message.content
    
    # Extract JSON from the response
    try:
        # Try direct parsing first
        result = json.loads(result_text)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown code blocks
        json_match = re.search(r'```(?:json)?\n(.*?)\n```', result_text, re.DOTALL)
        if json_match:
            try:
                result = json.loads(json_match.group(1))
            except json.JSONDecodeError:
                # Fall back to creating a simple dict with nulls
                result = {param: None for param in parameters}
        else:
            # If no JSON can be extracted, create empty results
            result = {param: None for param in parameters}
    print(result)
    return result

def process_termsheet(path: str) -> Tuple[str, Dict]:
    md = MarkItDown(enablePlugins=False)
    termsheet_text = md.convert(path).text_content 
    print(termsheet_text)
    termsheet_text = termsheet_text.replace("\n", " ").replace("\r", " ").strip()
    derivative_type = classify_termsheet(termsheet_text)
    
    # Step 2: Extract parameters based on the classification
    parameters = extract_parameters_by_chunks(termsheet_text, derivative_type)
    termsheet_collection = db["termsheet"]
    document = {
        "derivative_type": derivative_type,
        **parameters,
        "file_path": path,
        "staus": "processing"
    }
    result = termsheet_collection.insert_one(document)
    if result.acknowledged:
        print("Document inserted with ID:", result.inserted_id)
    else:
        print("Failed to insert document.")
    # print(derivative_type, parameters)
    return derivative_type, parameters

# process_termsheet("C:\\Users\\SURBHI\\Termsheet_Validation\\backend\\uploads\\interest-rate-swap.pdf")
