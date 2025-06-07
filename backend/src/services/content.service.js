const { HfInference } = require('@huggingface/inference');
const dotenv = require('dotenv');

dotenv.config();

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

class ContentService {
  async generateContent(prompt, contentType, platforms) {
    try {
      // Implementation for general content generation
      const response = await hf.textGeneration({
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        inputs: `<s>[INST] Generate ${contentType} content for the following prompt:
${prompt} [/INST]</s>`,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
          repetition_penalty: 1.15
        }
      });

      return {
        content: response.generated_text
          .replace(/^.*?\[\/INST\]\s*/s, '')
          .replace(/<s>|<\/s>/g, '')
          .trim(),
        metadata: {
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error generating content:', error);
      throw new Error('Failed to generate content');
    }
  }

  async generateImage(prompt) {
    try {
      console.log('Generating image for prompt:', prompt);
      
      // Generate an image using FLUX.1-schnell model
      const imageBlob = await hf.textToImage({
        model: "black-forest-labs/FLUX.1-dev",
        inputs: prompt,
        parameters: {
          negative_prompt: "blurry, distorted, low quality, duplicate",
          guidance_scale: 7.5,
          num_inference_steps: 30
        }
      });
      
      // Convert blob to base64 for sending to frontend
      const arrayBuffer = await imageBlob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;
      
      return {
        imageData: base64Image,
        metadata: {
          model: "FLUX.1-dev",
          prompt: prompt,
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error(`Failed to generate image: ${error.message}`);
    }
  }

  async generateVideoScript(prompt, advancedOptions = {}) {
    try {
      const { tone = 'professional', length = 'medium' } = advancedOptions;
      
      const response = await hf.textGeneration({
        model: "mistralai/Mistral-7B-Instruct-v0.3",
        inputs: `<s>[INST] Write a professional video script that is ${length} in length and uses a ${tone} tone. The script should be for: ${prompt}

Format the response as a proper video script with:
- Timestamps for each section
- Camera directions in [brackets]
- Scene descriptions and transitions
- Clear sections for Opening, Introduction, Main Content, and Closing [/INST]</s>`,
        parameters: {
          max_new_tokens: 800,
          temperature: 0.7,
          top_p: 0.95,
          repetition_penalty: 1.15
        }
      });

      const scriptContent = response.generated_text
        .replace(/^.*?\[\/INST\]\s*/s, '')
        .replace(/<s>|<\/s>/g, '')
        .trim();

      return {
        content: scriptContent,
        metadata: {
          estimatedDuration: length === 'short' ? '1-2 minutes' : length === 'medium' ? '2-5 minutes' : '5+ minutes',
          tone: tone,
          generatedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error generating video script:', error);
      throw new Error('Failed to generate video script');
    }
  }

  async saveContent(contentData) {
    // Implementation for saving content to database
    // This can be implemented later when needed
    return contentData;
  }

  async getAllContent() {
    // Implementation for retrieving all content
    // This can be implemented later when needed
    return [];
  }
}

module.exports = new ContentService();