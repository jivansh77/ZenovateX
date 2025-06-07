const express = require('express');
const router = express.Router();
const seoController = require('../controllers/seo.controller');

// Core SEO audit routes
router.post('/audit', seoController.startAudit);
router.get('/audit/:auditId', seoController.getAuditResults);
router.get('/audit/:auditId/status', seoController.getAuditStatus);

// Additional SEO analysis routes
router.post('/keywords', seoController.analyzeKeywords);
router.post('/recommendations', seoController.generateRecommendations);

// Export functionality
router.get('/export/:auditId/:format?', seoController.exportReport);

module.exports = router; 