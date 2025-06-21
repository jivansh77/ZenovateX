import React, { useState } from 'react';
import { usePollinationsImage } from '@pollinations/react';

const ImageGenerator = () => {
  const [userIdea, setUserIdea] = useState('');
  const imagePrompt = `Generate an image for instagram post for best branding based on the following idea: ${userIdea}`;
  
  // Use the hook with the generated prompt
  const imageUrl = usePollinationsImage(imagePrompt, {
    width: 512,
    height: 512,
    seed: 220532,
    model: 'flux',
  });

  const handleInputChange = (e) => {
    setUserIdea(e.target.value);
  };

  const handleGenerateImage = () => {
    if (userIdea.trim()) {
      // Ensure there's an idea entered by the user
      setUserIdea(userIdea);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Describe your post..."
        value={userIdea}
        onChange={handleInputChange}
        style={{ width: '100%', padding: '10px', marginBottom: '10px', fontSize: '16px' }}
      />
      <button onClick={handleGenerateImage} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Generate Image
      </button>
      <div>
        {imageUrl ? (
          <img src={imageUrl} alt="Generated Image" style={{ width: '100%', maxWidth: '512px', height: 'auto', marginTop: '20px' }} />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
