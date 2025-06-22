const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const emailRoutes = require('./routes/email.routes');
const contentRoutes = require('./routes/content.routes');
const seoRoutes = require('./routes/seo.routes');
const contentService = require('./services/content.service');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Routes
app.use('/api/email', emailRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/seo', seoRoutes);

// Brand Kit Routes
app.post('/api/brand-kit/generate-complete', async (req, res) => {
  try {
    const { brandName, industry, personality } = req.body;
    console.log('Received request:', { brandName, industry, personality });
    const result = await contentService.generateCompleteBrandKit(brandName, industry, personality);
    res.json(result);
  } catch (error) {
    console.error('Error in generate-complete:', error);
    res.status(500).json({ message: error.message || 'Failed to generate brand kit' });
  }
});

app.post('/api/brand-kit/generate-logo', async (req, res) => {
  try {
    const { brandName, industry, personality } = req.body;
    const result = await contentService.generateLogo(brandName, industry, personality);
    res.json(result);
  } catch (error) {
    console.error('Error in generate-logo:', error);
    res.status(500).json({ message: error.message || 'Failed to generate logo' });
  }
});

app.post('/api/brand-kit/generate-colors', async (req, res) => {
  try {
    const { industry, personality } = req.body;
    const result = await contentService.generateColorPalette(industry, personality);
    res.json(result);
  } catch (error) {
    console.error('Error in generate-colors:', error);
    res.status(500).json({ message: error.message || 'Failed to generate color palette' });
  }
});

app.post('/api/brand-kit/generate-fonts', async (req, res) => {
  try {
    const { personality } = req.body;
    const result = await contentService.generateFontPairings(personality);
    res.json(result);
  } catch (error) {
    console.error('Error in generate-fonts:', error);
    res.status(500).json({ message: error.message || 'Failed to generate font pairings' });
  }
});

app.post('/api/brand-kit/generate-tone', async (req, res) => {
  try {
    const { brandName, industry, personality } = req.body;
    const result = await contentService.generateBrandTone(brandName, industry, personality);
    res.json(result);
  } catch (error) {
    console.error('Error in generate-tone:', error);
    res.status(500).json({ message: error.message || 'Failed to generate brand tone' });
  }
});

app.post('/api/brand-kit/generate-templates', async (req, res) => {
  try {
    const { brandName, colorPalette, fonts } = req.body;
    const result = await contentService.generateSocialTemplates(brandName, colorPalette, fonts);
    res.json(result);
  } catch (error) {
    console.error('Error in generate-templates:', error);
    res.status(500).json({ message: error.message || 'Failed to generate social templates' });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the server at: http://localhost:${PORT}/api/test`);
}); 