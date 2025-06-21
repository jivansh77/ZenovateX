import { RiBarChartBoxLine, RiPieChartLine, RiLineChartLine, RiUserSmileLine, RiImageLine, RiChat3Line } from 'react-icons/ri';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';
// import { FaInstagram } from 'react-icons/fa';
// import { formatInstagramDataForAnalytics } from '../services/instagramService';
import { formatTwitterDataForAnalytics } from '../services/twitterService';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function Analytics() {
  const [selectedMetric, setSelectedMetric] = useState(0); // Default to Likes
  const [loading, setLoading] = useState(true);
  const [twitterData, setTwitterData] = useState(null);
  // const [instagramData, setInstagramData] = useState(null);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('7');
  const [campaigns, setCampaigns] = useState([]);
  
  useEffect(() => {
    const fetchTwitterData = async () => {
      setLoading(true);
      try {
        // Fetch Twitter data using our service
        const data = await formatTwitterDataForAnalytics(parseInt(timeRange, 10));
        setTwitterData(data);
        
        // Fetch all campaigns from Firebase
        const user = auth.currentUser;
        if (user) {
          const campaignsQuery = query(
            collection(db, 'campaigns'),
            where('userId', '==', user.uid)
          );
          const campaignsSnapshot = await getDocs(campaignsQuery);
          const campaignsList = campaignsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCampaigns(campaignsList);
        }
        
        setError('');
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load analytics data');
        setTwitterData(null);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTwitterData();
  }, [timeRange]);

  // Handler for time range change
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  // Sample data as fallback if Twitter data isn't available
  const defaultMetrics = [
    {
      name: 'Likes',
      value: '1',
      change: '+100%',
      icon: RiUserSmileLine,
      history: [0, 0, 1, 0]
    },
    {
      name: 'Retweets',
      value: '1',
      change: '+100%',
      icon: RiChat3Line,
      history: [0, 0, 1, 0]
    },
    {
      name: 'Tweets',
      value: '0',
      change: '0%',
      icon: RiImageLine,
      history: [0, 0, 0, 0]
    },
    {
      name: 'Followers',
      value: '2',
      change: '+100%',
      icon: RiLineChartLine,
      history: [0, 0, 2, 0]
    },
  ];

  // Convert Twitter data to metrics format
  const getMetrics = () => {
    if (!twitterData) return [];
    
    // Get timeline data for charting
    const timelineData = twitterData.timelineData || [];

    // Calculate percentage changes
    const calculateChange = (history) => {
      if (history.length < 2) return '0%';
      
      // Get the sum of last half vs first half of the period
      const midPoint = Math.floor(history.length / 2);
      const recentSum = history.slice(midPoint).reduce((a, b) => a + b, 0);
      const previousSum = history.slice(0, midPoint).reduce((a, b) => a + b, 0);
      
      if (previousSum === 0) return recentSum > 0 ? '+100%' : '0%';
      
      const percentChange = ((recentSum - previousSum) / previousSum) * 100;
      return `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`;
    };
    
    return [
      {
        name: 'Likes',
        value: twitterData.metrics.likes.toString(),
        change: calculateChange(timelineData.map(day => day.likes)),
        icon: RiUserSmileLine,
        history: timelineData.map(day => day.likes)
      },
      {
        name: 'Retweets',
        value: twitterData.metrics.retweets.toString(),
        change: calculateChange(timelineData.map(day => day.retweets)),
        icon: RiChat3Line,
        history: timelineData.map(day => day.retweets)
      },
      {
        name: 'Tweets',
        value: twitterData.metrics.tweets.toString(),
        change: calculateChange(timelineData.map(day => day.tweets)),
        icon: RiImageLine,
        history: timelineData.map(day => day.tweets)
      },
      {
        name: 'Followers',
        value: twitterData.metrics.followers.toString(),
        change: calculateChange(timelineData.map(() => twitterData.metrics.followers / timelineData.length)),
        icon: RiLineChartLine,
        history: timelineData.map(() => twitterData.metrics.followers / timelineData.length)
      },
    ];
  };

  const metrics = getMetrics();

  // Get dates for the chart from the actual timeline data
  const getDates = () => {
    if (!twitterData?.timelineData) return [];
    
    return twitterData.timelineData.map(day => {
      const date = new Date(day.date);
      return {
        day: date.getDate(),
        month: date.toLocaleString('default', { month: 'short' })
      };
    });
  };

  const dates = getDates();

  // Calculate the maximum value for graph scaling
  const maxValue = metrics.length > 0 ? Math.max(
    ...metrics[selectedMetric].history.map(value => value || 0),
    1  // Ensure we have at least a scale of 1
  ) : 1;

  // Calculate y-axis scale values
  const yAxisValues = [...Array(5)].map((_, index) => {
    const value = ((maxValue / 4) * (4 - index));
    return value > 100 ? Math.round(value) : value.toFixed(1);
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Campaign Analytics</h1>
        <div className="flex gap-2">
          <select 
            className="select select-bordered"
            value={timeRange}
            onChange={handleTimeRangeChange}
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 3 Months</option>
          </select>
          <button className="btn btn-outline">Export Report</button>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}
      
      {twitterData?.error && (
        <div className="alert alert-warning">
          <div>
            <h3 className="font-bold">Twitter API Connection Issue</h3>
            <p>Unable to fetch real Twitter data: {twitterData.error}</p>
            <p className="text-sm mt-2">Showing mock data. Please check your Twitter API credentials in the backend.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric, index) => (
              <div key={metric.name} className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/70">{metric.name}</p>
                      <p className="text-2xl font-bold mt-1">{metric.value}</p>
                    </div>
                    <div className="rounded-full p-3 bg-primary/10">
                      <metric.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-success">{metric.change}</span>
                    <span className="text-sm text-base-content/70"> vs last period</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Graph */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">Performance Overview</h2>
              <div className="flex gap-4 mt-2">
                {metrics.map((metric, index) => (
                  <button
                    key={metric.name}
                    className={`btn btn-sm ${selectedMetric === index ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setSelectedMetric(index)}
                  >
                    {metric.name}
                  </button>
                ))}
              </div>
              {metrics.length > 0 && (
                <>
                  <p className="text-sm text-base-content/70 mt-1">
                    {metrics[selectedMetric].name} Growth
                  </p>
                  <div className="h-[300px] bg-base-100 rounded-lg p-6">
                    <div className="relative w-full h-full">
                      {/* Y-axis */}
                      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-sm text-base-content/70">
                        {yAxisValues.map((value, index) => (
                          <div key={index} className="flex items-center h-6">
                            <span className="mr-2">{value}</span>
                            <div 
                              className="w-full border-t border-base-300 absolute left-8" 
                              style={{ width: 'calc(100vw - 250px)' }} 
                            />
                          </div>
                        ))}
                      </div>

                      {/* Graph Content */}
                      <div className="pl-16 h-full">
                        <div className="relative h-full flex items-end justify-between">
                          {/* Bars */}
                          {metrics[selectedMetric].history.map((value, index) => (
                            <div key={index} className="flex-1 flex justify-center">
                              <div 
                                className={`w-16 ${value > 0 ? 'bg-primary' : 'bg-base-300'} rounded-t-lg transition-all duration-500`} 
                                style={{ 
                                  height: `${(value / maxValue) * 100}%`,
                                  minHeight: '2px'  // Ensure very small values are still visible
                                }}
                              >
                                <div className="text-xs text-center mt-2">
                                  {dates[index]?.day}
                                  <br />
                                  {dates[index]?.month}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Twitter Insights Section */}
          {twitterData && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">
                  <FontAwesomeIcon icon={faXTwitter} className="text-black" />
                  Twitter Insights
                </h2>
                <div className="divider"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card bg-base-200">
                    <div className="card-body">
                      <h3 className="text-lg font-semibold">Account Overview</h3>
                      <p className="text-sm">@{twitterData.profile.username}</p>
                      <div className="flex gap-4 mt-2">
                        <div>
                          <p className="text-xs opacity-70">Followers</p>
                          <p className="text-xl font-bold">{twitterData.metrics.followers}</p>
                        </div>
                        <div>
                          <p className="text-xs opacity-70">Tweets</p>
                          <p className="text-xl font-bold">{twitterData.profile.totalTweets}</p>
                        </div>
                        <div>
                          <p className="text-xs opacity-70">Engagement Rate</p>
                          <p className="text-xl font-bold">{twitterData.metrics.engagementRate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {twitterData.bestPerformingTweet && (
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <h3 className="text-lg font-semibold">Best Performing Tweet</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-16 bg-gray-300 rounded-lg overflow-hidden">
                            {twitterData.bestPerformingTweet.imageUrl && (
                              <img 
                                src={twitterData.bestPerformingTweet.imageUrl} 
                                alt="Top tweet" 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">Top tweet this {timeRange === '7' ? 'week' : timeRange === '30' ? 'month' : 'quarter'}</p>
                            <p className="text-xs opacity-70">
                              {twitterData.bestPerformingTweet.likes} likes • {twitterData.bestPerformingTweet.retweets} retweets • {twitterData.bestPerformingTweet.comments} replies
                            </p>
                            <a 
                              href={twitterData.bestPerformingTweet.permalink} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-xs text-primary"
                            >
                              View on Twitter
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Campaign Performance Table */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h2 className="card-title">Campaign Performance</h2>
              <div className="overflow-x-auto">
                {campaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No campaigns found. Create your first campaign!</p>
                  </div>
                ) : (
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Campaign Name</th>
                        <th>Status</th>
                        <th>Audience Reach</th>
                        <th>Conversion Rate</th>
                        <th>Budget</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => (
                        <tr key={campaign.id}>
                          <td>{campaign.name}</td>
                          <td>
                            <span className={`badge ${
                              campaign.status === 'active' ? 'badge-success' : 'badge-warning'
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td>{campaign.metrics?.reach || '0'}</td>
                          <td>{campaign.metrics?.conversions || '0%'}</td>
                          <td>${campaign.budget?.toLocaleString()}</td>
                          <td>
                            <button className="btn btn-sm btn-ghost">Edit</button>
                            <button className="btn btn-sm btn-ghost">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">AI Performance Insights</h2>
                <div className="alert alert-info">
                  <div>
                    <h3 className="font-bold">Key Findings</h3>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Tweets with images get 150% more retweets</li>
                      <li>Peak engagement occurs between 9-10 AM and 7-9 PM</li>
                      <li>Threads perform better than single tweets</li>
                      <li>Hashtag usage increases visibility by 40%</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">Recommendations</h2>
                <div className="alert alert-success">
                  <div>
                    <h3 className="font-bold">Optimization Opportunities</h3>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Include high-quality images in all tweets</li>
                      <li>Schedule tweets during peak engagement hours</li>
                      <li>Use 2-3 relevant hashtags per tweet</li>
                      <li>Engage with replies to boost algorithm visibility</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}