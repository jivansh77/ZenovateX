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
API_KEY = os.getenv('API_KEY')
API_SECRET = os.getenv('API_SECRET')
ACCESS_TOKEN = os.getenv('ACCESS_TOKEN')
ACCESS_TOKEN_SECRET = os.getenv('ACCESS_TOKEN_SECRET')
BEARER_TOKEN = os.getenv('BEARER_TOKEN')  # Add Bearer token for v2 API

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
        
        # Create Tweepy v2 client with Bearer token
        client = tweepy.Client(
            bearer_token=BEARER_TOKEN,
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

@app.route('/api/twitter/fetch-analytics', methods=['GET'])
def fetch_twitter_analytics():
    """Fetch real Twitter analytics using Twitter API"""
    try:
        # Set up Twitter authentication
        auth = tweepy.OAuth1UserHandler(API_KEY, API_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)
        api = tweepy.API(auth)
        
        # Create Tweepy v2 client with Bearer token
        client = tweepy.Client(
            bearer_token=BEARER_TOKEN,
            consumer_key=API_KEY, 
            consumer_secret=API_SECRET,
            access_token=ACCESS_TOKEN, 
            access_token_secret=ACCESS_TOKEN_SECRET,
            wait_on_rate_limit=True
        )
        
        # Verify credentials and get user info
        try:
            user_info = api.verify_credentials()
            logger.debug(f"Authenticated user: {user_info.screen_name}")
        except tweepy.TweepyException as e:
            return jsonify({"error": f"Authentication failed: {str(e)}"}), 401
        
        # Get user's recent tweets (up to 100)
        try:
            # Get user's own tweets using v2 API
            user_id = user_info.id
            tweets_response = client.get_users_tweets(
                id=user_id,
                max_results=100,
                tweet_fields=['created_at', 'public_metrics', 'attachments'],
                expansions=['attachments.media_keys'],
                media_fields=['url', 'preview_image_url']
            )
            
            if not tweets_response.data:
                return jsonify({
                    "profile": {
                        "username": user_info.screen_name,
                        "totalTweets": user_info.statuses_count,
                        "followers": user_info.followers_count,
                        "following": user_info.friends_count
                    },
                    "metrics": {
                        "tweets": 0,
                        "likes": 0,
                        "retweets": 0,
                        "comments": 0,
                        "followers": user_info.followers_count,
                        "engagementRate": "0%"
                    },
                    "tweets": [],
                    "bestPerformingTweet": None
                }), 200
            
            # Process tweets and calculate metrics
            tweets_data = []
            total_likes = 0
            total_retweets = 0
            total_replies = 0
            best_tweet = None
            max_engagement = 0
            
            # Get media data if available
            media_dict = {}
            if tweets_response.includes and 'media' in tweets_response.includes:
                for media in tweets_response.includes['media']:
                    media_dict[media.media_key] = media
            
            for tweet in tweets_response.data:
                metrics = tweet.public_metrics
                likes = metrics['like_count']
                retweets = metrics['retweet_count']
                replies = metrics['reply_count']
                
                total_likes += likes
                total_retweets += retweets
                total_replies += replies
                
                # Get image URL if tweet has media
                image_url = None
                if hasattr(tweet, 'attachments') and tweet.attachments:
                    media_keys = tweet.attachments.get('media_keys', [])
                    for media_key in media_keys:
                        if media_key in media_dict:
                            media = media_dict[media_key]
                            if media.type == 'photo':
                                image_url = media.url
                                break
                            elif media.type == 'video' and hasattr(media, 'preview_image_url'):
                                image_url = media.preview_image_url
                                break
                
                tweet_data = {
                    "id": tweet.id,
                    "text": tweet.text,
                    "likes": likes,
                    "retweets": retweets,
                    "comments": replies,
                    "createdAt": tweet.created_at.isoformat(),
                    "imageUrl": image_url,
                    "permalink": f"https://twitter.com/{user_info.screen_name}/status/{tweet.id}"
                }
                
                tweets_data.append(tweet_data)
                
                # Track best performing tweet
                engagement = likes + retweets + replies
                if engagement > max_engagement:
                    max_engagement = engagement
                    best_tweet = tweet_data
            
            # Calculate engagement rate
            total_tweets = len(tweets_data)
            total_engagement = total_likes + total_retweets + total_replies
            engagement_rate = (total_engagement / max(total_tweets, 1) * 100) if total_tweets > 0 else 0
            
            # Generate timeline data (last 7 days)
            timeline_data = []
            from datetime import datetime, timedelta
            
            for i in range(6, -1, -1):  # Last 7 days
                date = datetime.now() - timedelta(days=i)
                date_str = date.strftime('%Y-%m-%d')
                
                # Count tweets for this day
                day_tweets = [t for t in tweets_data if t['createdAt'].startswith(date_str)]
                day_likes = sum(t['likes'] for t in day_tweets)
                day_retweets = sum(t['retweets'] for t in day_tweets)
                day_comments = sum(t['comments'] for t in day_tweets)
                
                timeline_data.append({
                    "date": date_str,
                    "tweets": len(day_tweets),
                    "likes": day_likes,
                    "retweets": day_retweets,
                    "comments": day_comments
                })
            
            return jsonify({
                "profile": {
                    "username": user_info.screen_name,
                    "totalTweets": user_info.statuses_count,
                    "followers": user_info.followers_count,
                    "following": user_info.friends_count
                },
                "metrics": {
                    "tweets": total_tweets,
                    "likes": total_likes,
                    "retweets": total_retweets,
                    "comments": total_replies,
                    "followers": user_info.followers_count,
                    "engagementRate": f"{engagement_rate:.1f}%"
                },
                "timelineData": timeline_data,
                "tweets": tweets_data,
                "bestPerformingTweet": best_tweet
            }), 200
            
        except tweepy.TweepyException as e:
            logger.error(f"Error fetching tweets: {str(e)}")
            return jsonify({"error": f"Failed to fetch tweets: {str(e)}"}), 500
            
    except Exception as e:
        logger.error(f"Error in fetch_twitter_analytics: {str(e)}")
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route('/api/twitter/check-config', methods=['GET'])
def check_twitter_config():
    try:
        # Check if we have the required Twitter API credentials
        if all([API_KEY, API_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET, BEARER_TOKEN]):
            # You could optionally verify the credentials here by making a test API call
            return jsonify({
                'configured': True,
                'username': 'Developer Account'  # You could fetch the actual username if needed
            })
        return jsonify({
            'configured': False,
            'error': 'Twitter API credentials not fully configured'
        })
    except Exception as e:
        return jsonify({
            'configured': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "Twitter posting service is running"}), 200

if __name__ == '__main__':
    logger.info("Starting Twitter posting service on port 5000")
    app.run(debug=True, port=5000)