import { useState } from 'react';

const TweetPoster = () => {
  const [tweetText, setTweetText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedImage || !tweetText.trim()) {
      setMessage('Please provide both text and image');
      return;
    }

    setIsLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('text', tweetText);
    formData.append('image', selectedImage);

    try {
      const response = await fetch('http://localhost:5000/api/tweet', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Tweet posted successfully!');
        setTweetText('');
        setSelectedImage(null);
        setPreview(null);
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('Error connecting to server. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Post a Tweet</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tweet Text Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tweet Text
          </label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="What's happening?"
            value={tweetText}
            onChange={(e) => setTweetText(e.target.value)}
            maxLength={280}
          ></textarea>
          <p className="mt-1 text-sm text-gray-500">{tweetText.length}/280</p>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose an image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Image Preview */}
        {preview && (
          <div className="w-full max-w-xs mx-auto">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Status Message */}
        {message && (
          <div className={`p-4 rounded-md ${
            message.includes('Error') 
              ? 'bg-red-50 text-red-700' 
              : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading ? 'opacity-75 cursor-not-allowed' : ''
          }`}
          disabled={isLoading || !tweetText.trim() || !selectedImage}
        >
          {isLoading ? 'Posting...' : 'Post Tweet'}
        </button>
      </form>
    </div>
  );
};

export default TweetPoster;