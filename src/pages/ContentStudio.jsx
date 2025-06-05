import { useState, useEffect } from 'react';
import { RiMagicLine, RiFileTextLine, RiImageLine, RiVideoLine } from 'react-icons/ri';
import { auth, db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function ContentStudio() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [contentType, setContentType] = useState('social');
  const [prompt, setPrompt] = useState('');
  const [emailData, setEmailData] = useState({
    subject: '',
    emailList: null,
    extractedEmails: [],
    preview: null,
    loading: false,
    error: null,
  });
  const [videoData, setVideoData] = useState({
    preview: null,
    loading: false,
    error: null,
    metadata: null,
  });
  const [socialMediaData, setSocialMediaData] = useState({
    preview: null,
    loading: false,
    imageLoading: false,
    error: null,
    platform: 'instagram',
    imagePrompt: '',
    savingToCampaign: false,
    imagePath: null,
  });
  const [generatedImage, setGeneratedImage] = useState(null);
  const [adCreativeData, setAdCreativeData] = useState({
    videoUrl: null,
    loading: false,
    error: null,
    savingToCampaign: false
  });

  // Comment out Pollinations hook
  // const imagePrompt = prompt ? `Generate an image for ${socialMediaData.platform} post for best branding based on the following idea: ${prompt}` : '';
  // const generatedImageUrl = usePollinationsImage(imagePrompt, {
  //   width: 512,
  //   height: 512,
  //   seed: Math.floor(Math.random() * 1000000), // Random seed for variety
  //   model: 'flux',
  // });

  useEffect(() => {
    if (prompt) {
      setSocialMediaData(prev => ({
        ...prev,
        imagePrompt: prompt
      }));
    }
  }, [prompt]);

  const templates = [
    {
      id: 1,
      name: 'Social Media Post',
      description: 'Create engaging social media content optimized for each platform',
      icon: RiFileTextLine,
    },
    {
      id: 2,
      name: 'Email Campaign',
      description: 'Design personalized email campaigns with dynamic content',
      icon: RiFileTextLine,
    },
    {
      id: 3,
      name: 'Ad Creative',
      description: 'Generate high-converting ad creatives for different platforms',
      icon: RiImageLine,
    },
    {
      id: 4,
      name: 'Video Script',
      description: 'Write compelling video scripts with AI assistance',
      icon: RiVideoLine,
    },
  ];

  const [recentContent, setRecentContent] = useState([
    {
      title: 'Summer Collection Launch',
      type: 'Social Media Campaign',
      performance: '98% AI Score',
      date: '2 hours ago',
    },
    {
      title: 'Customer Appreciation Email',
      type: 'Email Campaign',
      performance: '95% AI Score',
      date: '1 day ago',
    },
    {
      title: 'Product Demo Video',
      type: 'Video Content',
      performance: '92% AI Score',
      date: '2 days ago',
    },
  ]);

  // Function to add new content to recent list
  const addToRecentContent = (content, type) => {
    const newContent = {
      title: prompt.slice(0, 30) + '...',
      type: type,
      performance: '100% AI Score',
      date: 'Just now',
    };
    setRecentContent(prev => [newContent, ...prev.slice(0, 4)]); // Keep last 5 items
  };

  const getPlaceholderText = () => {
    switch (contentType) {
      case 'email':
        return "Describe your email campaign (e.g., 'Create a welcome series for new subscribers highlighting our key products')";
      case 'ad':
        return "Describe your ad campaign (e.g., 'Create compelling ad copy for our summer collection targeting 25-35 year old professionals')";
      case 'video':
        return "Describe your video content (e.g., 'Create a 2-minute product demonstration script highlighting key features')";
      default:
        return "Describe your social media content (e.g., 'Create a social media campaign for our summer collection targeting young professionals')";
    }
  };

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template.id);
    switch (template.name) {
      case 'Email Campaign':
        setContentType('email');
        break;
      case 'Ad Creative':
        setContentType('ad');
        break;
      case 'Video Script':
        setContentType('video');
        break;
      default:
        setContentType('social');
    }
  };

  const handleEmailListUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setEmailData(prev => ({ 
        ...prev, 
        emailList: file,
        loading: false,
        error: null 
      }));
    }
  };

  const generateEmailPreview = async () => {
    try {
      setEmailData(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch('http://localhost:5005/api/email/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `${prompt}\n\nPlease create a marketing email that includes:\n- Engaging subject line\n- Clear message\n- Call to action`,
          campaignType: 'email',
        }),
      });

      if (!response.ok) throw new Error('Failed to generate preview');
      
      const data = await response.json();
      // Ensure the preview content is properly formatted HTML
      const cleanContent = data.content.includes('<html') 
        ? data.content 
        : `<div>${data.content}</div>`;
        
      setEmailData(prev => ({ ...prev, preview: cleanContent }));
      addToRecentContent(cleanContent, 'Email Campaign');

    } catch (error) {
      setEmailData(prev => ({ ...prev, error: error.message }));
    } finally {
      setEmailData(prev => ({ ...prev, loading: false }));
    }
  };

  const sendEmailCampaign = async () => {
    if (!emailData.preview || !emailData.subject) {
      setEmailData(prev => ({ 
        ...prev, 
        error: 'Please generate a preview and provide a subject line before sending.' 
      }));
      return;
    }

    try {
      setEmailData(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch('http://localhost:5005/api/email/campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          subject: emailData.subject,
          campaignType: 'email'
        }),
      });

      if (!response.ok) throw new Error('Failed to send campaign');
      
      // Reset form after successful send
      setPrompt('');
      setEmailData({
        subject: '',
        emailList: null,
        extractedEmails: [],
        preview: null,
        loading: false,
        error: null,
      });

      // Show success message
      alert('Campaign sent successfully to the allowed email addresses!');
    } catch (error) {
      setEmailData(prev => ({ ...prev, error: error.message }));
    } finally {
      setEmailData(prev => ({ ...prev, loading: false }));
    }
  };

  const generateContent = async () => {
    try {
      if (contentType === 'ad') {
        await generateAdVideo();
        return;
      }

      setSocialMediaData(prev => ({ 
        ...prev, 
        loading: true,
        imageLoading: true,
        error: null,
        preview: null
      }));
      setGeneratedImage(null);

      const response = await fetch('http://localhost:5005/api/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          contentType,
          platforms: selectedTemplate === 1 ? ['facebook', 'instagram', 'linkedin'] : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate content');
      
      const data = await response.json();
      
      if (contentType === 'social') {
        setSocialMediaData(prev => ({
          ...prev,
          preview: data.content,
          loading: false
        }));

        // Generate image using HuggingFace
        await generateImageWithHuggingFace();
        
        addToRecentContent(data.content, 'Social Media Post');
      }
    } catch (error) {
      setSocialMediaData(prev => ({ 
        ...prev, 
        error: error.message,
        loading: false,
        imageLoading: false
      }));
      setGeneratedImage(null);
    } finally {
      setSocialMediaData(prev => ({ ...prev, loading: false }));
    }
  };

  // New function to generate image with HuggingFace
  const generateImageWithHuggingFace = async () => {
    try {
      // Generate an image prompt based on the content
      const imagePrompt = `Generate an image for ${socialMediaData.platform} post for best branding based on the following idea: ${prompt}`;
      
      const response = await fetch('http://localhost:5005/api/content/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: imagePrompt,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate image');
      
      const data = await response.json();
      
      // Use the data URL for display
      setGeneratedImage(data.imageData);
      
      // Now also save to a local file via the Flask backend
      try {
        const saveResponse = await fetch('http://127.0.0.1:5000/api/save-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: data.imageData,
            filename: `${Date.now()}_${socialMediaData.platform}_image.jpg`
          }),
        });
        
        if (saveResponse.ok) {
          const saveData = await saveResponse.json();
          // Update the image path for later use when saving to campaigns
          setSocialMediaData(prev => ({
            ...prev,
            imagePath: saveData.imagePath
          }));
        }
      } catch (saveError) {
        console.error('Error saving image to local file:', saveError);
        // We continue using the data URL if saving fails
      }
      
    } catch (error) {
      console.error('Error generating image:', error);
      // Don't set error state here, just log it so text generation can still proceed
    } finally {
      // Mark image loading as complete regardless of success/failure
      setSocialMediaData(prev => ({ ...prev, imageLoading: false }));
    }
  };

  // Add state for advanced options
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState({
    tone: 'professional',
    length: 'medium',
    includeHashtags: true,
  });

  const generateVideoScript = async () => {
    try {
      setVideoData(prev => ({ ...prev, loading: true, error: null }));
      const response = await fetch('http://localhost:5005/api/content/video-script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          advancedOptions: {
            tone: advancedOptions.tone,
            length: advancedOptions.length,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to generate video script');
      
      const data = await response.json();
      setVideoData(prev => ({ 
        ...prev, 
        preview: data.content,
        metadata: data.metadata,
      }));
      addToRecentContent(data.content, 'Video Script');
    } catch (error) {
      setVideoData(prev => ({ ...prev, error: error.message }));
    } finally {
      setVideoData(prev => ({ ...prev, loading: false }));
    }
  };

  // Update the platform click handler
  const handlePlatformChange = (platform) => {
    setSocialMediaData(prev => ({ 
      ...prev, 
      platform
    }));
  };

  // Add save to campaign function
  const handleSaveToCampaign = async () => {
    if (!prompt || !socialMediaData.preview) {
      alert('Please generate content before saving to campaign');
      return;
    }

    try {
      setSocialMediaData(prev => ({ ...prev, savingToCampaign: true }));
      
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to save content');
      }

      // Get the image URL or path
      let imageUrl = null;
      
      // Prefer the local file path if available
      if (socialMediaData.imagePath) {
        imageUrl = socialMediaData.imagePath;
      } else if (generatedImage) {
        // Fall back to data URL if no local path is available
        imageUrl = generatedImage;
      }

      // Create content object with image
      const content = {
        userId: user.uid,
        type: 'social',
        platform: socialMediaData.platform,
        content: socialMediaData.preview,
        prompt: prompt,
        imageUrl: imageUrl,
        createdAt: new Date().toISOString(),
        metadata: {
          tone: advancedOptions.tone,
          length: advancedOptions.length,
          includeHashtags: advancedOptions.includeHashtags
        }
      };

      // Save to Firebase
      const docRef = await addDoc(collection(db, 'content'), content);
      
      // Show success message with document ID
      alert(`Content saved to campaign library! Document ID: ${docRef.id}`);
      
    } catch (error) {
      alert('Error saving to campaign: ' + error.message);
    } finally {
      setSocialMediaData(prev => ({ ...prev, savingToCampaign: false }));
    }
  };

  // Add function to generate video using n8n workflow
  const generateAdVideo = async () => {
    try {
      setAdCreativeData(prev => ({ 
        ...prev, 
        loading: true,
        error: null,
        videoUrl: null
      }));
      
      // Open the n8n form in a popup window
      const formUrl = 'https://jivansh.app.n8n.cloud/form/0020f266-854f-4e74-9658-71156538a583';
      window.open(formUrl, '_blank', 'width=800,height=600');
      
      // Update state to show instructions
      setAdCreativeData(prev => ({
        ...prev,
        loading: false,
        error: "Form opened in a new window. After submitting and getting your video, paste the URL below."
      }));
      
    } catch (error) {
      setAdCreativeData(prev => ({ 
        ...prev, 
        error: error.message,
        loading: false
      }));
    }
  };

  // Simplify the function to just handle manual URL input
  const handleVideoUrlInput = (e) => {
    const url = e.target.value.trim();
    if (url) {
      setAdCreativeData(prev => ({
        ...prev,
        videoUrl: url,
        error: null
      }));
    }
  };

  // Add function to save ad creative to campaign
  const saveAdCreativeToCampaign = async () => {
    if (!prompt || !adCreativeData.videoUrl) {
      alert('Please generate a video before saving to campaign');
      return;
    }

    try {
      setAdCreativeData(prev => ({ ...prev, savingToCampaign: true }));
      
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to save content');
      }

      // Create content object with video URL
      const content = {
        userId: user.uid,
        type: 'ad',
        content: prompt,
        videoUrl: adCreativeData.videoUrl,
        prompt: prompt,
        createdAt: new Date().toISOString(),
        metadata: {
          tone: advancedOptions.tone,
          length: advancedOptions.length
        }
      };

      // Save to Firebase
      const docRef = await addDoc(collection(db, 'content'), content);
      
      // Show success message with document ID
      alert(`Ad Creative saved to campaign library! Document ID: ${docRef.id}`);
      
    } catch (error) {
      alert('Error saving to campaign: ' + error.message);
    } finally {
      setAdCreativeData(prev => ({ ...prev, savingToCampaign: false }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Content Studio</h1>
        <div className="flex gap-2">
          <button className="btn btn-outline">Import Content</button>
          <button className="btn btn-primary">New Content</button>
        </div>
      </div>

      {/* Content Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((template) => (
          <div 
            key={template.id}
            className={`card bg-base-100 shadow-lg cursor-pointer hover:shadow-xl transition-shadow
              ${selectedTemplate === template.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => handleTemplateClick(template)}
          >
            <div className="card-body">
              <template.icon className="w-8 h-8 text-primary" />
              <h3 className="card-title text-lg">{template.name}</h3>
              <p className="text-sm text-base-content/70">{template.description}</p>
              <button className="btn btn-sm btn-outline mt-4">Use Template</button>
            </div>
          </div>
        ))}
      </div>

      {/* AI Content Generator */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">
            <RiMagicLine className="text-primary" />
            AI Content Generator
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">What would you like to create?</span>
              </label>
              <textarea 
                className="textarea textarea-bordered h-24" 
                placeholder={getPlaceholderText()}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              {contentType === 'email' && (
                <>
                  <div className="mt-4">
                    <label className="label">
                      <span className="label-text">Email List</span>
                    </label>
                    <div className="flex flex-col space-y-2">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-base-200 hover:bg-base-300">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <RiFileTextLine className="w-8 h-8 mb-2 text-base-content" />
                          <p className="mb-2 text-sm text-base-content">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-base-content/70">
                            CSV, Excel, or PDF (containing email addresses)
                          </p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept=".csv,.xlsx,.xls,.pdf"
                          onChange={handleEmailListUpload}
                        />
                      </label>
                      {emailData.emailList && (
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center justify-between p-2 bg-success/10 rounded">
                            <span className="text-sm">
                              {emailData.emailList.name}
                            </span>
                            <button 
                              className="btn btn-ghost btn-xs"
                              onClick={() => setEmailData(prev => ({ 
                                ...prev, 
                                emailList: null
                              }))}
                            >
                              Remove
                            </button>
                          </div>
                          <div className="p-2 bg-info/10 rounded">
                            <p className="text-sm">
                              File uploaded successfully. Campaign will be sent to the allowed email addresses.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="label">
                      <span className="label-text">Subject Line</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      placeholder="Enter email subject"
                      value={emailData.subject}
                      onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                </>
              )}
              <label className="label">
                <span className="label-text-alt">AI will optimize the content based on your target audience and goals</span>
              </label>
              <div className="flex gap-2 mt-4">
                {contentType === 'email' ? (
                  <>
                    <button 
                      className={`btn btn-primary ${emailData.loading ? 'loading' : ''}`}
                      onClick={generateEmailPreview}
                      disabled={!prompt || emailData.loading}
                    >
                      Generate Preview
                    </button>
                    {emailData.preview && (
                      <button 
                        className={`btn btn-success ${emailData.loading ? 'loading' : ''}`}
                        onClick={sendEmailCampaign}
                        disabled={!emailData.subject || emailData.loading}
                      >
                        Send Campaign
                      </button>
                    )}
                  </>
                ) : contentType === 'video' ? (
                  <button 
                    className={`btn btn-primary ${videoData.loading ? 'loading' : ''}`}
                    onClick={generateVideoScript}
                    disabled={!prompt || videoData.loading}
                  >
                    Generate Script
                  </button>
                ) : (
                  <>
                    <button 
                      className={`btn btn-primary ${emailData.loading ? 'loading' : ''}`}
                      onClick={generateContent}
                      disabled={!prompt || emailData.loading}
                    >
                      Generate Content
                    </button>
                    <button 
                      className="btn btn-outline"
                      onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    >
                      Advanced Options
                    </button>
                  </>
                )}
              </div>
              {showAdvancedOptions && (
                <div className="mt-4 p-4 bg-base-200 rounded-lg">
                  <h3 className="font-semibold mb-3">Advanced Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Tone</span>
                      </label>
                      <select 
                        className="select select-bordered"
                        value={advancedOptions.tone}
                        onChange={(e) => setAdvancedOptions(prev => ({
                          ...prev,
                          tone: e.target.value
                        }))}
                      >
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="friendly">Friendly</option>
                        <option value="humorous">Humorous</option>
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Content Length</span>
                      </label>
                      <select 
                        className="select select-bordered"
                        value={advancedOptions.length}
                        onChange={(e) => setAdvancedOptions(prev => ({
                          ...prev,
                          length: e.target.value
                        }))}
                      >
                        <option value="short">Short</option>
                        <option value="medium">Medium</option>
                        <option value="long">Long</option>
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Include Hashtags</span>
                      </label>
                      <input 
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={advancedOptions.includeHashtags}
                        onChange={(e) => setAdvancedOptions(prev => ({
                          ...prev,
                          includeHashtags: e.target.checked
                        }))}
                      />
                    </div>
                  </div>
                </div>
              )}
              {emailData.error && (
                <div className="alert alert-error mt-4">
                  <div className="flex-1">
                    <label>{emailData.error}</label>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Section */}
            <div className="space-y-4">
              {contentType === 'email' ? (
                <div className="bg-white rounded-lg p-4 shadow-inner">
                  <h3 className="font-semibold mb-4">Email Campaign Preview</h3>
                  {emailData.preview ? (
                    <div className="max-h-[500px] overflow-y-auto">
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: emailData.preview }}
                      />
                    </div>
                  ) : (
                    <div className="alert alert-info">
                      <div>
                        <h3 className="font-bold">Email Marketing Tips</h3>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                          <li>Subject line optimization</li>
                          <li>Personalization tokens available</li>
                          <li>Mobile-responsive template</li>
                          <li>A/B testing recommended</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ) : contentType === 'social' ? (
                <>
                  <h3 className="font-semibold">Live Platform Previews</h3>
                  <div className="tabs tabs-boxed">
                    <a 
                      className={`tab ${socialMediaData.platform === 'instagram' ? 'tab-active' : ''}`}
                      onClick={() => handlePlatformChange('instagram')}
                    >
                      Instagram
                    </a>
                    <a 
                      className={`tab ${socialMediaData.platform === 'facebook' ? 'tab-active' : ''}`}
                      onClick={() => handlePlatformChange('facebook')}
                    >
                      Facebook
                    </a>
                    <a 
                      className={`tab ${socialMediaData.platform === 'twitter' ? 'tab-active' : ''}`}
                      onClick={() => handlePlatformChange('twitter')}
                    >
                      Twitter
                    </a>
                    <a 
                      className={`tab ${socialMediaData.platform === 'linkedin' ? 'tab-active' : ''}`}
                      onClick={() => handlePlatformChange('linkedin')}
                    >
                      LinkedIn
                    </a>
                  </div>
                  
                  {/* Platform Preview */}
                  <div className="bg-white rounded-lg p-4 shadow-inner max-h-[500px] overflow-y-auto">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary"></div>
                      <div>
                        <p className="font-semibold text-sm">Your Brand</p>
                        <p className="text-xs text-gray-500">Sponsored</p>
                      </div>
                    </div>
                    {socialMediaData.loading || socialMediaData.imageLoading ? (
                      <div className="aspect-square bg-base-200 rounded-lg mb-3 flex flex-col items-center justify-center">
                        <div className="loading loading-spinner loading-lg"></div>
                        <p className="text-sm text-base-content/70 mt-2">
                          {socialMediaData.loading ? "Generating content..." : "Generating image..."}
                        </p>
                      </div>
                    ) : generatedImage && socialMediaData.preview ? (
                      <>
                        <img 
                          src={generatedImage} 
                          alt="Generated post image" 
                          className="w-full aspect-square object-cover rounded-lg mb-3"
                        />
                        <p className="text-sm mb-2">{socialMediaData.preview}</p>
                      </>
                    ) : (
                      <>
                        <div className="aspect-square bg-base-200 rounded-lg mb-3 flex items-center justify-center">
                          <p className="text-sm text-base-content/70">Enter prompt to generate content</p>
                        </div>
                        <p className="text-sm mb-2">✨ Your generated content will appear here</p>
                      </>
                    )}
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>❤️ Like</span>
                      <span>💬 Comment</span>
                      <span>🔄 Share</span>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        className={`btn btn-primary ${socialMediaData.savingToCampaign ? 'loading' : ''}`}
                        onClick={handleSaveToCampaign}
                        disabled={!socialMediaData.preview || !generatedImage || socialMediaData.savingToCampaign || socialMediaData.loading || socialMediaData.imageLoading}
                      >
                        {socialMediaData.savingToCampaign ? 'Saving...' : 'Save to Campaign'}
                      </button>
                    </div>
                  </div>

                  {!socialMediaData.loading && !socialMediaData.error && (
                    <div className="alert alert-info mt-4">
                      <div>
                        <h3 className="font-bold">AI Format Optimization</h3>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                          <li>Optimal image ratio: 1:1 for {socialMediaData.platform} feed posts</li>
                          <li>Recommended hashtags: {socialMediaData.preview ? '#YourBrand #ContentCreation' : 'Generate content to see recommendations'}</li>
                          <li>Best posting time: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {socialMediaData.error && (
                    <div className="alert alert-error mt-4">
                      <div className="flex-1">
                        <label>{socialMediaData.error}</label>
                      </div>
                    </div>
                  )}
                </>
              ) : contentType === 'video' ? (
                <div className="bg-white rounded-lg p-4 shadow-inner">
                  <h3 className="font-semibold mb-4">Video Script Preview</h3>
                  {videoData.preview ? (
                    <div className="space-y-4">
                      <div className="prose max-w-none whitespace-pre-line max-h-[500px] overflow-y-auto">
                        {videoData.preview}
                      </div>
                      {videoData.metadata && (
                        <div className="alert alert-info mt-4">
                          <div>
                            <h3 className="font-bold">Script Details</h3>
                            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                              <li>Estimated Duration: {videoData.metadata.estimatedDuration}</li>
                              <li>Tone: {videoData.metadata.tone}</li>
                              <li>Generated: {new Date(videoData.metadata.generatedAt).toLocaleString()}</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="alert alert-info">
                      <div>
                        <h3 className="font-bold">Video Script Tips</h3>
                        <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                          <li>Start with a strong hook</li>
                          <li>Keep scenes concise and engaging</li>
                          <li>Include clear visual directions</li>
                          <li>End with a compelling call-to-action</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  {videoData.error && (
                    <div className="alert alert-error mt-4">
                      <div className="flex-1">
                        <label>{videoData.error}</label>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4 shadow-inner">
                  <h3 className="font-semibold mb-4">Ad Creative Preview</h3>
                  {adCreativeData.loading ? (
                    <div className="aspect-video bg-base-200 rounded-lg mb-3 flex flex-col items-center justify-center">
                      <div className="loading loading-spinner loading-lg"></div>
                      <p className="text-sm text-base-content/70 mt-2">
                        Opening form...
                      </p>
                    </div>
                  ) : adCreativeData.videoUrl ? (
                    <div className="space-y-4">
                      <video 
                        src={adCreativeData.videoUrl} 
                        controls
                        className="w-full rounded-lg"
                      ></video>
                      <div className="flex justify-end">
                        <button
                          className={`btn btn-primary ${adCreativeData.savingToCampaign ? 'loading' : ''}`}
                          onClick={saveAdCreativeToCampaign}
                          disabled={!adCreativeData.videoUrl || adCreativeData.savingToCampaign}
                        >
                          {adCreativeData.savingToCampaign ? 'Saving...' : 'Save to Campaign'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="alert alert-info">
                        <div>
                          <h3 className="font-bold">Ad Optimization Tips</h3>
                          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                            <li>Enter a prompt and click "Generate Content" to create a video ad</li>
                            <li>Be descriptive in your prompt for better results</li>
                            <li>Videos work best with clear, attention-grabbing concepts</li>
                            <li>Aim for 15-30 second videos for optimal engagement</li>
                          </ul>
                        </div>
                      </div>
                      
                      {/* Manual URL input field */}
                      {adCreativeData.error && (
                        <div className="form-control w-full mt-4">
                          <label className="label">
                            <span className="label-text">Paste Video URL</span>
                          </label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              className="input input-bordered flex-1" 
                              placeholder="Paste the video URL from the n8n workflow here"
                              onChange={handleVideoUrlInput}
                            />
                            <button 
                              className="btn btn-primary"
                              onClick={() => {
                                if (adCreativeData.videoUrl) {
                                  addToRecentContent(prompt, 'Ad Creative Video');
                                }
                              }}
                              disabled={!adCreativeData.videoUrl}
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {adCreativeData.error && (
                    <div className="alert alert-info mt-4">
                      <div className="flex-1">
                        <label>{adCreativeData.error}</label>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Content */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Recent Content</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Performance</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentContent.map((content) => (
                  <tr key={content.title}>
                    <td>{content.title}</td>
                    <td>
                      <span className="badge badge-ghost">{content.type}</span>
                    </td>
                    <td>
                      <span className="text-success">{content.performance}</span>
                    </td>
                    <td>{content.date}</td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-sm btn-ghost">Edit</button>
                        <button className="btn btn-sm btn-ghost">Duplicate</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Writing Assistant */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">AI Writing Assistant</h2>
          <div className="alert alert-info">
            <div>
              <h3 className="font-bold">Writing Suggestions</h3>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Use more action words to increase engagement</li>
                <li>Add social proof to build credibility</li>
                <li>Optimize headline for better click-through rate</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 