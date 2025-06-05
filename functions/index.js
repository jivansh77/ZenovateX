/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

require('dotenv').config();


const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { TwitterApi } = require("twitter-api-v2");
require("dotenv").config(); // Load environment variables from .env file

// Twitter API setup
const twitterClient = new TwitterApi({
  appKey: process.env.VITE_TWITTER_API_KEY,
  appSecret: process.env.VITE_TWITTER_API_SECRET,
  accessToken: process.env.VITE_TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.VITE_TWITTER_ACCESS_TOKEN_SECRET,
});

// Function to fetch tweets
exports.getTweets = onRequest(async (req, res) => {
  try {
    const userId = 'your_twitter_user_id'; // Replace with your actual Twitter User ID
    const tweets = await twitterClient.v2.userTimeline(userId);
    res.status(200).json(tweets);
  } catch (error) {
    logger.error("Error fetching tweets", error);
    res.status(500).json({ error: "Unable to fetch tweets" });
  }
});
