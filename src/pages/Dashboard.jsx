import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RiUserLine, RiBarChartBoxLine, RiRocketLine, RiMoneyDollarCircleLine, RiFlag2Line, RiMailOpenLine, RiWhatsappLine } from 'react-icons/ri';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import CustomizationForm from './CustomizationForm';
import { 
  UsersIcon, 
  ChartBarIcon, 
  BanknotesIcon, 
  BuildingOfficeIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';
import axios from 'axios';

// Define API URL
const API_URL = 'http://localhost:5005';

export default function Dashboard() {
  const [goals, setGoals] = useState([
    { 
      id: 1,
      name: 'Monthly Revenue',
      current: 85000,
      target: 100000,
      unit: '$',
      progress: 85,
      trend: '+12%',
      timeLeft: '8 days'
    },
    {
      id: 2,
      name: 'New Customers',
      current: 1200,
      target: 2000,
      unit: '',
      progress: 60,
      trend: '+5%',
      timeLeft: '8 days'
    },
    {
      id: 3,
      name: 'Engagement Rate',
      current: 4.2,
      target: 5.0,
      unit: '%',
      progress: 84,
      trend: '+0.8%',
      timeLeft: '8 days'
    }
  ]);

  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    current: '',
    target: '',
    unit: '',
    deadline: ''
  });

  const handleNewGoal = async (e) => {
    e.preventDefault();
    
    // Calculate progress
    const current = parseFloat(newGoal.current);
    const target = parseFloat(newGoal.target);
    const progress = Math.round((current / target) * 100);
    
    // Calculate days until deadline
    const deadline = new Date(newGoal.deadline);
    const today = new Date();
    const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    
    const goalToAdd = {
      id: goals.length + 1,
      name: newGoal.name,
      current: current,
      target: target,
      unit: newGoal.unit,
      progress: progress,
      trend: '+0%', // Initial trend
      timeLeft: `${daysLeft} days`
    };

    try {
      // Update goals in state
      setGoals(prev => [...prev, goalToAdd]);
      
      // Update goals in Firebase if user is logged in
      const user = auth.currentUser;
      if (user) {
        const userDoc = doc(db, 'users', user.uid);
        await updateDoc(userDoc, {
          'businessProfile.goals': [...goals, goalToAdd]
        });
      }

      // Reset form and close modal
      setNewGoal({
        name: '',
        current: '',
        target: '',
        unit: '',
        deadline: ''
      });
      setShowNewGoalModal(false);
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Failed to save goal. Please try again.');
    }
  };

  const [businessData, setBusinessData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [emailAnalytics, setEmailAnalytics] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [whatsappMessage, setWhatsappMessage] = useState({
    phoneNumber: '',
    message: ''
  });
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageStatus, setMessageStatus] = useState(null);

  const handleWhatsAppSubmit = async (e) => {
    e.preventDefault();
    setSendingMessage(true);
    setMessageStatus(null);

    try {
      const response = await axios.post(`http://localhost:5006/api/whatsapp/send`, {
        phone: whatsappMessage.phoneNumber,
        message: whatsappMessage.message
      });

      if (response.data.status === 'success') {
        setMessageStatus({ type: 'success', message: 'Message sent successfully!' });
        setWhatsappMessage({ phoneNumber: '', message: '' });
      } else {
        setMessageStatus({ type: 'error', message: 'Failed to send message.' });
      }
    } catch (error) {
      setMessageStatus({ type: 'error', message: error.message || 'Failed to send message' });
    } finally {
      setSendingMessage(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          // Fetch business data
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setBusinessData(userDoc.data().businessProfile);
          }

          // Fetch campaigns
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
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchEmailAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      setAnalyticsError(null);
      console.log('Fetching email analytics...');
      const response = await axios.get(`${API_URL}/api/email/analytics`);
      console.log('Raw analytics data:', JSON.stringify(response.data, null, 2));
      setEmailAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching email analytics:', error);
      setAnalyticsError(error.message || 'Failed to load analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    // Fetch analytics initially
    fetchEmailAnalytics();
  }, []);

  const stats = [
    {
      name: 'Industry',
      value: businessData?.industry || 'Not Specified',
      icon: BuildingOfficeIcon,
      change: 'Current Sector'
    },
    {
      name: 'Target Audience',
      value: businessData?.targetAudience || 'Not Specified',
      icon: UsersIcon,
      change: 'Primary Focus'
    },
    {
      name: 'Monthly Traffic',
      value: businessData?.monthlyWebTraffic || 'Not Specified',
      icon: ChartBarIcon,
      change: 'Current Volume'
    },
    {
      name: 'Marketing Budget',
      value: businessData?.marketingBudget || 'Not Specified',
      icon: BanknotesIcon,
      change: 'Monthly Budget'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Marketing Dashboard</h1>
        <Link to="/campaign-builder" className="btn btn-primary">New Campaign</Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/70">{stat.name}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="rounded-full p-3 bg-primary/10">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-sm text-success">{stat.change}</span>
                <span className="text-sm text-base-content/70"> vs last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign Performance */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Active Campaigns</h2>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : error ? (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No campaigns found. Create your first campaign!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
            </div>
          )}
        </div>
      </div>

      {/* Goal Tracking */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">
              <RiFlag2Line className="text-primary" />
              Campaign Goals
            </h2>
            <button 
              className="btn btn-outline btn-sm"
              onClick={() => setShowNewGoalModal(true)}
            >
              Set New Goal
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <div key={goal.id} className="card bg-base-200">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{goal.name}</h3>
                    <span className="text-success text-sm">{goal.trend}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm mb-2">
                    <span>Current: {goal.unit}{goal.current}</span>
                    <span>Target: {goal.unit}{goal.target}</span>
                  </div>

                  <div className="w-full h-3 bg-base-300 rounded-full mb-2">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${goal.progress}%` }}
                    >
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-primary">{goal.progress}% Complete</span>
                    <span>{goal.timeLeft} remaining</span>
                  </div>

                  <div className="card-actions mt-4">
                    <button className="btn btn-sm btn-outline w-full">View Details</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Goal Modal */}
      {showNewGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Set New Goal</h3>
              <button 
                className="btn btn-ghost btn-sm"
                onClick={() => setShowNewGoalModal(false)}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNewGoal} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Goal Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Monthly Sales"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Current Value</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={newGoal.current}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, current: e.target.value }))}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Target Value</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, target: e.target.value }))}
                    placeholder="100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Unit</span>
                  </label>
                  <select 
                    className="select select-bordered"
                    value={newGoal.unit}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, unit: e.target.value }))}
                    required
                  >
                    <option value="">Select Unit</option>
                    <option value="$">$ (Dollar)</option>
                    <option value="%">% (Percentage)</option>
                    <option value="">Count (No Unit)</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Deadline</span>
                  </label>
                  <input
                    type="date"
                    className="input input-bordered"
                    value={newGoal.deadline}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="modal-action">
                <button 
                  type="button" 
                  className="btn btn-ghost"
                  onClick={() => setShowNewGoalModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Integration Section */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2">
            <RiWhatsappLine className="text-2xl text-green-500" />
            WhatsApp Integration
          </h2>
          <form onSubmit={handleWhatsAppSubmit} className="space-y-4">
            <div>
              <label className="label">Phone Number</label>
              <input
                type="text"
                value={whatsappMessage.phoneNumber}
                onChange={(e) => setWhatsappMessage(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="input input-bordered w-full"
                placeholder="Enter phone number"
                required
              />
            </div>
            <div>
              <label className="label">Message</label>
              <textarea
                value={whatsappMessage.message}
                onChange={(e) => setWhatsappMessage(prev => ({ ...prev, message: e.target.value }))}
                className="textarea textarea-bordered w-full"
                placeholder="Enter your message"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={sendingMessage}
            >
              {sendingMessage ? 'Sending...' : 'Send Message'}
            </button>
            {messageStatus && (
              <div className={`alert ${messageStatus.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {messageStatus.message}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Email Analytics */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">
              <RiMailOpenLine className="text-primary" />
              Email Campaign Analytics
            </h2>
            <button 
              onClick={fetchEmailAnalytics}
              className="btn btn-ghost btn-sm"
              disabled={loadingAnalytics}
            >
              {loadingAnalytics ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                'Refresh'
              )}
            </button>
          </div>

          {loadingAnalytics ? (
            <div className="flex justify-center items-center h-32">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : analyticsError ? (
            <div className="alert alert-error">
              <div className="flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <label>Error: {analyticsError}</label>
              </div>
              <div className="flex-none">
                <button 
                  className="btn btn-sm btn-ghost" 
                  onClick={fetchEmailAnalytics}
                  disabled={loadingAnalytics}
                >
                  Retry
                </button>
              </div>
            </div>
          ) : emailAnalytics.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No email campaigns found</p>
              <p className="text-sm text-gray-400 mt-2">Send your first campaign to see analytics here</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Campaign Subject</th>
                      <th>Recipients</th>
                      <th>Opens</th>
                      <th>Open Rate</th>
                      <th>Sent At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailAnalytics.map((campaign) => {
                      const openRate = ((campaign.opens / campaign.recipients.length) * 100).toFixed(1);
                      
                      // Format timestamps
                      const formatTimestamp = (timestamp) => {
                        if (!timestamp) return 'Never';
                        try {
                          return new Date(timestamp).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          });
                        } catch (error) {
                          console.error('Error formatting timestamp:', error, timestamp);
                          return 'Invalid date';
                        }
                      };

                      return (
                        <tr key={campaign.id || campaign.campaignId}>
                          <td>{campaign.subject}</td>
                          <td>{campaign.recipients.length}</td>
                          <td>{campaign.opens}</td>
                          <td>{openRate}%</td>
                          <td>{formatTimestamp(campaign.sentAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4">
                <div className="stats shadow">
                  <div className="stat">
                    <div className="stat-title">Total Campaigns</div>
                    <div className="stat-value">{emailAnalytics.length}</div>
                  </div>
                  
                  <div className="stat">
                    <div className="stat-title">Total Opens</div>
                    <div className="stat-value">
                      {emailAnalytics.reduce((sum, campaign) => sum + (campaign.opens || 0), 0)}
                    </div>
                  </div>
                  
                  <div className="stat">
                    <div className="stat-title">Average Open Rate</div>
                    <div className="stat-value">
                      {emailAnalytics.length > 0
                        ? (
                            emailAnalytics.reduce((sum, campaign) => {
                              return sum + ((campaign.opens || 0) / campaign.recipients.length);
                            }, 0) / emailAnalytics.length * 100
                          ).toFixed(1) + '%'
                        : '0%'}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Exit Intent Popup Customization */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title flex items-center gap-2">
            <RiMailOpenLine className="text-2xl text-blue-500" />
            Exit Intent Popup Customization
          </h2>
          <CustomizationForm />
        </div>
      </div>

      {/* AI Insights */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">AI-Powered Insights</h2>
          <div className="alert alert-info">
            <div>
              <h3 className="font-bold">Optimization Opportunities</h3>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Increase ad spend during peak hours (2 PM - 6 PM) for better engagement</li>
                <li>Target audience segment "Young Professionals" shows 25% higher conversion rate</li>
                <li>Content with video performs 40% better than image-only posts</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 