from flask import Flask, request, jsonify
import os
import json
from flask_cors import CORS
from gemini_classify import classify_termsheet
from flask_apscheduler import APScheduler

# Import your blueprints and functions
from routes.termsheet_routes import termsheet_bp
from routes.trader_routes import trader_bp
from routes.stats_routes import stats_bp
from fetch_and_send import fetch_and_send_pdfs
from fetch_and_send_text import fetch_and_process_emails
from main import process_pdf_files

UPLOAD_FOLDER = 'uploads'
TEXT_FOLDER = 'texts'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(TEXT_FOLDER, exist_ok=True)

class Config:
    SCHEDULER_API_ENABLED = True

app = Flask(__name__)
app.config.from_object(Config())
CORS(app)

# Initialize APScheduler
scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

# Scheduled jobs
@scheduler.task('interval', id='fetch_and_send_pdfs', minutes=5)
def scheduled_fetch_and_send_pdfs():
    fetch_and_send_pdfs()

@scheduler.task('interval', id='fetch_and_process_emails', minutes=5)
def scheduled_fetch_and_process_emails():
    fetch_and_process_emails()

@scheduler.task('interval', id='process_pdf_files', minutes=5)
def scheduled_process_pdf_files():
    process_pdf_files()

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

    safe_subject = "".join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in subject)
    save_path = os.path.join(TEXT_FOLDER, f"{safe_subject}.json")

    with open(save_path, 'w') as f:
        json.dump(key_value_pairs, f, indent=4)

    print(f"Saved text key-values for: {subject}")

    return jsonify({'message': 'Text data received and saved'}), 200

if __name__ == "__main__":
    app.run(debug=True)
