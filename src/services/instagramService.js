/**
 * Instagram Service - Fetches data from a single business account
 * 
 * This approach uses a pre-authenticated access token for your own
 * Instagram Business account. No user login required.
 */

// Your long-lived access token (should be stored securely)
// Get this by authenticating once through Facebook Graph API Explorer
// or through a server-side process
const INSTAGRAM_ACCESS_TOKEN = import.meta.env.INSTAGRAM_ACCESS_TOKEN;

// Your Instagram Business ID
const INSTAGRAM_BUSINESS_ID = import.meta.env.INSTAGRAM_BUSINESS_ID;

// API version
const API_VERSION = 'v16.0';

// Flag to use mock data while developing/debugging
const USE_MOCK_DATA = true;

// Sample mock data for development and fallback
const MOCK_PROFILE = {
  username: "yourbusiness",
  profile_picture_url: "https://placekitten.com/200/200",
  name: "Your Business",
  followers_count: 1245,
  media_count: 42
};

const MOCK_MEDIA = {
  data: [
    {
      id: "post1",
      caption: "Check out our new product! #awesome",
      media_type: "IMAGE",
      media_url: "https://placekitten.com/800/800",
      permalink: "https://www.instagram.com/p/sample1/",
      timestamp: "2023-10-15T10:00:00+0000",
      like_count: 45,
      comments_count: 12
    },
    {
      id: "post2",
      caption: "Behind the scenes at our office",
      media_type: "IMAGE",
      media_url: "https://placekitten.com/801/801",
      permalink: "https://www.instagram.com/p/sample2/",
      timestamp: "2023-10-10T14:30:00+0000",
      like_count: 38,
      comments_count: 5
    },
    {
      id: "post3",
      caption: "Product launch event",
      media_type: "IMAGE",
      media_url: "https://placekitten.com/802/802",
      permalink: "https://www.instagram.com/p/sample3/",
      timestamp: "2023-10-05T18:45:00+0000",
      like_count: 76,
      comments_count: 15
    }
  ]
};

// Generate more mock posts to simulate historical data
for (let i = 4; i <= 20; i++) {
  const date = new Date();
  date.setDate(date.getDate() - (i % 10)); // Spread over the last 10 days
  
  MOCK_MEDIA.data.push({
    id: `post${i}`,
    caption: `Sample post ${i}`,
    media_type: "IMAGE",
    media_url: `https://placekitten.com/${800 + i}/${800 + i}`,
    permalink: `https://www.instagram.com/p/sample${i}/`,
    timestamp: date.toISOString(),
    like_count: Math.floor(Math.random() * 50) + 10,
    comments_count: Math.floor(Math.random() * 10) + 1
  });
}

/**
 * Fetch Instagram account basic info
 */
export const getInstagramProfile = async () => {
  // Return mock data if flag is set
  if (USE_MOCK_DATA) {
    console.log('Using mock profile data');
    return MOCK_PROFILE;
  }
  
  try {
    console.log('Fetching Instagram profile...');
    const response = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${INSTAGRAM_BUSINESS_ID}?fields=username,profile_picture_url,name,followers_count,media_count&access_token=${INSTAGRAM_ACCESS_TOKEN}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Instagram API Error:', errorData);
      throw new Error(`Failed to fetch Instagram profile: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Profile data fetched successfully');
    return data;
  } catch (error) {
    console.error('Instagram profile fetch error:', error);
    // Fallback to mock data on error
    console.log('Falling back to mock profile data');
    return MOCK_PROFILE;
  }
};

/**
 * Fetch recent media from Instagram account
 */
export const getInstagramMedia = async (limit = 25) => {
  // Return mock data if flag is set
  if (USE_MOCK_DATA) {
    console.log('Using mock media data');
    return MOCK_MEDIA;
  }
  
  try {
    console.log('Fetching Instagram media...');
    const response = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${INSTAGRAM_BUSINESS_ID}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,like_count,comments_count&limit=${limit}&access_token=${INSTAGRAM_ACCESS_TOKEN}`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Instagram API Error:', errorData);
      throw new Error(`Failed to fetch Instagram media: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Media data fetched successfully');
    return data;
  } catch (error) {
    console.error('Instagram media fetch error:', error);
    // Fallback to mock data on error
    console.log('Falling back to mock media data');
    return MOCK_MEDIA;
  }
};

/**
 * Fetch Instagram insights for a specific time period
 */
export const getInstagramInsights = async (period = 'day', metrics = ['reach', 'impressions']) => {
  try {
    const response = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${INSTAGRAM_BUSINESS_ID}/insights?metric=${metrics.join(',')}&period=${period}&access_token=${INSTAGRAM_ACCESS_TOKEN}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch Instagram insights');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Instagram insights fetch error:', error);
    throw error;
  }
};

/**
 * Format Instagram data for the analytics dashboard
 */
export const formatInstagramDataForAnalytics = async (timeRange = 7) => {
  try {
    console.log(`Formatting Instagram data for ${timeRange} days...`);
    
    // Get profile and media data
    const profileData = await getInstagramProfile();
    const mediaData = await getInstagramMedia(50);
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - timeRange);
    
    // Filter media by date range
    const recentMedia = mediaData.data.filter(item => {
      const postDate = new Date(item.timestamp);
      return postDate >= startDate && postDate <= endDate;
    });
    
    // Calculate metrics
    const likes = recentMedia.reduce((sum, post) => sum + (post.like_count || 0), 0);
    const comments = recentMedia.reduce((sum, post) => sum + (post.comments_count || 0), 0);
    const posts = recentMedia.length;
    const followers = profileData.followers_count || 0;
    
    // Generate daily data
    const dailyData = {};
    for (let i = 0; i < timeRange; i++) {
      const date = new Date();
      date.setDate(endDate.getDate() - i);
      const dateStr = date.getDate().toString();
      dailyData[dateStr] = {
        likes: 0,
        comments: 0,
        posts: 0
      };
    }
    
    // Populate daily data
    recentMedia.forEach(post => {
      const postDate = new Date(post.timestamp);
      const dateStr = postDate.getDate().toString();
      if (dailyData[dateStr]) {
        dailyData[dateStr].likes += (post.like_count || 0);
        dailyData[dateStr].comments += (post.comments_count || 0);
        dailyData[dateStr].posts += 1;
      }
    });
    
    // Get engagement data
    const engagement = likes + comments;
    const engagementRate = followers > 0 ? (engagement / followers * 100).toFixed(2) : 0;
    
    // Find best performing post
    const bestPost = recentMedia.sort((a, b) => 
      (b.like_count || 0) + (b.comments_count || 0) - (a.like_count || 0) - (a.comments_count || 0)
    )[0] || null;
    
    // Format the data for the dashboard
    const result = {
      profile: {
        username: profileData.username,
        profilePicture: profileData.profile_picture_url,
        name: profileData.name,
        followers,
        totalPosts: profileData.media_count
      },
      metrics: {
        followers,
        posts,
        likes,
        comments,
        engagement,
        engagementRate: `${engagementRate}%`
      },
      timelineData: Object.keys(dailyData).sort().map(date => ({
        date,
        likes: dailyData[date].likes,
        comments: dailyData[date].comments,
        posts: dailyData[date].posts
      })),
      bestPerformingPost: bestPost ? {
        id: bestPost.id,
        imageUrl: bestPost.media_url || bestPost.thumbnail_url,
        likes: bestPost.like_count || 0,
        comments: bestPost.comments_count || 0,
        permalink: bestPost.permalink,
        caption: bestPost.caption
      } : null
    };
    
    console.log('Instagram data formatted successfully');
    return result;
  } catch (error) {
    console.error('Error formatting Instagram data:', error);
    
    // Create basic fallback data based on mock data
    const randomFollowers = 1200 + Math.floor(Math.random() * 500);
    return {
      profile: {
        username: "yourbusiness",
        profilePicture: "https://placekitten.com/200/200",
        name: "Your Business",
        followers: randomFollowers,
        totalPosts: 42
      },
      metrics: {
        followers: randomFollowers,
        posts: 3,
        likes: 159,
        comments: 32,
        engagement: 191,
        engagementRate: "15.92%"
      },
      timelineData: Array.from({ length: timeRange }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return {
          date: date.getDate().toString(),
          likes: Math.floor(Math.random() * 30) + 5,
          comments: Math.floor(Math.random() * 10) + 1,
          posts: Math.random() > 0.5 ? 1 : 0
        };
      }).sort((a, b) => parseInt(a.date) - parseInt(b.date)),
      bestPerformingPost: {
        id: "sample1",
        imageUrl: "https://placekitten.com/800/800",
        likes: 76,
        comments: 15,
        permalink: "https://www.instagram.com/p/sample1/",
        caption: "Check out our latest product launch! #exciting"
      }
    };
  }
}; 