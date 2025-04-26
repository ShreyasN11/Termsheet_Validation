from imap_tools import MailBox, AND 
import requests 
import os 
import re 
import json
from datetime import datetime
import shutil
from dotenv import load_dotenv 
 
load_dotenv() 
 
EMAIL = os.getenv("EMAIL")  
PASSWORD = os.getenv("EMAIL_PASSWORD") 
IMAP_SERVER = os.getenv("IMAP_SERVER") 
UPLOAD_TEXT_URL = os.getenv("FLASK_TEXT_UPLOAD_URL")   

class EmailExtractor:
    def __init__(self):
        self.metadata_dir = "email_metadata"
        self._create_directories()
        
    def _create_directories(self):
        if not os.path.exists(self.metadata_dir):
            os.makedirs(self.metadata_dir)
    
    def _get_trade_folder(self, trade_id):
        trade_folder = os.path.join(self.metadata_dir, trade_id)
        if not os.path.exists(trade_folder):
            os.makedirs(trade_folder)
            os.makedirs(os.path.join(trade_folder, "versions"))
        return trade_folder
    
    def _get_next_version(self, trade_folder):
        versions_folder = os.path.join(trade_folder, "versions")
        existing_versions = [f for f in os.listdir(versions_folder) if f.startswith("v")]
        if not existing_versions:
            return 1
        latest_version = max([int(v.replace("v", "").split("_")[0]) for v in existing_versions])
        return latest_version + 1
    
    def extract_trade_id(self, key_value_pairs, subject):
        # First try to find Trade ID in the key-value pairs
        for key, value in key_value_pairs.items():
            if "trade" in key.lower() and "id" in key.lower():
                return value
            
        # Try to extract from subject if not found in the body
        trade_id_match = re.search(r'(TRADE-[^\s]+)', subject)
        if trade_id_match:
            return trade_id_match.group(1)
            
        # Use a timestamp-based fallback if no trade ID found
        return f"EMAIL-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    def process_email_data(self, subject, key_value_pairs):
        # Extract trade ID from data or generate one
        trade_id = self.extract_trade_id(key_value_pairs, subject)
        
        trade_folder = self._get_trade_folder(trade_id)
        current_version = self._get_next_version(trade_folder)
        
        version_info = {
            "version": current_version,
            "timestamp": datetime.now().isoformat(),
            "subject": subject,
            "data": key_value_pairs
        }
        
        terms_file = os.path.join(trade_folder, "extracted_terms.json")
        version_file = os.path.join(trade_folder, "versions", f"v{current_version}_{subject.replace(' ', '_')}.json")
        changes_file = os.path.join(trade_folder, "changes.json")
        
        if os.path.exists(terms_file):
            with open(terms_file, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
            
            differences = {
                "version": current_version,
                "timestamp": version_info["timestamp"],
                "added": {},
                "removed": {},
                "modified": {}
            }
            
            for key, value in existing_data["data"].items():
                if key in key_value_pairs:
                    if value != key_value_pairs[key]:
                        differences["modified"][key] = {
                            "old": value,
                            "new": key_value_pairs[key]
                        }
                else:
                    differences["removed"][key] = value
            
            for key, value in key_value_pairs.items():
                if key not in existing_data["data"]:
                    differences["added"][key] = value
            
            # Save changes
            self.save_to_json(differences, changes_file)
            
            # Save new version
            self.save_to_json(version_info, version_file)
            self.save_to_json(version_info, terms_file)
            
            return {
                "status": "updated",
                "trade_id": trade_id,
                "version": current_version,
                "message": f"Updated to version {current_version} for Trade ID: {trade_id}"
            }
        else:
            # First version
            self.save_to_json(version_info, version_file)
            self.save_to_json(version_info, terms_file)
            
            return {
                "status": "created",
                "trade_id": trade_id,
                "version": current_version,
                "message": f"Created version {current_version} for Trade ID: {trade_id}"
            }
    
    def save_to_json(self, data, output_file):
        with open(output_file, "w", encoding="utf-8") as json_file:
            json.dump(data, json_file, indent=4, ensure_ascii=False)

def clean_and_extract_relevant_text(body_text): 
    """ 
    Tries to extract only the termsheet-relevant block by detecting where it starts and ends. 
    Also removes quoted text from previous replies. 
    """ 
    # Remove quoted text (common in email replies) 
    body_text = re.sub(r'(?<=\n)[>].*', '', body_text)  # Removes text starting with '>' 
    body_text = re.sub(r'(?<=\n)--.*', '', body_text)  # Removes signature lines starting with '--' 
 
    # Find block after 'Termsheet' keyword (optional) 
    termsheet_start = re.search(r'(termsheet details|termsheet|key highlights|below are.*details)', body_text, re.IGNORECASE) 
    start_idx = termsheet_start.end() if termsheet_start else 0 
 
    # Remove common "thank you" or "regards" or signature parts 
    body_text = body_text[start_idx:] 
    body_text = re.split(r"(thank you|thanks|regards|warm regards|best regards|sincerely)", body_text, flags=re.IGNORECASE)[0] 
 
    return body_text.strip() 
 
def extract_key_value_pairs(text): 
    key_value_pairs = {} 
    lines = text.split('\n') 
    for line in lines: 
        line = line.strip() 
        # Accept both ':' and '-' as separators 
        if ':' in line: 
            key, value = line.split(':', 1) 
        elif '-' in line: 
            key, value = line.split('-', 1) 
        else: 
            continue  # Skip lines without clear separator 
         
        # Clean the key and value and remove if the value is empty 
        key = key.strip() 
        value = value.strip() 
        if key and value:  # Only add to the dictionary if both key and value are non-empty 
            key_value_pairs[key] = value 
 
    return key_value_pairs 
 
def send_text_to_flask(subject, key_value_pairs, processing_result): 
    data = { 
        'subject': subject, 
        'key_value_pairs': key_value_pairs,
        'processing_info': processing_result
    } 
    response = requests.post(UPLOAD_TEXT_URL, json=data) 
    print(f"Sent text for '{subject}' → {response.status_code} | {response.text}") 
 
def fetch_and_process_emails(): 
    extractor = EmailExtractor()
    print("Fetching emails...")
    with MailBox(IMAP_SERVER).login(EMAIL, PASSWORD, 'INBOX') as mailbox: 
        for msg in mailbox.fetch(AND(seen=False)): 
            if not msg.attachments: 
                subject = msg.subject or "" 
                if 'termsheet' in subject.lower(): 
                    body = msg.text or "" 
                    clean_text = clean_and_extract_relevant_text(body) 
                    key_value_pairs = extract_key_value_pairs(clean_text) 
                    
                    if key_value_pairs: 
                        # Process the email data (similar to PDF processing)
                        processing_result = extractor.process_email_data(subject, key_value_pairs)
                        # Send to Flask with processing info
                        send_text_to_flask(subject, key_value_pairs, processing_result)
                        print(f"{processing_result['status'].capitalize()}: {processing_result['message']}")
                    else: 
                        print(f"No key-value pairs found in email: {subject}") 
                else: 
                    print(f"Skipping email as subject does not contain 'termsheet': {subject}") 

# if __name__ == "__main__":
#     fetch_and_process_emails()