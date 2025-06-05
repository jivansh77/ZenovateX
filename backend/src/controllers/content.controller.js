const contentService = require('../services/content.service');

const generateContent = async (req, res) => {
  try {
    const { prompt, contentType, platforms } = req.body;
    const content = await contentService.generateContent(prompt, contentType, platforms);
    res.json(content);
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
};

const generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    console.log('Generating image for prompt:', prompt);
    const imageResult = await contentService.generateImage(prompt);
    res.json(imageResult);
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: `Failed to generate image: ${error.message}` });
  }
};

const generateVideoScript = async (req, res) => {
  try {
    const { prompt, advancedOptions = {} } = req.body;
    const scriptContent = await contentService.generateVideoScript(prompt, advancedOptions);
    res.json(scriptContent);
  } catch (error) {
    console.error('Error generating video script:', error);
    res.status(500).json({ error: 'Failed to generate video script' });
  }
};

const saveContent = async (req, res) => {
  try {
    const contentData = req.body;
    const savedContent = await contentService.saveContent(contentData);
    res.json(savedContent);
  } catch (error) {
    console.error('Error saving content:', error);
    res.status(500).json({ error: error.message });
  }
};

const getAllContent = async (req, res) => {
  try {
    const content = await contentService.getAllContent();
    res.json(content);
  } catch (error) {
    console.error('Error getting content:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generateContent,
  generateImage,
  generateVideoScript,
  saveContent,
  getAllContent
};