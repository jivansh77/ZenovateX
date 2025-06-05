from flask import Flask, request, jsonify
from flask_cors import CORS
import tweepy
import os
import sys
import logging
import time
import json
import base64
import re
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Allow all origins for testing

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Twitter API credentials
API_KEY = "5q8CrLdKKYkpXfroQmo2cHaET"
API_SECRET = "5tZu3q4T60sRGSTD6kfdXKLyo9iRtE1mMhOt0gH5yk7C2SP0Na"
ACCESS_TOKEN = "1880122259378962432-EcSUVQmc0MbSC4VGqZKKj0Z5ARTCZ0"
ACCESS_TOKEN_SECRET = "PqKAQJ7j501GaaANFgw4lIa1tXg4Zca1PDdkm53dLX5bt"

# Configure upload folder
UPLOAD_FOLDER = 'temp_uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Function to convert data URL to file
def save_data_url_to_file(data_url, filename):
    try:
        # Extract the base64 data from the data URL
        if not data_url.startswith('data:'):
            return None, "Invalid data URL format"
            
        # Split the header and the base64 data
        header, encoded = data_url.split(",", 1)
        
        # Determine file extension from the header
        mime_type = header.split(":")[1].split(";")[0]
        extension = "jpg"  # Default to jpg
        if mime_type == "image/png":
            extension = "png"
        elif mime_type == "image/gif":
            extension = "gif"
            
        # Ensure the filename has the right extension
        base_filename = os.path.splitext(filename)[0]
        filename = f"{base_filename}.{extension}"
        
        # Create a secure filename
        filename = secure_filename(filename)
        
        # Save to the upload folder
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        
        # Decode and save
        with open(file_path, "wb") as f:
            f.write(base64.b64decode(encoded))
            
        return file_path, None
    except Exception as e:
        logger.error(f"Error saving data URL to file: {str(e)}")
        return None, str(e)

def post_tweet_with_image(text, image_path):
    try:
        # Ensure text is within Twitter's character limit
        if len(text) > 280:
            text = text[:277] + "..."
            
        logger.debug(f"Attempting to post tweet with text: {text} and image: {image_path}")
        
        # Set up Twitter authentication
        auth = tweepy.OAuth1UserHandler(API_KEY, API_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)
        api = tweepy.API(auth)
        
        # Verify credentials
        try:
            api.verify_credentials()
            logger.debug("Twitter credentials verified successfully")
        except tweepy.TweepyException as e:
            error_message = str(e)
            logger.error(f"Twitter credentials verification failed: {error_message}")
            
            if "rate limit" in error_message.lower():
                return {"success": False, "error": "Rate limit exceeded. Please try again later.", "rate_limited": True}
                
            return {"success": False, "error": f"Authentication failed: {error_message}"}
        
        # Create Tweepy v2 client
        client = tweepy.Client(
            consumer_key=API_KEY, 
            consumer_secret=API_SECRET,
            access_token=ACCESS_TOKEN, 
            access_token_secret=ACCESS_TOKEN_SECRET,
            wait_on_rate_limit=True
        )

        # Upload media - this is the step that likely failed before
        try:
            logger.debug(f"Uploading media from path: {image_path}")
            media = api.media_upload(filename=image_path)
            logger.debug(f"Media uploaded successfully with ID: {media.media_id}")
        except tweepy.TweepyException as media_error:
            error_message = str(media_error)
            logger.error(f"Media upload failed: {error_message}")
            
            if "rate limit" in error_message.lower():
                return {"success": False, "error": "Rate limit exceeded during media upload. Please try again later.", "rate_limited": True}
                
            return {"success": False, "error": f"Image upload failed: {error_message}"}
        
        # Post tweet with the media
        try:
            logger.debug(f"Creating tweet with media ID: {media.media_id}")
            response = client.create_tweet(
                text=text,
                media_ids=[media.media_id]
            )
            logger.debug(f"Tweet created successfully: {response.data}")
            return {"success": True, "tweet_id": response.data['id']}
        except tweepy.TweepyException as tweet_error:
            error_message = str(tweet_error)
            logger.error(f"Tweet creation failed: {error_message}")
            
            if "rate limit" in error_message.lower():
                return {"success": False, "error": "Rate limit exceeded during tweet creation. Please try again later.", "rate_limited": True}
                
            return {"success": False, "error": f"Tweet creation failed: {error_message}"}

    except Exception as e:
        logger.error(f"Unexpected error in post_tweet_with_image: {str(e)}")
        return {"success": False, "error": str(e)}

@app.route('/api/save-image', methods=['POST'])
def save_image():
    try:
        data = request.json
        if not data:
            return jsonify({"message": "No data provided"}), 400
            
        image_data = data.get('imageData')
        filename = data.get('filename', f"image_{int(time.time())}.jpg")
        
        if not image_data:
            return jsonify({"message": "No image data provided"}), 400
            
        # Save the image to a file
        file_path, error = save_data_url_to_file(image_data, filename)
        
        if error:
            return jsonify({"message": f"Error saving image: {error}"}), 500
            
        # Return the file path
        return jsonify({
            "message": "Image saved successfully",
            "imagePath": file_path
        }), 200
        
    except Exception as e:
        logger.error(f"Error saving image: {str(e)}")
        return jsonify({"message": f"Server error: {str(e)}"}), 500

@app.route('/api/tweet', methods=['POST'])
def create_tweet():
    try:
        logger.debug("Received request to /api/tweet")
        logger.debug(f"Request files: {request.files}")
        logger.debug(f"Request form: {request.form}")
        
        if 'image' not in request.files:
            logger.error("No image file in request")
            return jsonify({"message": "No image provided"}), 400
        
        image = request.files['image']
        text = request.form.get('text', '')

        if not text:
            logger.error("No text provided")
            return jsonify({"message": "No text provided"}), 400

        if image.filename == '':
            logger.error("Empty filename")
            return jsonify({"message": "No image selected"}), 400

        # Ensure text is within Twitter's character limit
        if len(text) > 280:
            text = text[:277] + "..."
            logger.debug(f"Text truncated to: {text}")

        # Save the image temporarily
        filename = secure_filename(image.filename)
        temp_path = os.path.join(UPLOAD_FOLDER, filename)
        logger.debug(f"Saving image to {temp_path}")
        image.save(temp_path)

        # Post the tweet
        result = post_tweet_with_image(text, temp_path)
        logger.debug(f"Post tweet result: {result}")

        # Clean up the temporary file
        try:
            os.remove(temp_path)
            logger.debug(f"Removed temporary file: {temp_path}")
        except Exception as e:
            logger.error(f"Error removing temporary file: {str(e)}")

        if result["success"]:
            return jsonify({
                "message": "Tweet posted successfully!",
                "tweet_id": result["tweet_id"]
            }), 200
        else:
            # Check if it's a rate limit issue
            if result.get("rate_limited", False):
                return jsonify({
                    "message": result["error"]
                }), 429  # 429 Too Many Requests
            else:
                return jsonify({
                    "message": f"Error posting tweet: {result['error']}"
                }), 400

    except Exception as e:
        logger.error(f"Server error: {str(e)}")
        return jsonify({
            "message": f"Server error: {str(e)}"
        }), 500

@app.route('/api/tweet-with-local-image', methods=['POST'])
def tweet_with_local_image():
    try:
        logger.debug("Received request to /api/tweet-with-local-image")
        
        # Get data from JSON request
        data = request.json
        if not data:
            return jsonify({"message": "No JSON data provided"}), 400
            
        text = data.get('text', '')
        image_path = data.get('imagePath', '')
        
        logger.debug(f"Received text: {text}")
        logger.debug(f"Received image path: {image_path}")
        
        if not text:
            logger.error("No text provided")
            return jsonify({"message": "No text provided"}), 400
            
        if not image_path:
            logger.error("No image path provided")
            return jsonify({"message": "No image path provided"}), 400
            
        # Check if the image file exists
        if not os.path.isfile(image_path):
            logger.error(f"Image file does not exist: {image_path}")
            
            # Try to find the file relative to the current working directory
            current_dir = os.getcwd()
            alternative_path = os.path.join(current_dir, image_path.lstrip('/'))
            
            if os.path.isfile(alternative_path):
                logger.debug(f"Found file at alternative path: {alternative_path}")
                image_path = alternative_path
            else:
                # Also try public directory
                public_path = os.path.join(current_dir, 'public', os.path.basename(image_path))
                if os.path.isfile(public_path):
                    logger.debug(f"Found file in public directory: {public_path}")
                    image_path = public_path
                else:
                    return jsonify({"message": f"Image file not found: {image_path}"}), 404
        
        # Post the tweet
        result = post_tweet_with_image(text, image_path)
        
        if result["success"]:
            return jsonify({
                "message": "Tweet posted successfully!",
                "tweet_id": result["tweet_id"]
            }), 200
        else:
            # Check if it's a rate limit issue
            if result.get("rate_limited", False):
                return jsonify({
                    "message": result["error"]
                }), 429  # 429 Too Many Requests
            else:
                return jsonify({
                    "message": f"Error posting tweet: {result['error']}"
                }), 400
                
    except Exception as e:
        logger.error(f"Server error in tweet_with_local_image: {str(e)}")
        return jsonify({
            "message": f"Server error: {str(e)}"
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Twitter posting service is running"}), 200

if __name__ == '__main__':
    logger.info("Starting Twitter posting service on port 5000")
    app.run(debug=True, port=5000)