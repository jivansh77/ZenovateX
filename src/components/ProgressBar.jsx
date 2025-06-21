import React from 'react';

export default function ProgressBar({ progress, status }) {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-base font-medium">{status}</span>
        <span className="text-sm font-medium">{progress}%</span>
      </div>
      <progress 
        className="progress progress-primary w-full" 
        value={progress} 
        max="100"
      ></progress>
    </div>
  );
} 