from flask import Flask, request, jsonify
import os
from flask_cors import CORS
from gemini_classify import classify_termsheet
from routes.termsheet_routes import termsheet_bp
from routes.trader_routes import trader_bp
from routes.stats_routes import stats_bp

app = Flask(__name__)
CORS(app)
import json
from apscheduler.schedulers.background import BackgroundScheduler
from time import sleep
from fetch_and_send import fetch_and_send_pdfs
from fetch_and_send_text import fetch_and_process_emails
from main import process_pdf_files

# app = Flask(__name__)

# Define upload and text folders
UPLOAD_FOLDER = 'uploads'
TEXT_FOLDER = 'texts'  # Folder for storing text-based key-value data
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TEXT_FOLDER, exist_ok=True)

# Define the functions to be scheduled
def scheduled_fetch_and_send_pdfs():
    fetch_and_send_pdfs()

def scheduled_fetch_and_process_emails():
    fetch_and_process_emails()

def scheduled_process_pdf_files():
    process_pdf_files()

def schedule_classification():
    classify_termsheet()

# Set up the APScheduler
scheduler = BackgroundScheduler()

# Add jobs with a 5-minute interval and a 10-second delay between each function call
# scheduler.add_job(scheduled_fetch_and_send_pdfs, 'interval', minutes=5, id='fetch_and_send_pdfs')
# scheduler.add_job(lambda: sleep(10), 'interval', minutes=5, id='delay_10_seconds')  # 10-second delay
# scheduler.add_job(scheduled_fetch_and_process_emails, 'interval', minutes=5, id='fetch_and_process_emails')
# scheduler.add_job(lambda: sleep(10), 'interval', minutes=5, id='delay_10_seconds_2')  # Another 10-second delay
# scheduler.add_job(scheduled_process_pdf_files, 'interval', minutes=5, id='process_pdf_files')
# scheduler.add_job(lambda: sleep(10), 'interval', minutes=5, id='delay_10_seconds_3')  # Another 10-second delay
scheduler.add_job(schedule_classification, 'interval', minutes=1, id='classification')

# Start the scheduler
scheduler.start()

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files.get('file')
    if not file or not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Invalid or no PDF uploaded'}), 400

    save_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(save_path)
    print(f"Saved: {save_path}")

    return jsonify({'message': 'File received and saved'}), 200

app.register_blueprint(termsheet_bp)
app.register_blueprint(trader_bp)
app.register_blueprint(stats_bp)

@app.route('/upload_text', methods=['POST'])
def upload_text():
    data = request.get_json()
    subject = data.get('subject')
    key_value_pairs = data.get('key_value_pairs')

    if not subject or not key_value_pairs:
        return jsonify({'error': 'Invalid data'}), 400

    # Save key-value pairs into a JSON file named after the sanitized subject
    safe_subject = "".join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in subject)
    save_path = os.path.join(TEXT_FOLDER, f"{safe_subject}.json")
    
    with open(save_path, 'w') as f:
        json.dump(key_value_pairs, f, indent=4)

    print(f"Saved text key-values for: {subject}")

    return jsonify({'message': 'Text data received and saved'}), 200

# Flask route for running the server
if __name__ == "__main__":
    app.run(debug=True)

# Make sure the scheduler is shut down properly when the application exits
@app.before_first_request
def start_scheduler():
    print("Scheduler started.")

@app.teardown_appcontext
def shutdown_scheduler(exception=None):
    scheduler.shutdown()
    print("Scheduler shut down.")
