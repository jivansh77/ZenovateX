import { useState, useEffect } from 'react';
import { RiRocketLine, RiRadarLine, RiPieChartLine, RiSettings4Line, RiUserSmileLine, RiImageLine } from 'react-icons/ri';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export default function CampaignBuilder() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlatforms, setSelectedPlatforms] = useState(['facebook', 'instagram']);
  const [selectedAudience, setSelectedAudience] = useState(null);
  const [budget, setBudget] = useState(10000);
  const [selectedContent, setSelectedContent] = useState({});
  const [activeTab, setActiveTab] = useState('social');
  const [contentLibrary, setContentLibrary] = useState({
    social: [],
    email: [
      {
        id: 1,
        subject: 'Welcome to Our Community!',
        content: '<div>Welcome email content...</div>',
        preview: null
      }
    ],
    video: [
      {
        id: 1,
        title: 'Product Demo',
        script: 'Video script content...',
        thumbnail: null
      }
    ],
    ad: [
      {
        id: 1,
        platform: 'facebook',
        content: 'Transform your business with our innovative solutions',
        preview: null
      }
    ]
  });

  useEffect(() => {
    const fetchSavedContent = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const contentQuery = query(
          collection(db, 'content'),
          where('userId', '==', user.uid)
        );

        const querySnapshot = await getDocs(contentQuery);
        const savedContent = {
          social: [],
          email: [],
          video: [],
          ad: []
        };
        
        querySnapshot.forEach((doc) => {
          const data = { id: doc.id, ...doc.data() };
          
          switch(data.type) {
            case 'social':
              savedContent.social.push({
                id: data.id,
                platform: data.platform,
                content: data.content,
                imageUrl: data.imageUrl,
                createdAt: data.createdAt,
                eventTitle: data.eventTitle
              });
              break;
            case 'video':
              savedContent.video.push({
                id: data.id,
                title: data.title,
                script: data.script,
                thumbnail: data.thumbnail,
                createdAt: data.createdAt,
                eventTitle: data.eventTitle
              });
              break;
            // Keep existing email and ad cases
            default:
              break;
          }
        });

        setContentLibrary(prev => ({
          ...prev,
          ...savedContent
        }));

      } catch (error) {
        console.error('Error fetching saved content:', error);
      }
    };

    fetchSavedContent();
  }, []);

  const steps = [
    { id: 1, name: 'Campaign Details', icon: RiRocketLine },
    { id: 2, name: 'Audience Targeting', icon: RiRadarLine },
    { id: 3, name: 'Content Selection', icon: RiPieChartLine },
    { id: 4, name: 'Settings & Launch', icon: RiSettings4Line },
  ];

  const platforms = [
    { id: 'facebook', name: 'Facebook', icon: '📱' },
    { id: 'instagram', name: 'Instagram', icon: '📸' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'twitter', name: 'Twitter', icon: '🐦' },
  ];

  const audiences = [
    {
      id: 'young-prof',
      name: 'Young Professionals',
      size: '1.2M',
      engagement: '4.8%',
      interests: ['Technology', 'Career Growth', 'Fitness'],
    },
    {
      id: 'parents',
      name: 'Parents',
      size: '850K',
      engagement: '3.2%',
      interests: ['Family', 'Education', 'Health'],
    },
    {
      id: 'business',
      name: 'Business Decision Makers',
      size: '450K',
      engagement: '5.1%',
      interests: ['Business', 'Innovation', 'Leadership'],
    },
  ];

  const [campaignData, setCampaignData] = useState({
    name: '',
    objective: 'Brand Awareness',
    startDate: '',
    endDate: '',
    description: '',
    loading: false,
    error: null
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLaunchCampaign = async () => {
    try {
      setCampaignData(prev => ({ ...prev, loading: true, error: null }));
      
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to launch a campaign');
      }

      // Create campaign object
      const campaign = {
        userId: user.uid,
        name: campaignData.name,
        objective: campaignData.objective,
        startDate: campaignData.startDate,
        endDate: campaignData.endDate,
        description: campaignData.description,
        platforms: selectedPlatforms,
        audience: selectedAudience,
        budget,
        content: selectedContent,
        status: 'active',
        createdAt: new Date().toISOString(),
        metrics: {
          reach: '0',
          engagement: '0%',
          conversions: '0%',
          roi: '0%'
        }
      };

      // Save to Firebase
      const campaignRef = await addDoc(collection(db, 'campaigns'), campaign);

      // Post to Twitter if selected
      if (selectedPlatforms.includes('twitter')) {
        await postToTwitter();
      }

      // Reset form
      setCampaignData({
        name: '',
        objective: 'Brand Awareness',
        startDate: '',
        endDate: '',
        description: '',
        loading: false,
        error: null
      });
      setCurrentStep(1);
      setSelectedPlatforms(['facebook', 'instagram']);
      setSelectedAudience(null);
      setBudget(10000);
      setSelectedContent({});

      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error) {
      setCampaignData(prev => ({ ...prev, error: error.message }));
    } finally {
      setCampaignData(prev => ({ ...prev, loading: false }));
    }
  };

  // Function to post content to Twitter
  const postToTwitter = async () => {
    try {
      // Find selected social media content
      const selectedSocialContents = [];
      
      if (selectedContent.social && selectedContent.social.length > 0) {
        selectedContent.social.forEach(id => {
          const content = contentLibrary.social.find(item => item.id === id);
          if (content) {
            selectedSocialContents.push(content);
          }
        });
      }

      if (selectedSocialContents.length === 0) {
        throw new Error('No social content selected for Twitter campaign');
      }

      // For each selected content
      for (const content of selectedSocialContents) {
        // Only proceed if we have both content text and an image URL
        if (content.content && content.imageUrl) {
          // Truncate text to Twitter's 280 character limit
          const tweetText = content.content.length > 280 
            ? content.content.substring(0, 277) + '...' 
            : content.content;
            
          // Create a FormData object to send to the backend
          const formData = new FormData();
          formData.append('text', tweetText);
          
          try {
            // Get the image file to attach
            let imageFile;
            
            if (content.imageUrl.startsWith('data:')) {
              // For data URLs, create a temporary file in public folder
              const response = await fetch(content.imageUrl);
              const blob = await response.blob();
              
              // Create a file from the blob
              imageFile = new File([blob], 'campaign_image.jpg', { type: 'image/jpeg' });
            } else if (content.imageUrl.startsWith('http')) {
              // For remote URLs
              const imageResponse = await fetch(content.imageUrl);
              const imageBlob = await imageResponse.blob();
              imageFile = new File([imageBlob], 'campaign_image.jpg', { type: 'image/jpeg' });
            } else {
              // For local file paths
              // This is a local path, we assume it's already accessible
              const filePath = content.imageUrl;
              
              // Create a response error to trigger the fetch alternative
              throw new Error('Local file needs to be fetched properly');
            }
            
            // Append the file to form data
            formData.append('image', imageFile);
            
            // Post to Twitter using the Flask backend
            const response = await fetch('http://127.0.0.1:5000/api/tweet', {
              method: 'POST',
              body: formData,
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              
              // Check if it's a rate limit error
              if (errorData.message && errorData.message.toLowerCase().includes('rate limit')) {
                console.warn('Twitter rate limit reached. Waiting before trying again.');
                // Add UI notification about rate limit
                alert('Twitter rate limit reached. Please try again later or reduce posting frequency.');
                break; // Exit the loop to avoid further rate limit errors
              }
              
              throw new Error(`Failed to post to Twitter: ${errorData.message}`);
            }
          } catch (postError) {
            console.error('Error posting to Twitter:', postError);
            
            // If there was an error with image processing, try an alternative approach
            if (postError.message.includes('needs to be fetched')) {
              try {
                // Use a special endpoint to handle local file paths
                const response = await fetch('http://127.0.0.1:5000/api/tweet-with-local-image', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    text: tweetText,
                    imagePath: content.imageUrl,
                  }),
                });
                
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(`Failed to post to Twitter: ${errorData.message}`);
                }
              } catch (localImageError) {
                console.error('Error with local image path method:', localImageError);
              }
            }
            
            // Continue with other posts even if this one fails
            continue;
          }
        }
      }
    } catch (error) {
      console.error('Error in Twitter posting process:', error);
      throw new Error(`Twitter posting failed: ${error.message}`);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Campaign Details Form */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">Campaign Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Campaign Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter campaign name"
                      className="input input-bordered"
                      value={campaignData.name}
                      onChange={(e) => setCampaignData(prev => ({
                        ...prev,
                        name: e.target.value
                      }))}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Campaign Objective</span>
                    </label>
                    <select 
                      className="select select-bordered"
                      value={campaignData.objective}
                      onChange={(e) => setCampaignData(prev => ({
                        ...prev,
                        objective: e.target.value
                      }))}
                    >
                      <option>Brand Awareness</option>
                      <option>Lead Generation</option>
                      <option>Sales Conversion</option>
                      <option>Customer Retention</option>
                    </select>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Start Date</span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered"
                      value={campaignData.startDate}
                      onChange={(e) => setCampaignData(prev => ({
                        ...prev,
                        startDate: e.target.value
                      }))}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">End Date</span>
                    </label>
                    <input
                      type="date"
                      className="input input-bordered"
                      value={campaignData.endDate}
                      onChange={(e) => setCampaignData(prev => ({
                        ...prev,
                        endDate: e.target.value
                      }))}
                    />
                  </div>
                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text">Campaign Description</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered h-24"
                      placeholder="Describe your campaign objectives and goals"
                      value={campaignData.description}
                      onChange={(e) => setCampaignData(prev => ({
                        ...prev,
                        description: e.target.value
                      }))}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Selection */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">Platform Selection</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {platforms.map((platform) => (
                    <div
                      key={platform.id}
                      className={`card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors
                        ${selectedPlatforms.includes(platform.id) ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => {
                        setSelectedPlatforms(prev => 
                          prev.includes(platform.id)
                            ? prev.filter(id => id !== platform.id)
                            : [...prev, platform.id]
                        );
                      }}
                    >
                      <div className="card-body items-center text-center">
                        <span className="text-4xl">{platform.icon}</span>
                        <h3 className="font-medium mt-2">{platform.name}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Audience Selection */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">
                  <RiUserSmileLine className="text-primary" />
                  Target Audience Selection
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {audiences.map((audience) => (
                    <div
                      key={audience.id}
                      className={`card bg-base-200 cursor-pointer hover:shadow-lg transition-all
                        ${selectedAudience === audience.id ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedAudience(audience.id)}
                    >
                      <div className="card-body">
                        <h3 className="card-title text-lg">{audience.name}</h3>
                        <div className="space-y-2">
                          <p className="text-sm">Size: {audience.size}</p>
                          <p className="text-sm">Engagement: {audience.engagement}</p>
                          <div className="flex flex-wrap gap-1">
                            {audience.interests.map((interest) => (
                              <span key={interest} className="badge badge-primary badge-sm">
                                {interest}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Targeting */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">Custom Targeting</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Age Range</span>
                    </label>
                    <div className="join">
                      <input type="number" className="join-item input input-bordered w-20" placeholder="18" />
                      <span className="join-item btn btn-disabled">to</span>
                      <input type="number" className="join-item input input-bordered w-20" placeholder="65" />
                    </div>
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Location</span>
                    </label>
                    <input type="text" className="input input-bordered" placeholder="Enter locations" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Content Selection */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">
                  <RiImageLine className="text-primary" />
                  Content Selection
                </h2>
                <div className="tabs tabs-boxed mb-6">
                  <a 
                    className={`tab ${activeTab === 'social' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('social')}
                  >
                    Social Media
                  </a>
                  <a 
                    className={`tab ${activeTab === 'email' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('email')}
                  >
                    Email Campaigns
                  </a>
                  <a 
                    className={`tab ${activeTab === 'video' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('video')}
                  >
                    Video Content
                  </a>
                  <a 
                    className={`tab ${activeTab === 'ad' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('ad')}
                  >
                    Ad Creatives
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Content Library */}
                  <div>
                    <h3 className="font-semibold mb-4">Content Library</h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                      {contentLibrary[activeTab]?.map((item) => (
                        <div key={item.id} className="card bg-base-200 mb-3">
                          <div className="card-body">
                            {activeTab === 'social' ? (
                              <>
                                <h5 className="font-medium capitalize">{item.platform} Post</h5>
                                {item.imageUrl && (
                                  <img 
                                    src={item.imageUrl} 
                                    alt="Post image" 
                                    className="w-full aspect-square object-cover rounded-lg mb-3"
                                  />
                                )}
                                <p className="text-sm">{item.content}</p>
                                <div className="text-xs text-gray-500 mt-2">
                                  Created: {new Date(item.createdAt).toLocaleDateString()}
                                </div>
                              </>
                            ) : activeTab === 'email' ? (
                              <>
                                <h5 className="font-medium">{item.subject}</h5>
                                <div className="text-sm" dangerouslySetInnerHTML={{ __html: item.content }} />
                              </>
                            ) : activeTab === 'video' ? (
                              <>
                                <h5 className="font-medium">{item.title}</h5>
                                <p className="text-sm">{item.script}</p>
                              </>
                            ) : (
                              <>
                                <h5 className="font-medium capitalize">{item.platform} Ad</h5>
                                <p className="text-sm">{item.content}</p>
                              </>
                            )}
                            <div className="card-actions justify-end mt-4">
                              <button 
                                className={`btn btn-sm ${selectedContent[activeTab]?.includes(item.id) ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setSelectedContent(prev => ({
                                  ...prev,
                                  [activeTab]: prev[activeTab]?.includes(item.id)
                                    ? prev[activeTab].filter(id => id !== item.id)
                                    : [...(prev[activeTab] || []), item.id]
                                }))}
                              >
                                {selectedContent[activeTab]?.includes(item.id) ? 'Selected' : 'Select'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Campaign Schedule */}
                  <div>
                    <h3 className="font-semibold mb-4">Campaign Schedule</h3>
                    <div className="space-y-4">
                      {Object.entries(selectedContent).map(([type, ids]) => (
                        ids.map(id => {
                          const item = contentLibrary[type].find(i => i.id === id);
                          return (
                            <div key={`${type}-${id}`} className="card bg-base-200">
                              <div className="card-body">
                                <div className="flex justify-between items-center">
                                  <h4 className="font-medium capitalize">
                                    {type === 'email' ? item.subject : 
                                     type === 'video' ? item.title :
                                     `${item.platform} Post`}
                                  </h4>
                                  <input
                                    type="datetime-local"
                                    className="input input-bordered input-sm"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Budget Optimizer */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">AI Budget Optimizer</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Total Campaign Budget</span>
                      </label>
                      <div className="join">
                        <span className="join-item btn btn-neutral">$</span>
                        <input
                          type="number"
                          value={budget}
                          onChange={(e) => setBudget(Number(e.target.value))}
                          className="join-item input input-bordered w-full"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">AI-Optimized Allocation</h3>
                      <div className="space-y-4">
                        {selectedPlatforms.map((platform, index) => {
                          const allocation = index === 0 ? 0.6 : 0.4;
                          return (
                            <div key={platform} className="flex items-center gap-4">
                              <span className="text-2xl">
                                {platforms.find(p => p.id === platform)?.icon}
                              </span>
                              <div className="flex-1">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">
                                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                                  </span>
                                  <span className="text-sm text-primary">
                                    ${(budget * allocation).toLocaleString()}
                                  </span>
                                </div>
                                <div className="w-full bg-base-200 rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${allocation * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="alert alert-success">
                      <div>
                        <h3 className="font-bold">Budget Optimization Insights</h3>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>60% allocation to Instagram based on audience engagement patterns</li>
                          <li>Recommended daily spend: ${(budget / 30).toFixed(2)} for optimal reach</li>
                          <li>Expected ROI: 287% based on historical data</li>
                        </ul>
                      </div>
                    </div>

                    <div className="card bg-base-200">
                      <div className="card-body">
                        <h3 className="card-title text-lg">Performance Forecast</h3>
                        <div className="stats stats-vertical shadow">
                          <div className="stat">
                            <div className="stat-title">Estimated Reach</div>
                            <div className="stat-value">2.4M</div>
                            <div className="stat-desc">↗︎ 15% vs. last campaign</div>
                          </div>
                          
                          <div className="stat">
                            <div className="stat-title">Projected Conversions</div>
                            <div className="stat-value">3.2%</div>
                            <div className="stat-desc">↗︎ 0.8% vs. benchmark</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Checklist */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">Launch Checklist</h2>
                <ul className="steps steps-vertical">
                  <li className="step step-primary">Campaign details completed</li>
                  <li className="step step-primary">Target audience selected</li>
                  <li className="step step-primary">Content prepared</li>
                  <li className="step step-primary">Budget allocated</li>
                  <li className="step">Ready to launch</li>
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Campaign Builder</h1>
        <div className="flex gap-2">
          <button 
            className="btn btn-outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            Back
          </button>
          {currentStep < steps.length ? (
            <button 
              className="btn btn-primary"
              onClick={handleNext}
              disabled={
                (currentStep === 1 && (!campaignData.name || !campaignData.objective)) ||
                (currentStep === 2 && !selectedAudience)
              }
            >
              Next Step
            </button>
          ) : (
            <button 
              className={`btn btn-success ${campaignData.loading ? 'loading' : ''}`}
              onClick={handleLaunchCampaign}
              disabled={campaignData.loading}
            >
              Launch Campaign
            </button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center ${
              step.id < steps.length ? 'flex-1' : ''
            }`}
          >
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${
                  step.id === currentStep
                    ? 'border-primary bg-primary text-primary-content'
                    : step.id < currentStep
                    ? 'border-success bg-success text-success-content'
                    : 'border-base-300'
                }`}
            >
              <step.icon className="w-5 h-5" />
            </div>
            <div
              className={`flex-1 h-0.5 ${
                step.id < steps.length
                  ? step.id < currentStep
                    ? 'bg-success'
                    : 'bg-base-300'
                  : 'hidden'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Error Message */}
      {campaignData.error && (
        <div className="alert alert-error">
          <div className="flex-1">
            <label>{campaignData.error}</label>
          </div>
        </div>
      )}
    </div>
  );
} 