/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

require('dotenv').config();

const https = require('https');
const { onRequest } = require("firebase-functions/v2/https");
const { onRequest: onRequest2 } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { TwitterApi } = require("twitter-api-v2");
const axios = require('axios');
const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = getFirestore();

// Twitter API setup
const twitterClient = new TwitterApi({
  appKey: process.env.VITE_TWITTER_API_KEY,
  appSecret: process.env.VITE_TWITTER_API_SECRET,
  accessToken: process.env.VITE_TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.VITE_TWITTER_ACCESS_TOKEN_SECRET,
});

// Existing Twitter function
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

function makeRapidApiRequest(path) {
  const options = {
    method: 'GET',
    hostname: 'instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com',
    path,
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com',
    }
  };
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

exports.fetchCompetitorStats = onRequest(async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: "Missing user_id parameter" });
  }

  try {
    // Make parallel API calls
    const [followers, posts, stories, comments] = await Promise.all([
      makeRapidApiRequest(`/followers_by_user_id?user_id=${user_id}`),
      makeRapidApiRequest(`/posts_by_user_id?user_id=${user_id}`),
      makeRapidApiRequest(`/stories_by_user_id?user_id=${user_id}`),
      makeRapidApiRequest(`/comments_by_user_id?user_id=${user_id}`),
    ]);

    const snapshot = {
      timestamp: Date.now(),
      followers,
      posts,
      stories,
      comments,
    };

    await db.collection('competitors').doc(user_id).set(snapshot);

    res.status(200).json(snapshot);
  } catch (err) {
    console.error("Error fetching competitor data:", err);
    res.status(500).json({ error: "Failed to fetch competitor data" });
  }
});