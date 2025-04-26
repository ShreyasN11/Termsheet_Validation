from flask import Flask, request, jsonify
import os
from routes.termsheet_routes import termsheet_bp
from routes.trader_routes import trader_bp
from routes.stats_routes import stats_bp

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/upload', methods=['POST'])
def upload_file():
    file = request.files.get('file')
    if not file or not file.filename.endswith('.pdf'):
        return jsonify({'error': 'Invalid or no PDF uploaded'}), 400

    save_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(save_path)
    print(f"Saved: {save_path}")

    # Optional: Add your PDF processing logic here

    return jsonify({'message': 'File received and saved'}), 200

app.register_blueprint(termsheet_bp)
app.register_blueprint(trader_bp)
app.register_blueprint(stats_bp)

if __name__ == "__main__":
    app.run(debug=True)
