# Twitter Integration Setup

This document explains how to set up and use the Twitter posting functionality in the application.

## Prerequisites

1. Twitter Developer Account with API v2 access
2. Python 3.7+ for the backend server
3. Node.js for the React frontend

## Setup Instructions

### 1. Twitter API Credentials

You need to have Twitter API credentials. These are already configured in the Python backend (`src/postbackend/post.py`), but you may want to replace them with your own:

- API_KEY
- API_SECRET
- ACCESS_TOKEN
- ACCESS_TOKEN_SECRET

Make sure your Twitter app has the necessary permissions:
- Read and Write permissions
- Access to the Twitter API v2 endpoints

### 2. Python Backend Setup

The application uses a Flask server to handle Twitter posting. To set it up:

```bash
# Navigate to the backend directory
cd src/postbackend

# Install required packages
pip install flask flask-cors tweepy werkzeug

# Start the Flask server
python post.py
```

The server will run on port 5000 by default and provides these endpoints:
- POST `/api/tweet` - Posts a tweet with an image
- GET `/api/health` - Health check endpoint

### 3. Using Twitter in the Application

Once the backend is running, you can use Twitter functionality in two ways:

#### A. Post directly from Content Studio

1. Go to Content Studio
2. Create a social media post
3. Select Twitter as the platform
4. Generate content and image
5. Save to Campaign

#### B. Post when launching a Campaign

1. Build a campaign in Campaign Builder
2. Select Twitter as one of the platforms
3. Choose your content
4. Complete the campaign setup
5. Click "Launch Campaign"

When you launch a campaign, any Twitter content selected will automatically be posted to your Twitter account.

## Troubleshooting

If images aren't posting correctly, check the following:

1. Make sure the Flask server is running
2. Check the Flask server logs for errors
3. Verify your Twitter API credentials are valid
4. Ensure the image file is correctly formatted and accessible

The most common issue is with the image upload to Twitter. If you see text-only tweets, check the following in the Flask server logs:
- Media upload errors
- Authentication errors
- File format issues

## Testing the Integration

You can test the Twitter posting functionality directly:

1. Run the Python backend: `python src/postbackend/post.py`
2. Send a test request:

```bash
curl -X POST \
  http://localhost:5000/api/tweet \
  -F 'text=Test tweet from our app!' \
  -F 'image=@path/to/test/image.jpg'
```

This should post a tweet with the specified text and image to your Twitter account. 