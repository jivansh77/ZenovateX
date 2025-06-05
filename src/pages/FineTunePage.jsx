import { useState } from 'react';
import axios from 'axios';

const FineTunePage = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post('http://localhost:8000/generate', {
        prompt,
        negative_prompt: negativePrompt,
        num_steps: 30,
        guidance_scale: 7.5
      });
      setGeneratedImage(`data:image/png;base64,${response.data.image}`);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Stable Diffusion Image Generation</h1>
      
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Generate Image</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Prompt</label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter your prompt..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Negative Prompt</label>
            <input
              type="text"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter negative prompt..."
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
        </div>
        {generatedImage && (
          <div className="mt-4">
            <img src={generatedImage} alt="Generated" className="max-w-full rounded-lg" />
          </div>
        )}
      </div>
    </div>
  );
};

export default FineTunePage; 