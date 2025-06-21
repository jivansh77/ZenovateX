// Twitter Analytics Service

// Function to format Twitter data for analytics display
export const formatTwitterDataForAnalytics = async (daysBack = 7) => {
  try {
    // Fetch real Twitter analytics from the backend
    const response = await fetch('http://127.0.0.1:5000/api/twitter/fetch-analytics');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Twitter analytics: ${response.status}`);
    }
    
    const data = await response.json();
    
    // If we have an error in the response, throw it
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Filter timeline data based on daysBack parameter
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    
    const filteredTimelineData = data.timelineData?.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= cutoffDate;
    }) || [];
    
    // Recalculate totals based on filtered timeline data
    const totals = filteredTimelineData.reduce((acc, day) => ({
      tweets: acc.tweets + day.tweets,
      likes: acc.likes + day.likes,
      retweets: acc.retweets + day.retweets,
      comments: acc.comments + day.comments
    }), { tweets: 0, likes: 0, retweets: 0, comments: 0 });
    
    return {
      profile: data.profile,
      metrics: {
        ...totals,
        followers: data.profile.followers,
        engagementRate: totals.tweets > 0 ? 
          ((totals.likes + totals.retweets + totals.comments) / totals.tweets * 100).toFixed(1) + '%' : 
          '0%'
      },
      timelineData: filteredTimelineData,
      bestPerformingTweet: data.bestPerformingTweet,
      campaigns: [] // We'll keep this empty since we're focusing on real Twitter data
    };

  } catch (error) {
    console.error('Error fetching Twitter analytics:', error);
    
    // Return fallback data with a clear indication that it's mock data
    const fallbackTimelineData = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      fallbackTimelineData.push({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        tweets: i === 0 ? 1 : 0,
        likes: i === 0 ? 10 : Math.floor(Math.random() * 5),
        retweets: i === 0 ? 3 : Math.floor(Math.random() * 2),
        comments: i === 0 ? 2 : Math.floor(Math.random() * 2)
      });
    }

    return {
      profile: {
        username: 'your_brand',
        totalTweets: 245,
        followers: 1250,
        following: 340
      },
      metrics: {
        tweets: 1,
        likes: 10,
        retweets: 3,
        comments: 2,
        followers: 1250,
        engagementRate: '6.7%'
      },
      timelineData: fallbackTimelineData,
      bestPerformingTweet: {
        id: 'sample_tweet',
        text: 'Sample tweet content from your latest campaign',
        likes: 10,
        retweets: 3,
        comments: 2,
        imageUrl: '/public/output.jpg',
        permalink: 'https://twitter.com/your_brand/status/sample'
      },
      campaigns: [],
      error: error.message
    };
  }
};

// Function to get Twitter campaign performance (keep this for campaign-specific data)
// export const getTwitterCampaignPerformance = async () => {
//   try {
//     const user = auth.currentUser;
//     if (!user) {
//       console.log('User not authenticated, returning empty campaigns');
//       return [];
//     }

//     const campaignsQuery = query(
//       collection(db, 'campaigns'),
//       where('userId', '==', user.uid),
//       where('platforms', 'array-contains', 'twitter'),
//       orderBy('createdAt', 'desc')
//     );

//     const campaignsSnapshot = await getDocs(campaignsQuery);
//     const campaigns = [];

//     campaignsSnapshot.forEach((doc) => {
//       const campaign = { id: doc.id, ...doc.data() };
      
//       // Generate mock Twitter performance metrics for campaigns
//       const mockMetrics = {
//         reach: `${Math.floor(Math.random() * 900) + 100}K`,
//         engagement: `${(Math.random() * 3 + 2).toFixed(1)}%`,
//         conversions: `${(Math.random() * 2 + 1).toFixed(1)}%`,
//         roi: `${Math.floor(Math.random() * 200) + 150}%`,
//         tweets: Math.floor(Math.random() * 5) + 1,
//         totalLikes: Math.floor(Math.random() * 100) + 20,
//         totalRetweets: Math.floor(Math.random() * 50) + 10
//       };

//       campaigns.push({
//         ...campaign,
//         metrics: mockMetrics
//       });
//     });

//     return campaigns;
//   } catch (error) {
//     console.error('Error fetching Twitter campaign performance:', error);
//     return [];
//   }
// }; 