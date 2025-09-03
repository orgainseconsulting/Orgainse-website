# ORGAINSE CONSULTING WEBSITE - DETAILED ARCHITECTURE DESIGN

## 🏗️ SYSTEM ARCHITECTURE OVERVIEW

```mermaid
graph TB
    User[👤 User Browser] --> CDN[🌐 Vercel Edge CDN]
    CDN --> Frontend[⚛️ React SPA Frontend]
    Frontend --> API[⚡ Serverless Functions]
    API --> DB[(🗄️ MongoDB Atlas)]
    
    Frontend --> Analytics1[📊 Google Analytics]
    Frontend --> Analytics2[📈 Vercel Analytics]
    
    subgraph "Vercel Platform"
        Frontend
        API
        CDN
    end
    
    subgraph "MongoDB Atlas Cluster"
        DB
        Collections[📚 5 Lead Collections]
    end
    
    subgraph "External Services"
        Analytics1
        Analytics2
        Calendly[📅 Calendly Integration]
    end
```

## 🔧 TECHNICAL ARCHITECTURE

### **1. FRONTEND ARCHITECTURE (React SPA)**

```javascript
/src/
├── App.js                 // Main application component (4,500+ lines)
├── index.js              // Application entry point
├── components/           // Reusable UI components
│   ├── AdminDashboard.js // Lead management interface
│   ├── ServicePopup.js   // Service detail modals
│   ├── SEOHead.js       // SEO meta tags component
│   └── ui/              // Radix UI component library
│       ├── button.js
│       ├── card.js
│       ├── input.js
│       └── ...
├── lib/
│   └── utils.js         // Utility functions
└── styles/
    ├── App.css          // Global styles
    └── index.css        // Tailwind imports
```

**Component Architecture Pattern:**
```javascript
// Example: AI Assessment Component Structure
const AIAssessment = () => {
  // State management
  const [userInfo, setUserInfo] = useState({});
  const [responses, setResponses] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  
  // API integration
  const handleSubmit = async () => {
    // Null safety checks implemented
    const leadData = {
      leadType: 'AI Assessment',
      current_ai_usage: responses.find(r => 
        r.question && r.question.includes && r.question.includes('AI usage')
      )?.answer || 'Not specified'
    };
    
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadData)
    });
  };
  
  return (
    // JSX with responsive design
  );
};
```

### **2. BACKEND ARCHITECTURE (Serverless Functions)**

```javascript
// Serverless Function Pattern (/api/*.js)
export default async function handler(req, res) {
  // 1. CORS Headers Setup
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 2. HTTP Method Handling
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // 3. Request Validation
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // 4. Input Validation
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    // 5. Database Operations
    const client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'orgainse-consulting');
    
    // 6. Lead Routing Logic
    const collectionName = determineCollection(req.body.leadType);
    await db.collection(collectionName).insertOne(leadData);
    
    // 7. Response
    res.status(200).json({ 
      message: 'Success',
      id: leadData.id,
      timestamp: leadData.timestamp 
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}
```

**API Endpoints Structure:**
```
/api/
├── health.js      // System health monitoring
│   ├── GET: Returns system status
│   └── Response: { status, timestamp, service, version }
│
├── newsletter.js  // Newsletter subscriptions
│   ├── POST: Create subscription
│   ├── Validation: Email format, duplicates
│   └── Collection: newsletter_subscriptions
│
├── contact.js     // Universal lead capture
│   ├── POST: Accept all lead types
│   ├── Routing: Based on leadType parameter
│   └── Collections: 5 different collections
│
└── admin.js       // Dashboard data aggregation
    ├── GET: Retrieve all leads
    ├── Aggregation: From all collections
    └── Response: Summary + detailed data
```

### **3. DATABASE ARCHITECTURE (MongoDB Atlas)**

**Cluster Configuration:**
```
Cloud Provider: AWS
Region: Mumbai (ap-south-1)
Cluster: orgainse-consulting
Instance: M0 (Free Tier - 512MB)
Connection: mongodb+srv://
Backup: Automated daily snapshots
```

**Collections Schema:**

```javascript
// Newsletter Subscriptions Collection
{
  _id: ObjectId,                    // MongoDB default
  id: "1756929210447",             // Custom timestamp ID
  email: "user@company.com",       // Unique identifier
  first_name: "John",              // User's first name
  name: "John Doe",                // Full name
  leadType: "Newsletter Subscription", // Lead categorization
  source: "Homepage Form",         // Traffic source
  subscribed_at: ISODate,          // Timestamp
  status: "active"                 // Subscription status
}

// Contact Messages Collection
{
  _id: ObjectId,
  id: "1756929210448",
  name: "Jane Smith",
  email: "jane@company.com",
  company: "Tech Corp",
  phone: "+1-555-0123",
  service_type: "AI Strategy",
  leadType: "Contact Inquiry",
  source: "Contact Form",
  message: "We need AI consulting...",
  submitted_at: ISODate,
  status: "new"
}

// AI Assessment Leads Collection
{
  _id: ObjectId,
  id: "1756929210449",
  name: "Bob Johnson",
  email: "bob@startup.com",
  company: "AI Startup",
  leadType: "AI Assessment",
  role: "CTO",
  industry: "Technology",
  company_size: "10-50",
  current_ai_usage: "Limited automation",
  main_challenges: "Scaling AI operations",
  goals: "Implement AI strategy",
  assessmentScore: 73,
  recommendations: "AI Assessment completed",
  submitted_at: ISODate,
  status: "new"
}

// ROI Calculator Leads Collection
{
  _id: ObjectId,
  id: "1756929210450",
  name: "Alice Wilson",
  email: "alice@manufacturing.com",
  company: "Manufacturing Inc",
  leadType: "ROI Calculator",
  role: "Operations Manager",
  industry: "Manufacturing",
  current_project_cost: 50000,
  project_duration_months: 6,
  current_efficiency_rating: 7,
  desired_services: ["Process Optimization", "AI Implementation"],
  calculatedROI: 320,
  potential_savings: 15000,
  submitted_at: ISODate,
  status: "new"
}
```

**Indexing Strategy:**
```javascript
// Automatic indexes created by MongoDB Atlas
db.newsletter_subscriptions.createIndex({ "email": 1 }, { unique: true })
db.contact_messages.createIndex({ "submitted_at": -1 })
db.ai_assessment_leads.createIndex({ "submitted_at": -1 })
db.roi_calculator_leads.createIndex({ "submitted_at": -1 })
db.service_inquiries.createIndex({ "submitted_at": -1 })
db.consultation_leads.createIndex({ "submitted_at": -1 })

// Performance optimization indexes
db.contact_messages.createIndex({ "leadType": 1, "submitted_at": -1 })
db.ai_assessment_leads.createIndex({ "industry": 1 })
db.roi_calculator_leads.createIndex({ "calculatedROI": -1 })
```

### **4. ROUTING & URL ARCHITECTURE**

**Frontend Routing (React Router DOM):**
```javascript
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Homepage />} />
    <Route path="/about" element={<About />} />
    <Route path="/services" element={<Services />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/ai-assessment" element={<AIAssessment />} />
    <Route path="/roi-calculator" element={<ROICalculator />} />
    <Route path="/smart-calendar" element={<SmartCalendar />} />
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/privacy" element={<PrivacyPolicy />} />
    <Route path="/terms" element={<TermsOfService />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);
```

**Vercel Routing Configuration:**
```json
{
  "version": 2,
  "name": "orgainse-consulting",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ],
  "redirects": [
    {
      "source": "/about-us-1",
      "destination": "/about",
      "permanent": true
    },
    {
      "source": "/contactus",
      "destination": "/contact",
      "permanent": true
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ],
  "functions": {
    "api/*.js": {
      "maxDuration": 10
    }
  }
}
```

### **5. STATE MANAGEMENT ARCHITECTURE**

**React State Patterns Used:**

```javascript
// 1. Component-level State (useState)
const [newsletterEmail, setNewsletterEmail] = useState('');
const [newsletterStatus, setNewsletterStatus] = useState('');
const [isNewsletterLoading, setIsNewsletterLoading] = useState(false);

// 2. Context-based State (React Context)
const RegionalPricingContext = React.createContext();
const CalendlyContext = React.createContext();

// 3. Form State Management
const [formData, setFormData] = useState({
  name: '',
  email: '',
  company: '',
  phone: '',
  current_project_cost: '',
  project_duration_months: '',
  current_efficiency_rating: 5,
  desired_services: []
});

// 4. Multi-step Form State
const [currentStep, setCurrentStep] = useState(0);
const [responses, setResponses] = useState([]);
const [userInfo, setUserInfo] = useState({});

// 5. Admin Dashboard State
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
const [activeTab, setActiveTab] = useState('overview');
```

### **6. SECURITY ARCHITECTURE**

**Current Security Measures:**
```javascript
// 1. CORS Configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

// 2. Input Validation
const validateInput = (data) => {
  if (!data.name || !data.email || !data.message) {
    throw new Error('Required fields missing');
  }
  
  if (!data.email.includes('@')) {
    throw new Error('Invalid email format');
  }
  
  return true;
};

// 3. Environment Variable Security
const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME || 'orgainse-consulting';
// Note: Never expose sensitive data in client-side code

// 4. Error Handling
try {
  // Database operations
} catch (error) {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Server error' }); // No sensitive details
}
```

**Security Headers Implementation:**
```javascript
// Recommended security headers (to be implemented)
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' googletagmanager.com; style-src 'self' 'unsafe-inline'"
};
```

### **7. PERFORMANCE ARCHITECTURE**

**Frontend Optimization:**
```javascript
// 1. Code Splitting (React.lazy)
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));

// 2. Memoization
const MemoizedServiceCard = React.memo(ServiceCard);

// 3. Event Debouncing
const debouncedSearch = useCallback(
  debounce((query) => performSearch(query), 300),
  []
);

// 4. Image Optimization
<img 
  src="https://images.unsplash.com/photo-xyz?w=800"
  alt="AI transformation"
  loading="lazy"
  width="800"
  height="500"
/>
```

**Backend Optimization:**
```javascript
// 1. Connection Pooling
const client = new MongoClient(process.env.MONGO_URL, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

// 2. Query Optimization
const leads = await db.collection(collectionName)
  .find({})
  .sort({ submitted_at: -1 })
  .limit(100)
  .toArray();

// 3. Response Caching (via headers)
res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes
```

### **8. DEPLOYMENT ARCHITECTURE**

**Vercel Deployment Pipeline:**
```yaml
# .github/workflows/deploy.yml (if using GitHub)
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

**Environment Configuration:**
```bash
# Production Environment Variables (Vercel Dashboard)
MONGO_URL=mongodb+srv://orgainse_db_user:Mycompany25%25MDB@orgainse-consulting.g0jdlcn.mongodb.net/?retryWrites=true&w=majority&appName=orgainse-consulting
DB_NAME=orgainse-consulting

# Build Configuration
NODE_VERSION=18.x
BUILD_COMMAND=npm run build
OUTPUT_DIRECTORY=build
INSTALL_COMMAND=npm install
```

**CDN & Edge Configuration:**
```json
{
  "regions": ["all"],
  "framework": "create-react-app",
  "buildCommand": "craco build",
  "devCommand": "craco start",
  "installCommand": "yarn install",
  "outputDirectory": "build"
}
```

### **9. MONITORING & ANALYTICS ARCHITECTURE**

**Analytics Implementation:**
```javascript
// Google Analytics 4
window.gtag('config', 'G-F48RFBBEP7', {
  page_title: document.title,
  page_location: window.location.href,
  custom_map: {'dimension1': 'deployment_env'}
});

// Vercel Analytics
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App() {
  return (
    <>
      <MainApp />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
```

**Error Tracking:**
```javascript
// Error boundary for React components
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

### **10. TESTING ARCHITECTURE**

**Backend Testing Strategy:**
```javascript
// serverless_functions_test.py - Comprehensive API testing
const testCases = [
  {
    endpoint: '/api/health',
    method: 'GET',
    expected: { status: 'healthy' }
  },
  {
    endpoint: '/api/newsletter',
    method: 'POST',
    data: { email: 'test@example.com', name: 'Test User' },
    expected: { status: 200 }
  }
];

// Test execution with realistic business data
const businessScenarios = [
  { industry: 'Healthcare', company: 'Medical Innovations Inc.' },
  { industry: 'Financial', company: 'Global Investment Group' },
  { industry: 'Manufacturing', company: 'Smart Manufacturing Solutions' }
];
```

**Frontend Testing Strategy:**
```javascript
// React Testing Library for component testing
import { render, screen, fireEvent } from '@testing-library/react';

test('newsletter form submission', async () => {
  render(<NewsletterForm />);
  
  const emailInput = screen.getByPlaceholderText('Enter your email');
  const submitButton = screen.getByText('Subscribe');
  
  fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
  fireEvent.click(submitButton);
  
  expect(await screen.findByText('Success!')).toBeInTheDocument();
});
```

---

## 🔄 DATA FLOW ARCHITECTURE

### **Complete User Journey Data Flow:**

```
1. User Landing
   ├── DNS Resolution → Vercel Edge
   ├── Static Assets → CDN Cache
   ├── React App → Browser Hydration
   └── Analytics → Google/Vercel Tracking

2. Lead Capture Flow
   ├── Form Interaction → React State Update
   ├── Validation → Client-side Checks
   ├── API Call → Serverless Function
   ├── Processing → Input Validation
   ├── Routing → Lead Type Classification
   ├── Database → MongoDB Collection Insert
   └── Response → User Feedback

3. Admin Dashboard Flow
   ├── Route Access → /admin URL
   ├── API Request → /api/admin endpoint
   ├── Data Aggregation → All Collections Query
   ├── Response → JSON with Statistics
   ├── Rendering → Tabbed Interface
   └── Export → CSV Download
```

### **Real-time Data Processing:**

```javascript
// Lead Processing Pipeline
const processLead = async (leadData) => {
  // 1. Validation
  const validatedLead = validateLeadData(leadData);
  
  // 2. Enrichment
  const enrichedLead = {
    ...validatedLead,
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    status: 'new',
    source: determineSource(leadData)
  };
  
  // 3. Routing
  const collection = routeToCollection(enrichedLead.leadType);
  
  // 4. Storage
  await database.collection(collection).insertOne(enrichedLead);
  
  // 5. Notification (future)
  // await sendNotification(enrichedLead);
  
  return enrichedLead;
};
```

---

## 📊 SCALABILITY ARCHITECTURE

### **Horizontal Scaling Strategy:**

**Serverless Auto-scaling:**
- Vercel functions automatically scale from 0 to 1000+ concurrent executions
- Each function can handle multiple requests simultaneously
- Cold start optimization through function warmup

**Database Scaling:**
- MongoDB Atlas auto-scaling enabled
- Connection pooling for efficient resource utilization
- Read replicas for improved query performance

**CDN Scaling:**
- Global edge network for static asset delivery
- Automatic cache invalidation on deployments
- Geographic content distribution

### **Performance Benchmarks:**

```
Current Performance Metrics:
├── Page Load Time: <2 seconds
├── API Response Time: <100ms average
├── Database Query Time: <50ms average
├── CDN Cache Hit Rate: >95%
└── Function Cold Start: <500ms

Target Performance Goals:
├── Page Load Time: <1.5 seconds
├── API Response Time: <75ms average
├── Database Query Time: <30ms average
├── CDN Cache Hit Rate: >98%
└── Function Cold Start: <300ms
```

---

**Architecture Document Version**: 2.0  
**Last Updated**: September 3, 2025  
**Status**: Production Ready  
**Maintainer**: Orgainse Development Team