from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import openai
import os
import uuid
from datetime import datetime
import json

# Set your OpenAI API key
openai.api_key = 'your_openai_api_key'

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'generated_images'
DATABASE_FILE = 'images_db.json'

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def load_database():
    try:
        with open(DATABASE_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        return {'images': []}

def save_database(data):
    with open(DATABASE_FILE, 'w') as f:
        json.dump(data, f)

@app.route('/generate-image', methods=['POST'])
def generate_image():
    try:
        data = request.json

        if not data.get("text_prompt"):
            return jsonify({"error": "Text prompt is required"}), 400

        # Use OpenAI's DALL·E API to generate an image
        response = openai.Image.create(
            prompt=data.get("text_prompt"),
            n=1,  # Number of images to generate
            size="1024x1024"  # Image size
        )

        # Get the image URL
        image_url = response['data'][0]['url']

        # Generate unique filename
        filename = f"{uuid.uuid4()}.png"
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        # Download the image
        image_response = requests.get(image_url)
        image_response.raise_for_status()

        # Save the image file
        with open(filepath, 'wb') as f:
            f.write(image_response.content)

        # Update database
        db = load_database()
        db['images'].append({
            'filename': filename,
            'prompt': data.get("text_prompt"),
            'timestamp': datetime.now().isoformat(),
            'image_url': image_url
        })
        save_database(db)

        return jsonify({
            "message": "Image generated successfully",
            "filename": filename
        }), 200

    except openai.error.OpenAIError as e:
        return jsonify({
            "error": "Failed to communicate with OpenAI API",
            "details": str(e)
        }), 500
    except Exception as e:
        return jsonify({
            "error": "Server error",
            "details": str(e)
        }), 500

@app.route('/images', methods=['GET'])
def get_images():
    db = load_database()
    return jsonify({
        "images": sorted(db['images'], key=lambda x: x['timestamp'], reverse=True)
    })

@app.route('/images/<filename>')
def serve_image(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    app.run(debug=True)
