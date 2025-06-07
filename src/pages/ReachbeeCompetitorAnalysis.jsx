import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const ReachbeeCompetitorAnalysis = () => {
  const [username, setUsername] = useState("");
  const [profileData, setProfileData] = useState(null);
  const [postData, setPostData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProfileData = async () => {
    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }
    setError("");
    setLoading(true);
    setProfileData(null);
    setPostData(null);

    const headers = {
      "x-rapidapi-key": "cd546b2d10msh64be9e79f462bf8p17215fjsna73c450e9a11",
      "x-rapidapi-host":
        "instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com",
    };

    try {
      // Step 1: Fetch Profile Info
      const profileRes = await fetch(
        `https://instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com/profile_by_username?username=${username}`,
        { headers }
      );
      const profile = await profileRes.json();
      setProfileData(profile);

      // Step 2: Wait 30s and fetch posts using pk (user_id)
      setTimeout(async () => {
        try {
          const postRes = await fetch(
            `https://instagram-scrapper-posts-reels-stories-downloader.p.rapidapi.com/posts_by_user_id?user_id=${profile.pk}`,
            { headers }
          );
          const postResData = await postRes.json();
          // Limit to top 15 posts
          const limitedPosts = {
            ...postResData,
            items: postResData.items ? postResData.items.slice(0, 15) : []
          };
          setPostData(limitedPosts);
        } catch (err) {
          console.error("Post fetch error:", err);
          setError("Could not fetch posts. Try again later.");
        }
      }, 30000);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Failed to fetch profile. Try again later.");
    }
    setLoading(false);
  };

  // Data processing for charts
  const getEngagementData = () => {
    if (!postData?.items) return [];
    
    return postData.items.map((post, index) => ({
      post: `Post ${index + 1}`,
      likes: post.like_count || 0,
      comments: post.comment_count || 0,
      plays: post.play_count || 0
    }));
  };

  const getMediaTypeData = () => {
    if (!postData?.items) return [];
    
    const mediaTypes = postData.items.reduce((acc, post) => {
      const type = post.media_type === 1 ? 'Photo' : post.media_type === 2 ? 'Video' : 'Carousel';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(mediaTypes).map(([type, count]) => ({
      name: type,
      value: count
    }));
  };

  const getPostingFrequency = () => {
    if (!postData?.items) return [];
    
    const dateGroups = postData.items.reduce((acc, post) => {
      const date = new Date(post.taken_at * 1000).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(dateGroups)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, count]) => ({
        date,
        posts: count
      }));
  };

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-gray-800">Competitor Analysis</h1>
          <p className="text-xl text-gray-600">
            Analyze Instagram profiles and get insights into competitor performance
          </p>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="card bg-white shadow-xl rounded-3xl">
            <div className="card-body p-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Enter Instagram username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input input-bordered input-lg flex-1 rounded-2xl text-lg"
                />
                <button
                  onClick={fetchProfileData}
                  className="btn btn-primary btn-lg rounded-2xl px-8"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-md"></span>
                  ) : (
                    "Analyze"
                  )}
                </button>
              </div>
              
              {loading && (
                <div className="mt-6 text-center">
                  <p className="text-blue-600 text-lg font-medium">
                    Fetching profile data... Posts will load in 30 seconds.
                  </p>
                </div>
              )}
              
              {error && (
                <div className="alert alert-error mt-6 rounded-2xl">
                  <span className="text-lg">{error}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Overview */}
        {profileData && (
          <div className="card bg-white shadow-xl rounded-3xl mb-8">
            <div className="card-body p-8">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Profile Overview</h2>
              <div className="flex flex-col lg:flex-row items-start gap-8">
                <div className="flex-shrink-0">
                  <div className="avatar">
                    <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                      <img
                        src={profileData.hd_profile_pic_url_info?.url}
                        alt="Profile"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-sm text-gray-500 font-medium">USERNAME</p>
                      <p className="text-xl font-bold text-gray-800">@{profileData.username}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-sm text-gray-500 font-medium">FOLLOWERS</p>
                      <p className="text-xl font-bold text-gray-800">{profileData.follower_count?.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-sm text-gray-500 font-medium">FOLLOWING</p>
                      <p className="text-xl font-bold text-gray-800">{profileData.following_count?.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-sm text-gray-500 font-medium">TOTAL POSTS</p>
                      <p className="text-xl font-bold text-gray-800">{profileData.media_count?.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-sm text-gray-500 font-medium">CATEGORY</p>
                      <p className="text-xl font-bold text-gray-800">{profileData.category || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-sm text-gray-500 font-medium">EMAIL</p>
                      <p className="text-xl font-bold text-gray-800">{profileData.public_email || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {profileData.biography && (
                <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                  <p className="text-sm text-gray-500 font-medium mb-2">BIO</p>
                  <p className="text-lg text-gray-800 leading-relaxed">{profileData.biography}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Section */}
        {postData && postData.items && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="card bg-white shadow-xl rounded-3xl">
              <div className="card-body p-8">
                <h3 className="text-3xl font-bold mb-6 text-gray-800">Key Performance Metrics</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl">
                    <p className="text-3xl font-bold mb-2">
                      {Math.round(postData.items.reduce((sum, post) => sum + (post.like_count || 0), 0) / postData.items.length).toLocaleString()}
                    </p>
                    <p className="text-blue-100 font-medium">Avg Likes/Post</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl">
                    <p className="text-3xl font-bold mb-2">
                      {Math.round(postData.items.reduce((sum, post) => sum + (post.comment_count || 0), 0) / postData.items.length).toLocaleString()}
                    </p>
                    <p className="text-green-100 font-medium">Avg Comments/Post</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl">
                    <p className="text-3xl font-bold mb-2">
                      {((postData.items.reduce((sum, post) => sum + (post.like_count || 0) + (post.comment_count || 0), 0) / postData.items.length) / (profileData?.follower_count || 1) * 100).toFixed(2)}%
                    </p>
                    <p className="text-purple-100 font-medium">Engagement Rate</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl">
                    <p className="text-3xl font-bold mb-2">
                      {postData.items.length}
                    </p>
                    <p className="text-orange-100 font-medium">Posts Analyzed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement Chart */}
            <div className="card bg-white shadow-xl rounded-3xl">
              <div className="card-body p-8">
                <h3 className="text-3xl font-bold mb-6 text-gray-800">Post Engagement Analysis</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getEngagementData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="post" 
                        tick={{ fontSize: 12 }}
                        stroke="#64748b"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke="#64748b"
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '12px',
                          color: 'white'
                        }}
                      />
                      <Bar dataKey="likes" fill="#6366f1" name="Likes" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="comments" fill="#10b981" name="Comments" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="plays" fill="#f59e0b" name="Plays" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Content Distribution & Posting Frequency */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Media Type Distribution */}
              <div className="card bg-white shadow-xl rounded-3xl">
                <div className="card-body p-8">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">Content Type Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getMediaTypeData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getMediaTypeData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Posting Frequency */}
              <div className="card bg-white shadow-xl rounded-3xl">
                <div className="card-body p-8">
                  <h3 className="text-2xl font-bold mb-6 text-gray-800">Posting Frequency</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getPostingFrequency()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10 }}
                          stroke="#64748b"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          stroke="#64748b"
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: 'none',
                            borderRadius: '12px',
                            color: 'white'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="posts" 
                          stroke="#6366f1" 
                          strokeWidth={3}
                          dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Posts Grid */}
            <div className="card bg-white shadow-xl rounded-3xl">
              <div className="card-body p-8">
                <h3 className="text-3xl font-bold mb-6 text-gray-800">Recent Posts Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {postData.items.slice(0, 6).map((post, index) => (
                    <div key={post.id} className="card bg-gray-50 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                      <figure className="aspect-square">
                        <img
                          src={post.image_versions2?.candidates?.[0]?.url}
                          alt={`Post ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </figure>
                      <div className="card-body p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-bold text-gray-700">
                              {(post.like_count || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-bold text-gray-700">
                              {(post.comment_count || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          {new Date(post.taken_at * 1000).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReachbeeCompetitorAnalysis;