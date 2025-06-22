import React from 'react';
import { Download } from 'lucide-react';

const LogoDisplay = ({ logo, loading, brandName }) => {
  const downloadLogo = () => {
    if (!logo || !logo.imageData) return;
    
    const link = document.createElement('a');
    link.href = logo.imageData;
    link.download = `${brandName || 'brand'}-logo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton w-full h-48 rounded-lg flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
        <div className="text-center opacity-50">Generating your logo...</div>
      </div>
    );
  }

  if (!logo || !logo.imageData) {
    return (
      <div className="w-full h-48 bg-base-200 rounded-lg flex items-center justify-center border-2 border-dashed border-base-300">
        <div className="text-center opacity-50">
          <div className="text-4xl mb-2">🎨</div>
          <p>Your logo will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative group">
        <img
          src={logo.imageData}
          alt={`${brandName} Logo`}
          className="w-full h-48 object-contain bg-base-200 rounded-lg border"
        />
        
        {/* Download Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={downloadLogo}
            className="btn btn-neutral btn-sm gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Logo Details */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Format:</span>
          <div className="badge badge-outline">PNG</div>
        </div>
        
        {logo.prompt && (
          <div className="alert">
            <div className="text-xs">
              <strong>Generated with:</strong> {logo.prompt}
            </div>
          </div>
        )}
      </div>

      {/* Download Button */}
      <button
        onClick={downloadLogo}
        className="btn btn-primary w-full gap-2"
      >
        <Download className="w-4 h-4" />
        Download Logo
      </button>
    </div>
  );
};

export default LogoDisplay;