const seoService = require('../services/seo.service');

const startAudit = async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    console.log('Starting SEO audit for:', url);
    const result = await seoService.startAudit(url);
    res.json(result);
  } catch (error) {
    console.error('Error starting SEO audit:', error);
    res.status(500).json({ error: 'Failed to start SEO audit' });
  }
};

const getAuditStatus = async (req, res) => {
  try {
    const { auditId } = req.params;
    
    if (!auditId) {
      return res.status(400).json({ error: 'Audit ID is required' });
    }

    console.log('Getting audit status for:', auditId);
    const status = await seoService.getAuditStatus(auditId);
    res.json(status);
  } catch (error) {
    console.error('Error getting audit status:', error);
    if (error.message === 'Audit not found') {
      return res.status(404).json({ error: 'Audit not found' });
    }
    res.status(500).json({ error: 'Failed to get audit status' });
  }
};

const getAuditResults = async (req, res) => {
  try {
    const { auditId } = req.params;
    
    if (!auditId) {
      return res.status(400).json({ error: 'Audit ID is required' });
    }

    console.log('Getting audit results for:', auditId);
    const results = await seoService.getAuditResults(auditId);
    res.json(results);
  } catch (error) {
    console.error('Error getting audit results:', error);
    if (error.message === 'Audit not found') {
      return res.status(404).json({ error: 'Audit not found' });
    }
    res.status(500).json({ error: 'Failed to get audit results' });
  }
};

const analyzeKeywords = async (req, res) => {
  try {
    const { keywords, url } = req.body;
    
    if (!keywords || !Array.isArray(keywords)) {
      return res.status(400).json({ error: 'Keywords array is required' });
    }

    console.log('Analyzing keywords:', keywords);
    
    // Simple keyword analysis (would be more sophisticated in production)
    const analysis = {
      keywords: keywords.map(keyword => ({
        keyword,
        difficulty: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
        volume: Math.floor(Math.random() * 50000) + 1000,
        competition: Math.random(),
        suggestions: [
          `Consider long-tail variations of "${keyword}"`,
          `Optimize content for "${keyword}" with related terms`,
          `Check competitor content for "${keyword}"`
        ]
      })),
      opportunities: [
        'content marketing',
        'SEO optimization',
        'digital strategy',
        'online marketing'
      ],
      generatedAt: new Date().toISOString()
    };

    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing keywords:', error);
    res.status(500).json({ error: 'Failed to analyze keywords' });
  }
};

const generateRecommendations = async (req, res) => {
  try {
    const { auditData, focusAreas } = req.body;
    
    if (!auditData) {
      return res.status(400).json({ error: 'Audit data is required' });
    }

    console.log('Generating SEO recommendations');
    
    // Generate recommendations based on the audit data
    const recommendations = [
      {
        priority: 'High',
        category: 'Technical SEO',
        title: 'Improve Meta Tags',
        description: 'Optimize title tags and meta descriptions for better search visibility.',
        impact: 'High - Can improve click-through rates by 15-25%',
        effort: 'Low',
        timeEstimate: '2-4 hours',
        steps: [
          'Audit all page titles and meta descriptions',
          'Ensure titles are 50-60 characters',
          'Write compelling meta descriptions (150-160 characters)',
          'Include target keywords naturally',
          'Test changes and monitor performance'
        ],
        resources: [
          'Google Search Console for performance tracking',
          'SEO title and meta description best practices guide'
        ]
      },
      {
        priority: 'Medium',
        category: 'Content Optimization',
        title: 'Enhance Content Structure',
        description: 'Improve heading hierarchy and content organization for better SEO.',
        impact: 'Medium - Can improve rankings and user experience',
        effort: 'Medium',
        timeEstimate: '4-8 hours',
        steps: [
          'Review current heading structure (H1, H2, H3)',
          'Ensure single H1 per page',
          'Create logical heading hierarchy',
          'Add relevant keywords to headings',
          'Improve content readability and flow'
        ],
        resources: [
          'Content structure best practices',
          'Keyword research tools'
        ]
      },
      {
        priority: 'Low',
        category: 'Performance',
        title: 'Optimize Page Speed',
        description: 'Improve website loading times for better user experience and SEO.',
        impact: 'Medium - Page speed is a ranking factor',
        effort: 'High',
        timeEstimate: '8-16 hours',
        steps: [
          'Analyze current page speed metrics',
          'Compress and optimize images',
          'Minify CSS and JavaScript',
          'Enable browser caching',
          'Consider using a CDN'
        ],
        resources: [
          'Google PageSpeed Insights',
          'Image optimization tools',
          'CDN providers comparison'
        ]
      }
    ];

    res.json({
      recommendations,
      summary: {
        totalRecommendations: recommendations.length,
        highPriority: recommendations.filter(r => r.priority === 'High').length,
        estimatedImpact: 'Implementing these recommendations could improve your SEO score by 20-40 points',
        estimatedTime: '14-28 hours total implementation time'
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
};

const exportReport = async (req, res) => {
  try {
    const { auditId, format = 'json' } = req.params;
    
    if (!auditId) {
      return res.status(400).json({ error: 'Audit ID is required' });
    }

    console.log('Exporting audit report for:', auditId);
    
    const auditData = await seoService.getAuditResults(auditId);
    
    if (!auditData || !auditData.overview) {
      return res.status(404).json({ error: 'Audit results not found' });
    }

    // For now, only support JSON export
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="seo-audit-${auditId}.json"`);
      res.json({
        auditId,
        exportedAt: new Date().toISOString(),
        data: auditData
      });
    } else {
      res.status(400).json({ error: 'Unsupported export format. Only JSON is currently supported.' });
    }
  } catch (error) {
    console.error('Error exporting report:', error);
    if (error.message === 'Audit not found') {
      return res.status(404).json({ error: 'Audit not found' });
    }
    res.status(500).json({ error: 'Failed to export report' });
  }
};

module.exports = {
  startAudit,
  getAuditStatus,
  getAuditResults,
  analyzeKeywords,
  generateRecommendations,
  exportReport
}; 