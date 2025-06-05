# SEO Audit Tool Backend

This document describes the SEO Audit tool implementation for the ReachBee marketing platform.

## Installation

1. **Install new dependencies:**
```bash
cd backend
npm install puppeteer cheerio axios
```

2. **Environment Variables:**
Make sure your `.env` file includes:
```env
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
PORT=5005
```

## API Endpoints

### Core SEO Audit Routes

#### Start Audit
- **POST** `/api/seo/audit`
- **Body:** `{ "url": "https://example.com" }`
- **Response:** `{ "auditId": "audit_1234567890", "status": "started" }`

#### Get Audit Status
- **GET** `/api/seo/audit/{auditId}/status`
- **Response:** 
```json
{
  "id": "audit_1234567890",
  "url": "https://example.com",
  "status": "in_progress|completed|failed",
  "progress": 75,
  "currentStep": "Analyzing keywords...",
  "startedAt": "2024-01-01T12:00:00.000Z"
}
```

#### Get Audit Results
- **GET** `/api/seo/audit/{auditId}`
- **Response:** Complete audit results with all analysis data

### Additional Features

#### Keyword Analysis
- **POST** `/api/seo/keywords`
- **Body:** `{ "keywords": ["seo", "marketing"], "url": "https://example.com" }`

#### AI Recommendations
- **POST** `/api/seo/recommendations`
- **Body:** `{ "auditData": {...}, "focusAreas": ["technical", "content"] }`

#### Export Report
- **GET** `/api/seo/export/{auditId}/json`
- Downloads audit report as JSON file

## Features Implemented

### 1. Web Crawling Engine
- **Primary:** Puppeteer for dynamic content analysis
- **Fallback:** Axios + Cheerio for static content
- **Capabilities:**
  - Full page rendering and content extraction
  - Performance metrics collection
  - Mobile and desktop viewport analysis
  - JavaScript execution support

### 2. Technical SEO Analysis
- Meta tags analysis (title, description, keywords, Open Graph)
- Heading structure validation (H1, H2, H3 hierarchy)
- Image optimization (alt text, file sizes)
- Link analysis (internal/external, broken links)
- URL structure and canonicalization

### 3. Performance Analysis
- Core Web Vitals measurement
- Page load time analysis
- Resource optimization opportunities
- Mobile vs Desktop performance comparison

### 4. Content Quality Analysis
- Word count and readability assessment
- Keyword density calculation
- Content structure evaluation
- Semantic analysis for topic relevance

### 5. AI-Powered Recommendations
- **Model:** Mistral-7B-Instruct-v0.3 via HuggingFace
- **Features:**
  - Priority-based recommendation system (High/Medium/Low)
  - Specific implementation steps for each recommendation
  - Expected impact and effort estimation
  - Personalized suggestions based on audit findings

### 6. Keyword Analysis Engine
- Primary keyword identification
- Keyword density optimization
- Competitor keyword analysis
- Long-tail keyword opportunities
- Search volume and difficulty estimation

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │────│   API Routes    │────│   Controllers   │
│   (React)       │    │   (Express)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                         │
                       ┌─────────────────┐              │
                       │   AI Service    │◄─────────────┘
                       │ (HuggingFace)   │              │
                       └─────────────────┘              │
                                                        │
                       ┌─────────────────┐              │
                       │  SEO Service    │◄─────────────┘
                       │                 │
                       │ ┌─────────────┐ │
                       │ │  Puppeteer  │ │
                       │ └─────────────┘ │
                       │ ┌─────────────┐ │
                       │ │   Cheerio   │ │
                       │ └─────────────┘ │
                       │ ┌─────────────┐ │
                       │ │   Analysis  │ │
                       │ │   Engines   │ │
                       │ └─────────────┘ │
                       └─────────────────┘
```

## Usage Examples

### Starting an Audit
```javascript
const response = await fetch('http://localhost:5005/api/seo/audit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ url: 'https://example.com' })
});
const { auditId } = await response.json();
```

### Polling for Results
```javascript
const checkStatus = async (auditId) => {
  const response = await fetch(`http://localhost:5005/api/seo/audit/${auditId}/status`);
  const status = await response.json();
  
  if (status.status === 'completed') {
    const results = await fetch(`http://localhost:5005/api/seo/audit/${auditId}`);
    return await results.json();
  }
  
  return status;
};
```

## Production Considerations

### Performance Optimization
- Implement Redis for audit result caching
- Add database persistence for audit history
- Set up proper Puppeteer pool management
- Implement rate limiting for audit requests

### Enhanced Features
- Integration with Google PageSpeed Insights API
- Google Search Console integration
- Lighthouse API for detailed performance analysis
- Schema.org markup validation
- Social media meta tags analysis

### Security
- URL validation and sanitization
- Request rate limiting
- User authentication for audit access
- Input validation for all endpoints

### Monitoring
- Audit completion success rates
- Average audit processing time
- Resource usage monitoring
- Error tracking and alerting

## Troubleshooting

### Common Issues

1. **Puppeteer fails to launch:**
   ```bash
   # Install required dependencies on Ubuntu/Debian
   sudo apt-get install chromium-browser
   
   # Or use Docker with pre-installed Chromium
   ```

2. **Memory issues with large websites:**
   - Implement pagination for large sites
   - Add memory usage monitoring
   - Set timeout limits for crawling

3. **Rate limiting from target websites:**
   - Implement respectful crawling delays
   - Add user-agent rotation
   - Handle 429 responses gracefully

## Future Enhancements

- [ ] Multi-page site auditing
- [ ] Competitor analysis features
- [ ] SEO score tracking over time
- [ ] Custom SEO rule configuration
- [ ] PDF report generation
- [ ] Integration with Google Analytics
- [ ] Automated fix suggestions
- [ ] SEO task management system 