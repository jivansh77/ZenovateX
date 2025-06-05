import { RiBarChartBoxLine, RiPieChartLine, RiLineChartLine, RiUserSmileLine, RiImageLine, RiChat3Line } from 'react-icons/ri';
import { useState, useEffect } from 'react';
import { FaInstagram } from 'react-icons/fa';
import { formatInstagramDataForAnalytics } from '../services/instagramService';

export default function Analytics() {
  const [selectedMetric, setSelectedMetric] = useState(0); // Default to Likes
  const [loading, setLoading] = useState(true);
  const [instagramData, setInstagramData] = useState(null);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('7');
  
  useEffect(() => {
    const fetchInstagramData = async () => {
      setLoading(true);
      try {
        // Fetch Instagram data using our service
        const data = await formatInstagramDataForAnalytics(parseInt(timeRange, 10));
        setInstagramData(data);
        setError('');
      } catch (error) {
        console.error('Error fetching Instagram data:', error);
        setError('Failed to load Instagram analytics data');
        setInstagramData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInstagramData();
  }, [timeRange]);

  // Handler for time range change
  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  // Sample data as fallback if Instagram data isn't available
  const defaultMetrics = [
    {
      name: 'Likes',
      value: '1',
      change: '+100%',
      icon: RiUserSmileLine,
      history: [0, 0, 1, 0]
    },
    {
      name: 'Comments',
      value: '1',
      change: '+100%',
      icon: RiChat3Line,
      history: [0, 0, 1, 0]
    },
    {
      name: 'Posts',
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

  // Convert Instagram data to metrics format
  const getMetrics = () => {
    if (!instagramData) return defaultMetrics;
    
    // Get timeline data for charting
    const timelineData = instagramData.timelineData || [];
    
    return [
      {
        name: 'Likes',
        value: instagramData.metrics.likes.toString(),
        change: '+10%', // You would calculate this from historical data
        icon: RiUserSmileLine,
        history: timelineData.map(day => day.likes)
      },
      {
        name: 'Comments',
        value: instagramData.metrics.comments.toString(),
        change: '+5%', // You would calculate this from historical data
        icon: RiChat3Line,
        history: timelineData.map(day => day.comments)
      },
      {
        name: 'Posts',
        value: instagramData.metrics.posts.toString(),
        change: '+0%', // You would calculate this from historical data
        icon: RiImageLine,
        history: timelineData.map(day => day.posts)
      },
      {
        name: 'Followers',
        value: instagramData.metrics.followers.toString(),
        change: '+2%', // You would calculate this from historical data
        icon: RiLineChartLine,
        // For followers, we typically don't have daily data, so use the current value
        history: timelineData.map(() => instagramData.metrics.followers / timelineData.length)
      },
    ];
  };

  const metrics = getMetrics();

  // Calculate the maximum value for graph scaling
  const maxValue = Math.max(
    ...metrics.map(metric => Math.max(...metric.history, 1)) // Ensure at least 1 to prevent division by zero
  );

  // Get dates for the chart
  const getDates = () => {
    const dates = [];
    const daysBack = parseInt(timeRange, 10);
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.getDate());
    }
    return dates;
  };

  const dates = getDates();

  // Campaign data (could be connected to a real backend)
  const campaigns = [
    {
      name: 'Summer Collection',
      reach: '850K',
      engagement: '5.2%',
      conversions: '3.8%',
      roi: '312%',
      status: 'active',
    },
    {
      name: 'Back to School',
      reach: '620K',
      engagement: '4.1%',
      conversions: '2.9%',
      roi: '245%',
      status: 'active',
    },
    {
      name: 'Holiday Special',
      reach: '980K',
      engagement: '6.3%',
      conversions: '4.2%',
      roi: '378%',
      status: 'scheduled',
    },
  ];

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
              <p className="text-sm text-base-content/70 mt-1">
                {metrics[selectedMetric].name} Growth
              </p>
              <div className="h-[300px] bg-base-100 rounded-lg p-6">
                <div className="relative w-full h-full">
                  {/* Y-axis */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-sm text-base-content/70">
                    {[...Array(5)].map((_, index) => {
                      const value = ((maxValue / 4) * (4 - index)).toFixed(1);
                      return (
                        <div key={index} className="flex items-center h-6">
                          <span className="mr-2">{value}</span>
                          <div 
                            className="w-full border-t border-base-300 absolute left-8" 
                            style={{ width: 'calc(100vw - 250px)' }} 
                          />
                        </div>
                      );
                    })}
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
                              height: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%`
                            }}
                          >
                            <div className="text-xs text-center mt-2">{dates[index]}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instagram Insights Section */}
          {instagramData && (
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">
                  <FaInstagram className="text-pink-500" />
                  Instagram Insights
                </h2>
                <div className="divider"></div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card bg-base-200">
                    <div className="card-body">
                      <h3 className="text-lg font-semibold">Account Overview</h3>
                      <p className="text-sm">@{instagramData.profile.username}</p>
                      <div className="flex gap-4 mt-2">
                        <div>
                          <p className="text-xs opacity-70">Followers</p>
                          <p className="text-xl font-bold">{instagramData.metrics.followers}</p>
                        </div>
                        <div>
                          <p className="text-xs opacity-70">Posts</p>
                          <p className="text-xl font-bold">{instagramData.profile.totalPosts}</p>
                        </div>
                        <div>
                          <p className="text-xs opacity-70">Engagement Rate</p>
                          <p className="text-xl font-bold">{instagramData.metrics.engagementRate}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {instagramData.bestPerformingPost && (
                    <div className="card bg-base-200">
                      <div className="card-body">
                        <h3 className="text-lg font-semibold">Best Performing Content</h3>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-16 bg-gray-300 rounded-lg overflow-hidden">
                            {instagramData.bestPerformingPost.imageUrl && (
                              <img 
                                src={instagramData.bestPerformingPost.imageUrl} 
                                alt="Top post" 
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">Top post this {timeRange === '7' ? 'week' : timeRange === '30' ? 'month' : 'quarter'}</p>
                            <p className="text-xs opacity-70">
                              {instagramData.bestPerformingPost.likes} likes • {instagramData.bestPerformingPost.comments} comments
                            </p>
                            <a 
                              href={instagramData.bestPerformingPost.permalink} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-xs text-primary"
                            >
                              View on Instagram
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
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Campaign</th>
                      <th>Reach</th>
                      <th>Engagement</th>
                      <th>Conversions</th>
                      <th>ROI</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => (
                      <tr key={campaign.name}>
                        <td>{campaign.name}</td>
                        <td>{campaign.reach}</td>
                        <td>{campaign.engagement}</td>
                        <td>{campaign.conversions}</td>
                        <td>{campaign.roi}</td>
                        <td>
                          <span className={`badge ${
                            campaign.status === 'active' ? 'badge-success' : 'badge-warning'
                          }`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn btn-sm btn-ghost">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                      <li>Video content outperforms images by 45%</li>
                      <li>Peak engagement occurs between 6-8 PM</li>
                      <li>Instagram Stories drive 30% more conversions</li>
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
                      <li>Increase video content in upcoming campaigns</li>
                      <li>Adjust posting schedule to target peak hours</li>
                      <li>Allocate 40% more budget to Instagram Stories</li>
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