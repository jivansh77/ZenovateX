const { HfInference } = require('@huggingface/inference');
const axios = require('axios');
require('dotenv').config();

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const API_URL = process.env.API_URL || 'http://localhost:5005';
const hf = new HfInference(HUGGINGFACE_API_KEY);

class ContentService {
  async generateCompleteBrandKit(brandName, industry, personality) {
    try {
      console.log('Generating brand kit for:', { brandName, industry, personality });
      
      // Generate all components in parallel
      const [logo, colorPalette, fonts, brandTone, socialTemplates] = await Promise.all([
        this.generateLogo(brandName, industry, personality),
        this.generateColorPalette(industry, personality),
        this.generateFontPairings(personality),
        this.generateBrandTone(brandName, industry, personality),
        this.generateSocialTemplates(brandName)
      ]);

      const result = {
        logo,
        colorPalette,
        fonts,
        brandTone,
        socialTemplates,
        metadata: {
          brandName,
          industry,
          personality,
          generatedAt: new Date().toISOString()
        }
      };

      console.log('Generated brand kit:', result);
      return result;
    } catch (error) {
      console.error('Error in generateCompleteBrandKit:', error);
      throw new Error('Failed to generate complete brand kit');
    }
  }

  async generateLogo(brandName, industry, personality) {
    try {
      const prompt = `Create a modern, minimalist logo for ${brandName}, a ${industry} company with a ${personality} personality. The logo should be simple, memorable, and professional. Vector style, clean design, suitable for business use.`;
      
      console.log('Generating logo with prompt:', prompt);
      
      // Use the generateImage method to create actual logo
      const logoResult = await this.generateImage(prompt);
      return logoResult.imageData;
    } catch (error) {
      console.error('Error generating logo:', error);
      // Fallback to placeholder if image generation fails
      return 'https://via.placeholder.com/400x200?text=Logo+Error';
    }
  }

  async generateColorPalette(industry, personality) {
    try {
      // Default color palettes based on personality
      const colorPalettes = {
        Professional: ['#2C3E50', '#34495E', '#7F8C8D', '#BDC3C7', '#ECF0F1'],
        Friendly: ['#3498DB', '#2980B9', '#5DADE2', '#AED6F1', '#EBF5FB'],
        Innovative: ['#9B59B6', '#8E44AD', '#BB8FCE', '#D7BDE2', '#F4ECF7'],
        Luxurious: ['#2C3E50', '#C0392B', '#E74C3C', '#F1948A', '#FADBD8'],
        Playful: ['#F1C40F', '#F39C12', '#F9E79F', '#FCF3CF', '#FEF9E7'],
        Serious: ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7'],
        Modern: ['#16A085', '#1ABC9C', '#48C9B0', '#A3E4D7', '#D1F2EB'],
        Traditional: ['#8B4513', '#A0522D', '#CD853F', '#DEB887', '#F5DEB3'],
        Bold: ['#C0392B', '#E74C3C', '#F1948A', '#F5B7B1', '#FADBD8'],
        Minimalist: ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7']
      };

      return colorPalettes[personality] || colorPalettes.Professional;
    } catch (error) {
      console.error('Error generating color palette:', error);
      return ['#2C3E50', '#34495E', '#7F8C8D', '#BDC3C7', '#ECF0F1'];
    }
  }

  async generateFontPairings(personality) {
    try {
      // Default font pairings based on personality
      const fontPairings = {
        Professional: [
          { primary: 'Roboto', secondary: 'Open Sans' },
          { primary: 'Montserrat', secondary: 'Lato' },
          { primary: 'Poppins', secondary: 'Inter' }
        ],
        Friendly: [
          { primary: 'Quicksand', secondary: 'Nunito' },
          { primary: 'Comfortaa', secondary: 'Varela Round' },
          { primary: 'Mukta', secondary: 'Work Sans' }
        ],
        Innovative: [
          { primary: 'Space Grotesk', secondary: 'DM Sans' },
          { primary: 'Outfit', secondary: 'Plus Jakarta Sans' },
          { primary: 'Sora', secondary: 'Inter' }
        ],
        Luxurious: [
          { primary: 'Playfair Display', secondary: 'Raleway' },
          { primary: 'Cormorant', secondary: 'Montserrat' },
          { primary: 'Libre Baskerville', secondary: 'Source Sans Pro' }
        ],
        Playful: [
          { primary: 'Fredoka One', secondary: 'Nunito' },
          { primary: 'Bubblegum Sans', secondary: 'Comfortaa' },
          { primary: 'Baloo 2', secondary: 'Quicksand' }
        ],
        Serious: [
          { primary: 'IBM Plex Sans', secondary: 'Inter' },
          { primary: 'Source Sans Pro', secondary: 'Open Sans' },
          { primary: 'Roboto', secondary: 'Lato' }
        ],
        Modern: [
          { primary: 'Space Grotesk', secondary: 'Inter' },
          { primary: 'Outfit', secondary: 'DM Sans' },
          { primary: 'Sora', secondary: 'Plus Jakarta Sans' }
        ],
        Traditional: [
          { primary: 'Merriweather', secondary: 'Source Sans Pro' },
          { primary: 'Playfair Display', secondary: 'Lato' },
          { primary: 'Libre Baskerville', secondary: 'Open Sans' }
        ],
        Bold: [
          { primary: 'Bebas Neue', secondary: 'Roboto' },
          { primary: 'Anton', secondary: 'Open Sans' },
          { primary: 'Oswald', secondary: 'Lato' }
        ],
        Minimalist: [
          { primary: 'Inter', secondary: 'Roboto' },
          { primary: 'DM Sans', secondary: 'Open Sans' },
          { primary: 'Plus Jakarta Sans', secondary: 'Lato' }
        ]
      };

      return fontPairings[personality] || fontPairings.Professional;
    } catch (error) {
      console.error('Error generating font pairings:', error);
      return [
        { primary: 'Roboto', secondary: 'Open Sans' },
        { primary: 'Montserrat', secondary: 'Lato' },
        { primary: 'Poppins', secondary: 'Inter' }
      ];
    }
  }

  async generateBrandTone(brandName, industry, personality) {
    try {
      // Default brand tones based on personality
      const brandTones = {
        Professional: 'Clear, authoritative, and trustworthy communication that builds confidence.',
        Friendly: 'Warm, approachable, and conversational tone that makes everyone feel welcome.',
        Innovative: 'Forward-thinking, dynamic, and cutting-edge communication that inspires.',
        Luxurious: 'Sophisticated, elegant, and premium messaging that conveys exclusivity.',
        Playful: 'Fun, energetic, and engaging tone that brings joy and excitement.',
        Serious: 'Focused, determined, and committed communication that shows dedication.',
        Modern: 'Contemporary, sleek, and progressive messaging that stays ahead of trends.',
        Traditional: 'Timeless, reliable, and established communication that honors heritage.',
        Bold: 'Confident, powerful, and impactful messaging that makes a statement.',
        Minimalist: 'Clean, simple, and focused communication that emphasizes clarity.'
      };

      return brandTones[personality] || brandTones.Professional;
    } catch (error) {
      console.error('Error generating brand tone:', error);
      return 'Professional and engaging communication style.';
    }
  }

  async generateSocialTemplates(brandName) {
    try {
      // Default social media templates
      return {
        instagram: [
          `📸 [Brand Update]\n\nExciting news from ${brandName}! Stay tuned for more updates.\n\n#${brandName.replace(/\s+/g, '')} #brandupdate`,
          `✨ [Product Feature]\n\nDiscover what makes ${brandName} special.\n\n#${brandName.replace(/\s+/g, '')} #productfeature`
        ],
        twitter: [
          `🚀 [News Update]\n\n${brandName} is making waves in the industry!\n\n#${brandName.replace(/\s+/g, '')} #news`,
          `💡 [Industry Insight]\n\nThoughts from ${brandName} on the latest trends.\n\n#${brandName.replace(/\s+/g, '')} #insight`
        ],
        linkedin: [
          `📊 [Industry Analysis]\n\n${brandName} shares insights on market trends.\n\n#${brandName.replace(/\s+/g, '')} #industry`,
          `🎯 [Company Update]\n\nLatest developments from ${brandName}.\n\n#${brandName.replace(/\s+/g, '')} #update`
        ]
      };
    } catch (error) {
      console.error('Error generating social templates:', error);
      return {
        instagram: ['Template 1', 'Template 2'],
        twitter: ['Template 1', 'Template 2'],
        linkedin: ['Template 1', 'Template 2']
      };
    }
  }

  async generateContent(prompt, contentType, platforms) {
    try {
      // Implementation for general content generation
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3',
        { inputs: `<s>[INST] Generate ${contentType} content for the following prompt:
${prompt} [/INST]</s>` },
        {
          headers: {
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        content: response.data[0].generated_text
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
      
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3',
        { inputs: `<s>[INST] Write a professional video script that is ${length} in length and uses a ${tone} tone. The script should be for: ${prompt}

Format the response as a proper video script with:
- Timestamps for each section
- Camera directions in [brackets]
- Scene descriptions and transitions
- Clear sections for Opening, Introduction, Main Content, and Closing [/INST]</s>` },
        {
          headers: {
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const scriptContent = response.data[0].generated_text
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