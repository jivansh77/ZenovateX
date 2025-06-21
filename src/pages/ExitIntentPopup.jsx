import React from 'react';

const ExitIntentPopup = ({ 
  title, 
  message, 
  backgroundColor, 
  popupWidth, 
  popupPosition,
  onClose 
}) => {
  return (
    <div className="fixed inset-0 z-50">
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      {/* Popup content */}
      <div className={`absolute ${popupPosition}`}>
        <div className={`${backgroundColor} ${popupWidth} p-6 rounded-lg shadow-lg`}>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-center text-lg text-gray-600 mb-6">{message}</p>
          <div className="flex justify-center">
            <button 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={onClose}
            >
              Claim Your Offer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitIntentPopup;