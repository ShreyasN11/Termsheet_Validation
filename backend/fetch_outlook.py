from imap_tools import MailBox, AND
import requests
import os
from dotenv import load_dotenv

load_dotenv()

EMAIL = os.getenv("OUTLOOK_EMAIL") 
PASSWORD = os.getenv("OUTLOOK_PASSWORD")
IMAP_SERVER = os.getenv("IMAP_SERVER2")
UPLOAD_URL = os.getenv("FLASK_SERVER_URL")

print("Email:", EMAIL)
print("Password exists:", PASSWORD is not None)
print("IMAP Server:", IMAP_SERVER)

DOWNLOAD_DIR = "downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

def send_to_flask(file_path):
    with open(file_path, 'rb') as f:
        files = {'file': (os.path.basename(file_path), f, 'application/pdf')}
        response = requests.post(UPLOAD_URL, files=files)
        print(f"Sent {file_path} → {response.status_code} | {response.text}")

def fetch_and_send_pdfs():
    with MailBox(IMAP_SERVER).login(EMAIL, PASSWORD, 'INBOX') as mailbox:
        for msg in mailbox.fetch(AND(seen=False)):
            for att in msg.attachments:
                if att.filename.endswith('.pdf'):
                    filepath = os.path.join(DOWNLOAD_DIR, att.filename)
                    with open(filepath, 'wb') as f:
                        f.write(att.payload)
                    print(f"Downloaded: {att.filename}")
                    send_to_flask(filepath)

if __name__ == "__main__":
    fetch_and_send_pdfs()
