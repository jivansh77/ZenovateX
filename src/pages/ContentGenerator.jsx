import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const ContentGenerator = () => {
  const [eventData, setEventData] = useState(null);
  const [error, setError] = useState(null);
  const [generatedContent, setGeneratedContent] = useState({
    socialMedia: '',
    videoScript: ''
  });
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const eventId = searchParams.get('eventId');
    if (eventId) {
      fetchEventData(eventId);
    } else {
      setError('No event ID provided');
    }
  }, [location]);

  const fetchEventData = async (eventId) => {
    try {
      setError(null);
      setLoading(true);
      console.log('Fetching event data for ID:', eventId);
      
      const response = await fetch(`${API_BASE_URL}/trending-events/${eventId}/`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Event fetch error response:', errorData);
        throw new Error(errorData.error || `Failed to fetch event data (Status: ${response.status})`);
      }
      
      const data = await response.json();
      console.log('Fetched event data:', data);
      
      if (!data.title || !data.description) {
        throw new Error('Invalid event data received');
      }
      
      setEventData(data);
      await generateContent(data);
    } catch (error) {
      console.error('Error fetching event data:', error);
      setError(error.message || 'Failed to load event data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async (event) => {
    try {
      setError(null);
      setLoading(true);
      console.log('Generating content for event:', event);

      const response = await fetch(`${API_BASE_URL}/generate-content/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          event: {
            title: event.title,
            description: event.description
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Content generation error response:', errorData);
        throw new Error(errorData.error || `Failed to generate content (Status: ${response.status})`);
      }

      const data = await response.json();
      console.log('Generated content:', data);
      
      if (!data.socialMedia || !data.videoScript) {
        throw new Error('Invalid content received from server');
      }

      setGeneratedContent(data);
    } catch (error) {
      console.error('Error generating content:', error);
      setError(error.message || 'Failed to generate content. Please try again later.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (eventData) {
      try {
        setError(null);
        await generateContent(eventData);
      } catch (error) {
        // Error is already handled in generateContent
        console.log('Retry failed');
      }
    }
  };

  const handleSaveToCampaign = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('You must be logged in to save content');
      }

      if (!generatedContent.socialMedia || !generatedContent.videoScript) {
        throw new Error('No content to save');
      }

      // Save social media content
      await addDoc(collection(db, 'content'), {
        userId: user.uid,
        type: 'social',
        content: generatedContent.socialMedia,
        platform: 'multiple',
        createdAt: new Date().toISOString(),
        eventTitle: eventData.title,
        eventDescription: eventData.description
      });

      // Save video content
      await addDoc(collection(db, 'content'), {
        userId: user.uid,
        type: 'video',
        title: `Video for ${eventData.title}`,
        script: generatedContent.videoScript,
        createdAt: new Date().toISOString(),
        eventTitle: eventData.title,
        eventDescription: eventData.description
      });

      // Show success message or handle UI feedback
      alert('Content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      setError(error.message || 'Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="alert alert-error mb-4 max-w-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
        <div className="flex gap-4">
          <button 
            className="btn btn-primary" 
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
          {eventData && (
            <button 
              className="btn btn-secondary" 
              onClick={handleRetry}
            >
              Retry Generation
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!eventData || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Content Generator</h1>
        <div className="flex gap-4">
          <button 
            className="btn btn-outline btn-primary"
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleRetry}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Generating...
              </>
            ) : (
              'Regenerate Content'
            )}
          </button>
          <button 
            className="btn btn-success"
            onClick={handleSaveToCampaign}
            disabled={loading || !generatedContent.socialMedia || !generatedContent.videoScript}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Saving...
              </>
            ) : (
              'Save to Campaign'
            )}
          </button>
        </div>
      </div>
      
      <div className="bg-base-200 p-4 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-2">Event Details</h2>
        <p className="text-lg">{eventData.title}</p>
        <p className="text-gray-600">{eventData.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Social Media Posts</h2>
            <div className="divider"></div>
            <pre className="whitespace-pre-wrap">{generatedContent.socialMedia}</pre>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Video Script</h2>
            <div className="divider"></div>
            <pre className="whitespace-pre-wrap">{generatedContent.videoScript}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentGenerator; 