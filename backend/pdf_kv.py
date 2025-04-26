import re
import fitz
import json
import os
import shutil
from datetime import datetime

class PDFExtractor:
    def __init__(self):
        self.files_dir = "files"
        self.metadata_dir = "metadata"
        self._create_directories()
        self._clear_metadata()

        self.sections = {
            "Parties Involved": ["Buyer", "Seller", "Broker"],
            "Instrument Details": ["Security Name", "Ticker Symbol", "ISIN", "Exchange"],
            "Trade Details": ["Trade Type", "Order Type", "Quantity", "Price per Share", "Total Trade Value"],
            "Settlement Details": ["Settlement Date", "Settlement Method", "Currency", "Clearing House"],
            "Fees and Costs": ["Brokerage Fee", "Exchange Fee", "Other Charges"]
        }

    def _clear_metadata(self):
        if os.path.exists(self.metadata_dir):
            shutil.rmtree(self.metadata_dir)
        os.makedirs(self.metadata_dir)

    def _create_directories(self):
        for directory in [self.files_dir, self.metadata_dir]:
            if not os.path.exists(directory):
                os.makedirs(directory)

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

    def process_new_document(self, filename):
        pdf_path = os.path.join(self.files_dir, filename)
        
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"File {filename} not found in {self.files_dir} directory")

        extracted_pairs, trade_id = self.extract_all_kv_pairs(pdf_path, save_to_file=False)
        
        if not trade_id:
            raise ValueError("Could not extract Trade ID from the document")

        trade_folder = self._get_trade_folder(trade_id)
        current_version = self._get_next_version(trade_folder)
        
        version_info = {
            "version": current_version,
            "timestamp": datetime.now().isoformat(),
            "filename": filename,
            "data": extracted_pairs
        }

        terms_file = os.path.join(trade_folder, "extracted_terms.json")
        version_file = os.path.join(trade_folder, "versions", f"v{current_version}_{filename.replace('.pdf', '.json')}")
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
                if key in extracted_pairs:
                    if value != extracted_pairs[key]:
                        differences["modified"][key] = {
                            "old": value,
                            "new": extracted_pairs[key]
                        }
                else:
                    differences["removed"][key] = value

            for key, value in extracted_pairs.items():
                if key not in existing_data["data"]:
                    differences["added"][key] = value

            self.save_to_json(differences, changes_file)
            self.save_to_json(version_info, version_file)
            self.save_to_json(version_info, terms_file)
            
            return {
                "status": "updated",
                "trade_id": trade_id,
                "version": current_version,
                "message": f"Updated to version {current_version} for Trade ID: {trade_id}"
            }
        else:
            self.save_to_json(version_info, version_file)
            self.save_to_json(version_info, terms_file)
            return {
                "status": "created",
                "trade_id": trade_id,
                "version": current_version,
                "message": f"Created version {current_version} for Trade ID: {trade_id}"
            }

    def extract_trade_id(self, text):
        trade_id_match = re.search(r'Trade ID:?\s*(TRADE-[^\s]+)', text)
        return trade_id_match.group(1) if trade_id_match else None

    def extract_all_kv_pairs(self, pdf_path, save_to_file=True):
        doc = fitz.open(pdf_path)
        all_kv_pairs = {}
        trade_id = None
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            
            if not trade_id:
                trade_id = self.extract_trade_id(text)
                if trade_id:
                    all_kv_pairs["Trade ID"] = trade_id

            for section, keys in self.sections.items():
                for key in keys:
                    patterns = [
                        rf"{key}:?\s*([^•\n]+)",
                        rf"[•]\s*{key}:?\s*([^•\n]+)",
                        rf"{key}\s*=\s*([^•\n]+)"
                    ]
                    
                    for pattern in patterns:
                        match = re.search(pattern, text, re.IGNORECASE)
                        if match:
                            value = match.group(1).strip()
                            if value and len(value) > 1:
                                all_kv_pairs[key] = value
                                break

            additional_pairs = re.findall(r'[•]\s*([^:]+):\s*([^•\n]+)', text)
            for key, value in additional_pairs:
                key = key.strip()
                value = value.strip()
                if key and value and len(value) > 1 and key not in all_kv_pairs:
                    all_kv_pairs[key] = value

        doc.close()

        cleaned_pairs = self._clean_pairs(all_kv_pairs)

        if save_to_file and trade_id:
            self.save_to_json(cleaned_pairs, f"extracted_terms_{trade_id}.json")

        return cleaned_pairs, trade_id

    def _clean_pairs(self, pairs):
        cleaned_pairs = {}
        for key, value in pairs.items():
            clean_key = re.sub(r'^\d+\.\s*', '', key)
            clean_key = re.sub(r'^[•]\s*', '', clean_key)
            clean_key = clean_key.strip()
            
            clean_value = re.sub(r'\s+', ' ', value).strip()
            clean_value = re.sub(r'\s*\d+\.\s*.*$', '', clean_value)
            
            if clean_key and clean_value and len(clean_value) > 1:
                cleaned_pairs[clean_key] = clean_value
        
        return cleaned_pairs

    def save_to_json(self, data, output_file):
        with open(output_file, "w", encoding="utf-8") as json_file:
            json.dump(data, json_file, indent=4, ensure_ascii=False)