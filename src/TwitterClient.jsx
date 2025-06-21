// src/twitterClient.js
import { TwitterApi } from 'twitter-api-v2';

// Twitter API keys from environment variables
const twitterClient = new TwitterApi({
  appKey: import.meta.env.VITE_TWITTER_API_KEY,  // Your API Key
  appSecret: import.meta.env.VITE_TWITTER_API_SECRET,  // Your API Secret
  accessToken: import.meta.env.VITE_TWITTER_ACCESS_TOKEN,  // Your Access Token
  accessSecret: import.meta.env.VITE_TWITTER_ACCESS_TOKEN_SECRET,  // Your Access Token Secret
});

// Function to fetch your tweets and related analytics
const getTweetsData = async () => {
  try {
    const { data } = await twitterClient.v2.userTimeline('your_twitter_user_id');  // Replace with your Twitter User ID
    console.log('Tweets:', data);  // Log your tweets or handle the data as needed
    return data;  // You can return the data if needed for further use in your app
  } catch (error) {
    console.error('Error fetching tweets:', error);
    return null;  // Return null or handle the error as needed
  }
};

// Export the function
export default getTweetsData;
