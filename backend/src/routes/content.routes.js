const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');

// Content generation routes
router.post('/generate', contentController.generateContent);
router.post('/generate-image', contentController.generateImage);
router.post('/video-script', contentController.generateVideoScript);

// Content management routes
router.post('/save', contentController.saveContent);
router.get('/', contentController.getAllContent);

module.exports = router; 