import React, { useState, useEffect } from 'react';
import { RiUserSearchLine, RiBarChartBoxLine, RiMapPinLine, RiTimeLine } from 'react-icons/ri';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function AudienceInsights() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socialData, setSocialData] = useState(null);
  const [segments, setSegments] = useState([]);

  useEffect(() => {
    const fetchSocialMediaData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('No authenticated user found');
        }

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          throw new Error('User data not found');
        }

        // Set mock social data for testing
        setSocialData({ facebook: true, instagram: true });  // Always set mock social data
        
        // Always set segments for testing
        setSegments([
          {
            name: 'Young Professionals',
            size: '1.2M',
            engagement: '4.8%',
            interests: ['Technology', 'Career Growth', 'Fitness'],
            behavior: 'Most active during evenings',
          },
          {
            name: 'Parents',
            size: '850K',
            engagement: '3.2%',
            interests: ['Family', 'Education', 'Health'],
            behavior: 'Active on weekends',
          },
          {
            name: 'Business Decision Makers',
            size: '450K',
            engagement: '5.1%',
            interests: ['Business', 'Innovation', 'Leadership'],
            behavior: 'Active during business hours',
          },
        ]);
      } catch (error) {
        console.error('Error fetching social media data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSocialMediaData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-200 p-6">
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!socialData) {
    return (
      <div className="min-h-screen bg-base-200 p-6">
        <div className="alert alert-warning">
          <span>Please connect your social media accounts in the Business Profile section to view audience insights.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Audience Insights</h1>
        <button className="btn btn-primary">Create Segment</button>
      </div>

      {/* AI Analysis Card */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title mb-4">AI-Powered Audience Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat bg-base-200 rounded-box p-4">
              <div className="stat-figure text-primary">
                <RiUserSearchLine className="w-8 h-8 -ml-8" />
              </div>
              <div className="stat-title">Total Audience</div>
              <div className="stat-value">2.5M</div>
              <div className="stat-desc text-success">↗︎ 12% more than last month</div>
            </div>
            <div className="stat bg-base-200 rounded-box p-4">
              <div className="stat-figure text-primary">
                <RiBarChartBoxLine className="w-8 h-8" />
              </div>
              <div className="stat-title">Avg. Engagement</div>
              <div className="stat-value">4.3%</div>
              <div className="stat-desc text-success">↗︎ 2.1% increase</div>
            </div>
            <div className="stat bg-base-200 rounded-box p-4">
              <div className="stat-figure text-primary">
                <RiMapPinLine className="w-8 h-8" />
              </div>
              <div className="stat-title">Top Location</div>
              <div className="stat-value text-lg">New York</div>
              <div className="stat-desc">32% of audience</div>
            </div>
            <div className="stat bg-base-200 rounded-box p-4">
              <div className="stat-figure text-primary">
                <RiTimeLine className="w-8 h-8" />
              </div>
              <div className="stat-title">Peak Activity</div>
              <div className="stat-value text-lg">6PM - 9PM</div>
              <div className="stat-desc">EST timezone</div>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Platforms */}
      <div className="alert ">
        <div>
          <h3 className="font-bold">Connected Platforms</h3>
          <div className="mt-2 space-x-2">
            {socialData?.facebook && (
              <span className="badge">Facebook Page</span>
            )}
            {socialData?.instagram && (
              <span className="badge">Instagram Business</span>
            )}
          </div>
        </div>
      </div>

      {/* Audience Segments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {segments.map((segment) => (
          <div key={segment.name} className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-lg">{segment.name}</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-base-content/70">Segment Size</p>
                  <p className="text-xl font-bold">{segment.size}</p>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Engagement Rate</p>
                  <p className="text-xl font-bold">{segment.engagement}</p>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Key Interests</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {segment.interests.map((interest) => (
                      <span key={interest} className="badge badge-primary">{interest}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-base-content/70">Behavior Pattern</p>
                  <p className="text-sm">{segment.behavior}</p>
                </div>
              </div>
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-sm btn-outline">View Details</button>
                <button className="btn btn-sm btn-primary">Target</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Recommendations */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">AI Recommendations</h2>
          <div className="alert">
            <div>
              <h3 className="font-bold">Targeting Opportunities</h3>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Create specialized content for Young Professionals during evening hours</li>
                <li>Expand targeting to similar demographics in Chicago and LA</li>
                <li>Increase weekend content for Parent segment</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 