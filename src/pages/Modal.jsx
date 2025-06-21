import React, { useState } from 'react';

const Modal = ({ code, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Generated Code</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        <pre className="bg-gray-100 p-4 rounded mb-4 overflow-auto max-h-96">
          <code className="text-sm whitespace-pre-wrap">{code}</code>
        </pre>
        <div className="flex justify-between items-center">
          <button
            onClick={handleCopy}
            className={`${
              copied ? 'bg-green-600' : 'bg-blue-600'
            } text-white py-2 px-4 rounded hover:opacity-90 transition-colors`}
          >
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;