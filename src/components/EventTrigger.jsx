import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const TrendingEventModal = ({ event, closeModal }) => {
  const navigate = useNavigate();
  if (!event) return null;

  const handleCreateContent = () => {
    navigate(`/campaign-builder/template?eventId=${event.id}`);
    closeModal();
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="card w-96 bg-primary text-primary-content shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-start">
            <h2 className="card-title">{event.title}</h2>
            <button 
              onClick={closeModal}
              className="btn btn-circle btn-sm btn-ghost"
            >
              ✕
            </button>
          </div>
          <p>{event.description}</p>
          <div className="card-actions justify-end">
            <button 
              className="btn btn-secondary"
              onClick={handleCreateContent}
            >
              Create Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EventTrigger = () => {
  const [eventData, setEventData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 5;

  const fetchTrendingEvent = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/trending-events/");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.length > 0) {
        setEventData(data[0]); // Get the first event (highest trending score)
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching trending events:", error);
      // Retry if server might not be ready yet
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 2000); // Wait 2 seconds before retrying
      }
    }
  };

  useEffect(() => {
    // Initial delay to allow server to start
    const initialDelay = setTimeout(() => {
      fetchTrendingEvent();
    }, 3000);

    return () => clearTimeout(initialDelay);
  }, []); // Run once on mount

  useEffect(() => {
    // Retry effect
    if (retryCount > 0) {
      fetchTrendingEvent();
    }
  }, [retryCount]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {isModalOpen && (
        <TrendingEventModal event={eventData} closeModal={closeModal} />
      )}
    </>
  );
};

export default EventTrigger;
