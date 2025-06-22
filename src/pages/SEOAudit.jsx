import { useState, useEffect } from 'react';
import { 
  RiSearchLine, 
  RiBarChartBoxLine, 
  RiSpeedUpLine, 
  RiLinkM, 
  RiImageLine, 
  RiFileTextLine,
  RiLightbulbLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiAlarmWarningLine,
  RiDownloadLine,
  RiRefreshLine,
  RiGlobalLine,
  RiSmartphoneLine,
  RiKeyboardLine,
  RiSeoLine
} from 'react-icons/ri';

export default function SEOAudit() {
  const [auditData, setAuditData] = useState({
    url: '',
    loading: false,
    error: null,
    progress: 0,
    currentStep: '',
    results: null,
    auditId: null
  });

  const [selectedCategory, setSelectedCategory] = useState('overview');
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [expandedStep, setExpandedStep] = useState(null);

  // Sample audit results structure for UI development
  const sampleResults = {
    overview: {
      score: 75,
      totalIssues: 12,
      criticalIssues: 3,
      warnings: 5,
      suggestions: 4,
      lastAudited: new Date().toISOString()
    },
    technical: {
      score: 68,
      issues: [
        {
          type: 'critical',
          title: 'Missing Meta Description',
          description: 'Your page is missing a meta description tag',
          impact: 'High',
          fix: 'Add a meta description tag between 150-160 characters',
          example: '<meta name="description" content="Your compelling page description here">'
        },
        {
          type: 'warning',
          title: 'Large Image Sizes',
          description: '5 images are larger than recommended size',
          impact: 'Medium',
          fix: 'Optimize images to reduce file size by 60%',
          example: 'Use WebP format and compress images to under 100KB'
        },
        {
          type: 'suggestion',
          title: 'Missing Alt Tags',
          description: '3 images missing alt text',
          impact: 'Low',
          fix: 'Add descriptive alt text to all images',
          example: '<img src="..." alt="Descriptive text about the image">'
        }
      ]
    },
    performance: {
      score: 82,
      metrics: {
        pageSpeed: 3.2,
        mobileSpeed: 4.1,
        firstContentfulPaint: '1.8s',
        largestContentfulPaint: '2.4s',
        cumulativeLayoutShift: '0.12'
      },
      opportunities: [
        'Reduce server response time',
        'Optimize images',
        'Minify CSS and JavaScript'
      ]
    },
    content: {
      score: 71,
      analysis: {
        titleTag: {
          present: true,
          length: 42,
          optimal: false,
          suggestion: 'Extend title to 50-60 characters for better SEO'
        },
        headings: {
          h1Count: 1,
          h2Count: 3,
          structure: 'good',
          issues: ['Missing H2 after first H1']
        },
        keywordDensity: {
          primary: 2.3,
          optimal: false,
          suggestion: 'Increase primary keyword density to 3-5%'
        },
        wordCount: 850,
        readability: 'Good'
      }
    },
    keywords: {
      score: 69,
      primary: 'digital marketing',
      density: 2.3,
      opportunities: [
        'content marketing',
        'SEO optimization', 
        'digital strategy',
        'online marketing'
      ],
      competitors: [
        { keyword: 'digital marketing', difficulty: 'Medium', volume: '12,000' },
        { keyword: 'content strategy', difficulty: 'Low', volume: '3,400' },
        { keyword: 'SEO tips', difficulty: 'High', volume: '8,900' }
      ]
    },
    recommendations: [
      {
        priority: 'High',
        category: 'Technical SEO',
        title: 'Add Meta Description',
        description: 'Your page is missing a meta description which is crucial for search engine rankings and click-through rates.',
        impact: 'Will improve click-through rates by up to 15%',
        effort: 'Low',
        steps: [
          'Open your HTML editor',
          'Add meta description tag in the <head> section',
          'Keep it between 150-160 characters',
          'Include your primary keyword naturally'
        ]
      },
      {
        priority: 'Medium',
        category: 'Performance',
        title: 'Optimize Images',
        description: 'Large image files are slowing down your page load time significantly.',
        impact: 'Will improve page speed by 2-3 seconds',
        effort: 'Medium',
        steps: [
          'Compress images using tools like TinyPNG',
          'Convert to WebP format for better compression',
          'Implement lazy loading for below-fold images',
          'Use responsive images with srcset attribute'
        ]
      },
      {
        priority: 'Low',
        category: 'Content',
        title: 'Improve Keyword Density',
        description: 'Your primary keyword density is below optimal range.',
        impact: 'May improve rankings for target keywords',
        effort: 'Low',
        steps: [
          'Naturally include primary keyword 2-3 more times',
          'Add keyword to H2 headings where relevant',
          'Include semantic variations in content',
          'Ensure keyword appears in first paragraph'
        ]
      }
    ]
  };

  const auditSteps = [
    'Crawling website...',
    'Analyzing technical SEO...',
    'Checking page performance...',
    'Evaluating content quality...',
    'Analyzing keywords...',
    'Generating AI recommendations...',
    'Finalizing audit report...'
  ];

  const categories = [
    { id: 'overview', name: 'Overview', icon: RiBarChartBoxLine },
    { id: 'technical', name: 'Technical SEO', icon: RiSeoLine },
    { id: 'performance', name: 'Performance', icon: RiSpeedUpLine },
    { id: 'content', name: 'Content', icon: RiFileTextLine },
    { id: 'keywords', name: 'Keywords', icon: RiKeyboardLine },
    { id: 'recommendations', name: 'AI Recommendations', icon: RiLightbulbLine }
  ];

  const handleAuditSubmit = async (e) => {
    e.preventDefault();
    
    if (!auditData.url) {
      setAuditData(prev => ({ ...prev, error: 'Please enter a valid URL' }));
      return;
    }

    // URL validation
    try {
      new URL(auditData.url);
    } catch {
      setAuditData(prev => ({ ...prev, error: 'Please enter a valid URL (including http:// or https://)' }));
      return;
    }

    setAuditData(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      progress: 0,
      currentStep: 'Starting audit...'
    }));

    try {
      // Start the audit
      const response = await fetch('http://localhost:5005/api/seo/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: auditData.url }),
      });

      if (!response.ok) {
        throw new Error('Failed to start audit');
      }

      const { auditId } = await response.json();
      
      setAuditData(prev => ({
        ...prev,
        auditId,
        currentStep: 'Audit started...'
      }));

      // Poll for audit progress
      await pollAuditProgress(auditId);

    } catch (error) {
      console.error('Error starting audit:', error);
      setAuditData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to start audit'
      }));
    }
  };

  const pollAuditProgress = async (auditId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:5005/api/seo/audit/${auditId}/status`);
        
        if (!response.ok) {
          throw new Error('Failed to get audit status');
        }

        const status = await response.json();
        
        setAuditData(prev => ({
          ...prev,
          progress: status.progress,
          currentStep: status.currentStep
        }));

        // Check if audit is completed
        if (status.status === 'completed') {
          clearInterval(pollInterval);
          
          // Get the final results
          const resultsResponse = await fetch(`http://localhost:5005/api/seo/audit/${auditId}`);
          if (resultsResponse.ok) {
            const results = await resultsResponse.json();
            setAuditData(prev => ({
              ...prev,
              loading: false,
              results: results
            }));
          } else {
            throw new Error('Failed to get audit results');
          }
        } else if (status.status === 'failed') {
          clearInterval(pollInterval);
          throw new Error(status.error || 'Audit failed');
        }

      } catch (error) {
        clearInterval(pollInterval);
        console.error('Error polling audit status:', error);
        setAuditData(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Failed to get audit status'
        }));
      }
    }, 2000); // Poll every 2 seconds

    // Set a timeout to prevent infinite polling
    setTimeout(() => {
      clearInterval(pollInterval);
      if (auditData.loading) {
        setAuditData(prev => ({
          ...prev,
          loading: false,
          error: 'Audit timeout - please try again'
        }));
      }
    }, 120000); // 2 minutes timeout
  };

  const getIssueIcon = (type) => {
    switch (type) {
      case 'critical':
        return <RiErrorWarningLine className="w-5 h-5 text-error" />;
      case 'warning':
        return <RiAlarmWarningLine className="w-5 h-5 text-warning" />;
      default:
        return <RiLightbulbLine className="w-5 h-5 text-info" />;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'badge-error';
      case 'medium':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  const exportAuditReport = async () => {
    if (!auditData.auditId) {
      alert('No audit data available to export');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5005/api/seo/export/${auditData.auditId}/json`);
      
      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      // Trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `seo-audit-${auditData.auditId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report: ' + error.message);
    }
  };

  const renderCategoryContent = () => {
    if (!auditData.results) return null;

    switch (selectedCategory) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/70">Overall Score</p>
                      <p className={`text-3xl font-bold mt-1 ${getScoreColor(auditData.results.overview.score)}`}>
                        {auditData.results.overview.score}/100
                      </p>
                    </div>
                    <div className="rounded-full p-3 bg-primary/10">
                      <RiBarChartBoxLine className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/70">Critical Issues</p>
                      <p className="text-3xl font-bold mt-1 text-error">
                        {auditData.results.overview.criticalIssues}
                      </p>
                    </div>
                    <div className="rounded-full p-3 bg-error/10">
                      <RiErrorWarningLine className="w-6 h-6 text-error" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/70">Warnings</p>
                      <p className="text-3xl font-bold mt-1 text-warning">
                        {auditData.results.overview.warnings}
                      </p>
                    </div>
                    <div className="rounded-full p-3 bg-warning/10">
                      <RiAlarmWarningLine className="w-6 h-6 text-warning" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/70">Suggestions</p>
                      <p className="text-3xl font-bold mt-1 text-info">
                        {auditData.results.overview.suggestions}
                      </p>
                    </div>
                    <div className="rounded-full p-3 bg-info/10">
                      <RiLightbulbLine className="w-6 h-6 text-info" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Scores */}
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title mb-4">Category Breakdown</h3>
                <div className="space-y-4">
                  {Object.entries(auditData.results).filter(([key]) => key !== 'overview' && key !== 'recommendations').map(([category, data]) => (
                    <div key={category} className="flex items-center gap-4">
                      <div className="w-24">
                        <span className="text-sm font-medium capitalize">{category}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className={`text-sm font-bold ${getScoreColor(data.score)}`}>
                            {data.score}/100
                          </span>
                        </div>
                        <div className="w-full bg-base-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${data.score >= 80 ? 'bg-success' : data.score >= 60 ? 'bg-warning' : 'bg-error'}`}
                            style={{ width: `${data.score}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'technical':
        return (
          <div className="space-y-6">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">Technical SEO Issues</h3>
                <div className="space-y-4">
                  {auditData.results.technical.issues.map((issue, index) => (
                    <div key={index} className="card bg-base-200">
                      <div className="card-body">
                        <div className="flex items-start gap-3">
                          {getIssueIcon(issue.type)}
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold">{issue.title}</h4>
                              <span className={`badge ${issue.type === 'critical' ? 'badge-error' : issue.type === 'warning' ? 'badge-warning' : 'badge-info'}`}>
                                {issue.impact} Impact
                              </span>
                            </div>
                            <p className="text-sm text-base-content/70 mb-3">{issue.description}</p>
                            <div className="rounded-3xl bg-base-100">
                              <button
                                className="w-full px-6 py-4 flex justify-between items-center hover:bg-opacity-50 transition-all duration-200"
                                onClick={() => setExpandedIssue(expandedIssue === index ? null : index)}
                              >
                                <span className="text-sm font-medium text-left">How to fix this issue</span>
                                <svg
                                  className={`w-6 h-6 transform transition-transform duration-200 ${
                                    expandedIssue === index ? 'rotate-45' : ''
                                  }`}
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                              </button>
                              <div
                                className={`px-6 overflow-hidden transition-all duration-200 ${
                                  expandedIssue === index ? 'max-h-40 py-4' : 'max-h-0'
                                }`}
                              >
                                <p className="text-sm mb-2">{issue.fix}</p>
                                <div className="mockup-code">
                                  <pre><code>{issue.example}</code></pre>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/70">Desktop Speed</p>
                      <p className="text-2xl font-bold mt-1">{auditData.results.performance.metrics.pageSpeed}s</p>
                    </div>
                    <RiGlobalLine className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/70">Mobile Speed</p>
                      <p className="text-2xl font-bold mt-1">{auditData.results.performance.metrics.mobileSpeed}s</p>
                    </div>
                    <RiSmartphoneLine className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-base-content/70">Performance Score</p>
                      <p className={`text-2xl font-bold mt-1 ${getScoreColor(auditData.results.performance.score)}`}>
                        {auditData.results.performance.score}/100
                      </p>
                    </div>
                    <RiSpeedUpLine className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title mb-4">Core Web Vitals</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="stat">
                    <div className="stat-title">First Contentful Paint</div>
                    <div className="stat-value text-lg">{auditData.results.performance.metrics.firstContentfulPaint}</div>
                    <div className="stat-desc">Good (&lt; 2.5s)</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Largest Contentful Paint</div>
                    <div className="stat-value text-lg">{auditData.results.performance.metrics.largestContentfulPaint}</div>
                    <div className="stat-desc">Needs Improvement</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Cumulative Layout Shift</div>
                    <div className="stat-value text-lg">{auditData.results.performance.metrics.cumulativeLayoutShift}</div>
                    <div className="stat-desc">Good (&lt; 0.25)</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title mb-4">Optimization Opportunities</h3>
                <ul className="space-y-2">
                  {auditData.results.performance.opportunities.map((opportunity, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <RiCheckboxCircleLine className="w-5 h-5 text-info" />
                      <span>{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      case 'content':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">Title Tag Analysis</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Present:</span>
                      <span className={auditData.results.content.analysis.titleTag.present ? 'text-success' : 'text-error'}>
                        {auditData.results.content.analysis.titleTag.present ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Length:</span>
                      <span>{auditData.results.content.analysis.titleTag.length} characters</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Optimal:</span>
                      <span className={auditData.results.content.analysis.titleTag.optimal ? 'text-success' : 'text-warning'}>
                        {auditData.results.content.analysis.titleTag.optimal ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {!auditData.results.content.analysis.titleTag.optimal && (
                      <div className="alert alert-warning">
                        <div className="text-sm">
                          {auditData.results.content.analysis.titleTag.suggestion}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">Heading Structure</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>H1 Tags:</span>
                      <span>{auditData.results.content.analysis.headings.h1Count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>H2 Tags:</span>
                      <span>{auditData.results.content.analysis.headings.h2Count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Structure:</span>
                      <span className="text-success">{auditData.results.content.analysis.headings.structure}</span>
                    </div>
                    {auditData.results.content.analysis.headings.issues.length > 0 && (
                      <div className="alert ">
                        <div className="text-sm">
                          Issues: {auditData.results.content.analysis.headings.issues.join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">Content Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="stat">
                    <div className="stat-title">Word Count</div>
                    <div className="stat-value text-lg">{auditData.results.content.analysis.wordCount}</div>
                    <div className="stat-desc">Good length for SEO</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Keyword Density</div>
                    <div className="stat-value text-lg">{auditData.results.content.analysis.keywordDensity.primary}%</div>
                    <div className="stat-desc">
                      {auditData.results.content.analysis.keywordDensity.optimal ? 'Optimal' : 'Needs improvement'}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Readability</div>
                    <div className="stat-value text-lg">{auditData.results.content.analysis.readability}</div>
                    <div className="stat-desc">Easy to read</div>
                  </div>
                </div>
                {!auditData.results.content.analysis.keywordDensity.optimal && (
                  <div className="alert  mt-4">
                    <div className="text-sm">
                      {auditData.results.content.analysis.keywordDensity.suggestion}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'keywords':
        return (
          <div className="space-y-6">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">Keyword Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="stat">
                    <div className="stat-title">Primary Keyword</div>
                    <div className="stat-value text-lg">{auditData.results.keywords.primary}</div>
                    <div className="stat-desc">Current focus keyword</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Keyword Density</div>
                    <div className="stat-value text-lg">{auditData.results.keywords.density}%</div>
                    <div className="stat-desc">Below optimal range</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Keyword Score</div>
                    <div className={`stat-value text-lg ${getScoreColor(auditData.results.keywords.score)}`}>
                      {auditData.results.keywords.score}/100
                    </div>
                    <div className="stat-desc">Needs improvement</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">Keyword Opportunities</h3>
                  <div className="space-y-2">
                    {auditData.results.keywords.opportunities.map((keyword, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-base-200 rounded">
                        <span className="text-sm font-medium">{keyword}</span>
                        <span className="badge badge-primary badge-sm">Opportunity</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h3 className="card-title">Competitor Keywords</h3>
                  <div className="overflow-x-auto">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Keyword</th>
                          <th>Difficulty</th>
                          <th>Volume</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditData.results.keywords.competitors.map((keyword, index) => (
                          <tr key={index}>
                            <td>{keyword.keyword}</td>
                            <td>
                              <span className={`badge badge-sm ${
                                keyword.difficulty === 'Low' ? 'badge-success' :
                                keyword.difficulty === 'Medium' ? 'badge-warning' : 'badge-error'
                              }`}>
                                {keyword.difficulty}
                              </span>
                            </td>
                            <td>{keyword.volume}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'recommendations':
        return (
          <div className="space-y-6">
            <div className="card bg-base-100 shadow-lg">
              <div className="card-body">
                <h3 className="card-title">
                  <RiLightbulbLine className="text-primary" />
                  AI-Powered Recommendations
                </h3>
                <p className="text-sm text-base-content/70 mb-4">
                  Our AI has analyzed your website and generated personalized recommendations to improve your SEO performance.
                </p>
                <div className="space-y-4">
                  {auditData.results.recommendations.map((rec, index) => (
                    <div key={index} className="card bg-base-200">
                      <div className="card-body">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold">{rec.title}</h4>
                          <div className="flex gap-2">
                            <span className={`badge ${getPriorityColor(rec.priority)}`}>
                              {rec.priority} Priority
                            </span>
                            <span className="badge badge-outline">{rec.category}</span>
                          </div>
                        </div>
                        <p className="text-sm text-base-content/70 mb-3">{rec.description}</p>
                        <div className="alert  mb-3">
                          <div className="text-sm">
                            <strong>Expected Impact:</strong> {rec.impact}
                          </div>
                        </div>
                        <div className="rounded-3xl bg-base-100">
                          <button
                            className="w-full px-6 py-4 flex justify-between items-center hover:bg-opacity-50 transition-all duration-200"
                            onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                          >
                            <span className="text-sm font-medium text-left">Step-by-step implementation ({rec.effort} effort)</span>
                            <svg
                              className={`w-6 h-6 transform transition-transform duration-200 ${
                                expandedStep === index ? 'rotate-45' : ''
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </button>
                          <div
                            className={`px-6 overflow-hidden transition-all duration-200 ${
                              expandedStep === index ? 'max-h-40 py-4' : 'max-h-0'
                            }`}
                          >
                            <ol className="list-decimal list-inside space-y-2">
                              {rec.steps.map((step, stepIndex) => (
                                <li key={stepIndex} className="text-sm">{step}</li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">SEO Audit Tool</h1>
        <div className="flex gap-2">
          {auditData.results && (
            <>
              <button 
                className="btn btn-outline"
                onClick={() => setAuditData(prev => ({ ...prev, results: null, url: '' }))}
              >
                <RiRefreshLine className="w-4 h-4 mr-2" />
                New Audit
              </button>
              <button 
                className="btn btn-primary"
                onClick={exportAuditReport}
              >
                <RiDownloadLine className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </>
          )}
        </div>
      </div>

      {/* URL Input Form */}
      {!auditData.results && (
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">
              <RiSearchLine className="text-primary" />
              Start Your SEO Audit
            </h2>
            <p className="text-base-content/70 mb-4">
              Enter your website URL to get a comprehensive SEO analysis with AI-powered recommendations.
            </p>
            <form onSubmit={handleAuditSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Website URL</span>
                </label>
                <div className="join">
                  <input
                    type="url"
                    placeholder="https://example.com"
                    className="input input-bordered join-item flex-1"
                    value={auditData.url}
                    onChange={(e) => setAuditData(prev => ({ ...prev, url: e.target.value, error: null }))}
                    disabled={auditData.loading}
                  />
                  <button 
                    type="submit"
                    className={`btn btn-primary join-item ${auditData.loading ? 'loading' : ''}`}
                    disabled={auditData.loading || !auditData.url}
                  >
                    {auditData.loading ? 'Analyzing...' : 'Start Audit'}
                  </button>
                </div>
                {auditData.error && (
                  <label className="label">
                    <span className="label-text-alt text-error">{auditData.error}</span>
                  </label>
                )}
              </div>
            </form>

            {/* Audit Progress */}
            {auditData.loading && (
              <div className="mt-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Audit Progress</span>
                  <span className="text-sm">{Math.round(auditData.progress)}%</span>
                </div>
                <div className="w-full bg-base-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ width: `${auditData.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-base-content/70">{auditData.currentStep}</p>
              </div>
            )}

            {/* Features Preview */}
            {!auditData.loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4">
                  <RiSeoLine className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Technical SEO</h3>
                  <p className="text-sm text-base-content/70">Meta tags, structured data, crawlability</p>
                </div>
                <div className="text-center p-4">
                  <RiSpeedUpLine className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Performance</h3>
                  <p className="text-sm text-base-content/70">Page speed, Core Web Vitals</p>
                </div>
                <div className="text-center p-4">
                  <RiLightbulbLine className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">AI Recommendations</h3>
                  <p className="text-sm text-base-content/70">Personalized improvement suggestions</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Display */}
      {auditData.results && (
        <>
          {/* Category Navigation */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex justify-between items-center mb-4">
                <h2 className="card-title">Audit Results for {auditData.url}</h2>
                <span className="text-sm text-base-content/70">
                  Last audited: {new Date(auditData.results.overview.lastAudited).toLocaleString()}
                </span>
              </div>
              <div className="tabs tabs-boxed">
                {categories.map((category) => (
                  <a
                    key={category.id}
                    className={`tab ${selectedCategory === category.id ? 'tab-active' : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <category.icon className="w-4 h-4 mr-2" />
                    {category.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Category Content */}
          {renderCategoryContent()}
        </>
      )}
    </div>
  );
}