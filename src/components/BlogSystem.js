import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, ArrowRight, Search, Filter, Tag } from 'lucide-react';

const BlogSystem = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);

  // Blog posts data with SEO-optimized content
  const blogPosts = [
    {
      id: 1,
      title: "10 AI Transformation Success Stories: Real ROI from Real Companies",
      slug: "ai-transformation-success-stories-roi",
      excerpt: "Discover how Fortune 500 companies achieved 300%+ ROI through strategic AI implementation. Real case studies, real results.",
      content: `
        <h2>The AI Transformation Revolution</h2>
        <p>Artificial Intelligence isn't just a buzzword—it's delivering measurable business results. We've analyzed 10 companies that achieved exceptional ROI through strategic AI implementation.</p>
        
        <h3>Case Study 1: Healthcare Giant Reduces Costs by 40%</h3>
        <p>A leading healthcare provider implemented AI-powered predictive analytics for patient flow optimization...</p>
        <ul>
          <li><strong>Challenge:</strong> Emergency room overcrowding and resource allocation</li>
          <li><strong>Solution:</strong> AI-powered patient flow prediction system</li>
          <li><strong>Results:</strong> 40% reduction in wait times, 35% improvement in resource utilization</li>
          <li><strong>ROI:</strong> 320% within 18 months</li>
        </ul>

        <h3>Case Study 2: Manufacturing Efficiency Breakthrough</h3>
        <p>Smart Manufacturing Inc. transformed their production line with predictive maintenance AI...</p>
        <ul>
          <li><strong>Challenge:</strong> Unexpected equipment failures causing $2M annual losses</li>
          <li><strong>Solution:</strong> IoT sensors + AI predictive maintenance algorithms</li>
          <li><strong>Results:</strong> 60% reduction in unplanned downtime</li>
          <li><strong>ROI:</strong> 425% in first year</li>
        </ul>

        <h3>Key Success Factors</h3>
        <ol>
          <li><strong>Clear Business Objectives:</strong> Every successful implementation started with specific, measurable goals</li>
          <li><strong>Quality Data Foundation:</strong> Companies invested in data infrastructure before AI implementation</li>
          <li><strong>Change Management:</strong> Successful organizations prepared their teams for AI adoption</li>
          <li><strong>Iterative Approach:</strong> Start small, prove value, then scale</li>
        </ol>

        <h3>Ready to Transform Your Business?</h3>
        <p>These companies didn't achieve success overnight. They worked with experienced AI consultants to develop strategies tailored to their specific needs.</p>
      `,
      category: "Case Studies",
      author: "Dr. Sarah Chen",
      date: "2025-01-15",
      readTime: "8 min read",
      tags: ["AI Transformation", "ROI", "Case Studies", "Success Stories"],
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
      featured: true,
      seoKeywords: "AI transformation, ROI case studies, artificial intelligence success stories, business AI implementation"
    },
    {
      id: 2,
      title: "The Complete Guide to AI Strategy for Mid-Market Companies",
      slug: "ai-strategy-guide-mid-market-companies",
      excerpt: "A step-by-step playbook for mid-market companies to develop and implement winning AI strategies. No technical jargon, just actionable insights.",
      content: `
        <h2>Why Mid-Market Companies Are Perfect for AI</h2>
        <p>Mid-market companies have a unique advantage in AI adoption—they're large enough to benefit from scale but agile enough to implement quickly.</p>

        <h3>Phase 1: Assessment & Strategy (Months 1-2)</h3>
        <h4>Business Process Analysis</h4>
        <ul>
          <li>Identify repetitive, data-driven processes</li>
          <li>Calculate current costs and inefficiencies</li>
          <li>Prioritize by potential impact and feasibility</li>
        </ul>

        <h4>Data Readiness Evaluation</h4>
        <ul>
          <li>Audit existing data sources and quality</li>
          <li>Identify data gaps and integration needs</li>
          <li>Plan data infrastructure improvements</li>
        </ul>

        <h3>Phase 2: Pilot Implementation (Months 3-6)</h3>
        <p>Start with one high-impact, low-risk use case:</p>
        <ul>
          <li><strong>Customer Service:</strong> AI chatbots for common inquiries</li>
          <li><strong>Sales:</strong> Lead scoring and opportunity prediction</li>
          <li><strong>Operations:</strong> Demand forecasting and inventory optimization</li>
        </ul>

        <h3>Phase 3: Scale and Optimize (Months 7-12)</h3>
        <p>Expand successful pilots across the organization:</p>
        <ol>
          <li>Document lessons learned and best practices</li>
          <li>Train additional team members</li>
          <li>Integrate AI tools with existing systems</li>
          <li>Measure and optimize performance</li>
        </ol>

        <h3>Common Pitfalls to Avoid</h3>
        <ul>
          <li><strong>Trying to do everything at once:</strong> Focus on 1-2 use cases initially</li>
          <li><strong>Neglecting change management:</strong> Invest in team training and buy-in</li>
          <li><strong>Underestimating data requirements:</strong> Clean, structured data is crucial</li>
          <li><strong>Lacking clear success metrics:</strong> Define KPIs before implementation</li>
        </ul>
      `,
      category: "Strategy",
      author: "Michael Rodriguez",
      date: "2025-01-12",
      readTime: "12 min read",
      tags: ["AI Strategy", "Mid-Market", "Implementation", "Business Planning"],
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
      featured: true,
      seoKeywords: "AI strategy, mid-market companies, artificial intelligence planning, business AI roadmap"
    },
    {
      id: 3,
      title: "ROI Calculator Deep Dive: Measuring AI Investment Returns",
      slug: "ai-roi-calculator-measuring-investment-returns",
      excerpt: "Master the art of calculating AI ROI with our comprehensive framework. Includes templates, formulas, and real-world examples.",
      content: `
        <h2>The Challenge of Measuring AI ROI</h2>
        <p>Unlike traditional IT investments, AI ROI includes both tangible and intangible benefits that compound over time.</p>

        <h3>Direct Cost Savings Formula</h3>
        <div class="bg-gray-100 p-4 rounded-lg my-4">
          <code>
            Annual Savings = (Hours Saved × Hourly Rate × Number of Employees) + 
            (Error Reduction × Cost per Error) + 
            (Process Efficiency Gain × Current Process Cost)
          </code>
        </div>

        <h3>Revenue Enhancement Calculation</h3>
        <ul>
          <li><strong>Customer Retention:</strong> Improved experience leading to reduced churn</li>
          <li><strong>Sales Acceleration:</strong> Better lead qualification and faster decision-making</li>
          <li><strong>New Opportunities:</strong> AI-enabled products and services</li>
        </ul>

        <h3>Real-World ROI Example</h3>
        <h4>Company: Regional Insurance Broker (500 employees)</h4>
        <h4>Investment: $250,000 AI-powered underwriting system</h4>
        
        <h5>Year 1 Benefits:</h5>
        <ul>
          <li>Processing time reduction: 60% faster underwriting</li>
          <li>Staff productivity: 40 hours/week freed up</li>
          <li>Error reduction: 85% fewer manual errors</li>
          <li>Customer satisfaction: 25% improvement in response time</li>
        </ul>

        <h5>Financial Impact:</h5>
        <ul>
          <li>Labor savings: $180,000</li>
          <li>Error cost reduction: $95,000</li>
          <li>Revenue growth: $220,000 (faster processing = more clients)</li>
          <li><strong>Total Year 1 Benefit: $495,000</strong></li>
          <li><strong>ROI: 198%</strong></li>
        </ul>

        <h3>ROI Tracking Framework</h3>
        <h4>Leading Indicators (Track Monthly):</h4>
        <ul>
          <li>System adoption rates</li>
          <li>User engagement metrics</li>
          <li>Data quality improvements</li>
          <li>Process completion times</li>
        </ul>

        <h4>Lagging Indicators (Track Quarterly):</h4>
        <ul>
          <li>Cost savings achieved</li>
          <li>Revenue impact</li>
          <li>Customer satisfaction scores</li>
          <li>Employee productivity metrics</li>
        </ul>
      `,
      category: "Analytics",
      author: "Lisa Thompson",
      date: "2025-01-10",
      readTime: "10 min read",
      tags: ["ROI", "Analytics", "Measurement", "Business Value"],
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
      featured: false,
      seoKeywords: "AI ROI calculator, artificial intelligence return on investment, measuring AI success, business value AI"
    },
    {
      id: 4,
      title: "Digital Transformation Roadmap: From Legacy to AI-Powered",
      slug: "digital-transformation-roadmap-legacy-to-ai",
      excerpt: "Transform your legacy systems into AI-powered engines of growth. A proven roadmap used by 100+ companies.",
      content: `
        <h2>The Digital Transformation Imperative</h2>
        <p>Companies that don't embrace digital transformation risk becoming obsolete. But transformation done right creates competitive advantages that last.</p>

        <h3>The 4-Phase Transformation Model</h3>
        
        <h4>Phase 1: Foundation Building (3-6 months)</h4>
        <ul>
          <li><strong>Data Infrastructure:</strong> Consolidate and clean data sources</li>
          <li><strong>Cloud Migration:</strong> Move to scalable, flexible platforms</li>
          <li><strong>Security Hardening:</strong> Implement enterprise-grade security</li>
          <li><strong>Team Preparation:</strong> Training and change management</li>
        </ul>

        <h4>Phase 2: Process Digitization (6-12 months)</h4>
        <ul>
          <li><strong>Workflow Automation:</strong> Eliminate manual, repetitive tasks</li>
          <li><strong>System Integration:</strong> Connect disparate systems</li>
          <li><strong>Digital Interfaces:</strong> Modern, user-friendly applications</li>
          <li><strong>Real-time Reporting:</strong> Data-driven decision dashboards</li>
        </ul>

        <h4>Phase 3: Intelligence Layer (12-18 months)</h4>
        <ul>
          <li><strong>Predictive Analytics:</strong> Forecast trends and outcomes</li>
          <li><strong>Machine Learning:</strong> Automated pattern recognition</li>
          <li><strong>AI-Powered Insights:</strong> Automated recommendations</li>
          <li><strong>Intelligent Automation:</strong> Self-optimizing processes</li>
        </ul>

        <h4>Phase 4: Innovation Engine (18+ months)</h4>
        <ul>
          <li><strong>AI-Native Products:</strong> New revenue streams</li>
          <li><strong>Ecosystem Integration:</strong> Partner and supplier connections</li>
          <li><strong>Continuous Learning:</strong> Self-improving systems</li>
          <li><strong>Market Leadership:</strong> Industry-leading capabilities</li>
        </ul>

        <h3>Success Metrics by Phase</h3>
        <table class="w-full border-collapse border border-gray-300 my-4">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 p-2">Phase</th>
              <th class="border border-gray-300 p-2">Key Metrics</th>
              <th class="border border-gray-300 p-2">Target</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-gray-300 p-2">Foundation</td>
              <td class="border border-gray-300 p-2">System Uptime, Data Quality</td>
              <td class="border border-gray-300 p-2">99.9%, 95%</td>
            </tr>
            <tr>
              <td class="border border-gray-300 p-2">Digitization</td>
              <td class="border border-gray-300 p-2">Process Efficiency, User Adoption</td>
              <td class="border border-gray-300 p-2">40% improvement, 90%</td>
            </tr>
            <tr>
              <td class="border border-gray-300 p-2">Intelligence</td>
              <td class="border border-gray-300 p-2">Prediction Accuracy, Decision Speed</td>
              <td class="border border-gray-300 p-2">85%, 60% faster</td>
            </tr>
            <tr>
              <td class="border border-gray-300 p-2">Innovation</td>
              <td class="border border-gray-300 p-2">New Revenue, Market Share</td>
              <td class="border border-gray-300 p-2">15% of total, +5%</td>
            </tr>
          </tbody>
        </table>
      `,
      category: "Digital Transformation",
      author: "Robert Kim",
      date: "2025-01-08",
      readTime: "15 min read",
      tags: ["Digital Transformation", "Legacy Systems", "Roadmap", "Strategy"],
      image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=400&fit=crop",
      featured: false,
      seoKeywords: "digital transformation roadmap, legacy system modernization, AI-powered transformation, business digitization"
    },
    {
      id: 5,
      title: "Process Optimization with AI: Manufacturing Case Study",
      slug: "process-optimization-ai-manufacturing-case-study",
      excerpt: "How Smart Manufacturing Inc. achieved 45% efficiency gains through AI-powered process optimization. Detailed implementation guide included.",
      content: `
        <h2>The Manufacturing Challenge</h2>
        <p>Smart Manufacturing Inc., a mid-size automotive parts manufacturer, faced mounting pressure from rising costs and increasing quality demands.</p>

        <h3>Initial State Analysis</h3>
        <ul>
          <li><strong>Production Efficiency:</strong> 72% overall equipment effectiveness (OEE)</li>
          <li><strong>Quality Issues:</strong> 3.2% defect rate</li>
          <li><strong>Maintenance Costs:</strong> $2.3M annually in unplanned repairs</li>
          <li><strong>Inventory Waste:</strong> 15% overstock, 8% stockouts</li>
        </ul>

        <h3>AI Solution Implementation</h3>
        
        <h4>Phase 1: Predictive Maintenance</h4>
        <ul>
          <li><strong>IoT Sensors:</strong> 200+ sensors monitoring vibration, temperature, pressure</li>
          <li><strong>ML Algorithms:</strong> Pattern recognition for failure prediction</li>
          <li><strong>Results:</strong> 60% reduction in unplanned downtime</li>
        </ul>

        <h4>Phase 2: Quality Control Automation</h4>
        <ul>
          <li><strong>Computer Vision:</strong> Real-time defect detection</li>
          <li><strong>Statistical Process Control:</strong> Automated quality adjustments</li>
          <li><strong>Results:</strong> Defect rate reduced to 0.8%</li>
        </ul>

        <h4>Phase 3: Production Optimization</h4>
        <ul>
          <li><strong>Demand Forecasting:</strong> AI-powered production planning</li>
          <li><strong>Resource Allocation:</strong> Dynamic scheduling optimization</li>
          <li><strong>Results:</strong> 28% improvement in throughput</li>
        </ul>

        <h3>Implementation Timeline & Costs</h3>
        <table class="w-full border-collapse border border-gray-300 my-4">
          <thead>
            <tr class="bg-gray-100">
              <th class="border border-gray-300 p-2">Phase</th>
              <th class="border border-gray-300 p-2">Duration</th>
              <th class="border border-gray-300 p-2">Investment</th>
              <th class="border border-gray-300 p-2">Annual Savings</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-gray-300 p-2">Predictive Maintenance</td>
              <td class="border border-gray-300 p-2">4 months</td>
              <td class="border border-gray-300 p-2">$180,000</td>
              <td class="border border-gray-300 p-2">$1,380,000</td>
            </tr>
            <tr>
              <td class="border border-gray-300 p-2">Quality Control</td>
              <td class="border border-gray-300 p-2">3 months</td>
              <td class="border border-gray-300 p-2">$120,000</td>
              <td class="border border-gray-300 p-2">$650,000</td>
            </tr>
            <tr>
              <td class="border border-gray-300 p-2">Production Optimization</td>
              <td class="border border-gray-300 p-2">5 months</td>
              <td class="border border-gray-300 p-2">$200,000</td>
              <td class="border border-gray-300 p-2">$890,000</td>
            </tr>
          </tbody>
        </table>

        <h3>Lessons Learned</h3>
        <h4>Critical Success Factors:</h4>
        <ol>
          <li><strong>Data Quality First:</strong> Invested 30% of budget in data infrastructure</li>
          <li><strong>Pilot Approach:</strong> Started with one production line</li>
          <li><strong>Employee Training:</strong> 40 hours of AI literacy training per employee</li>
          <li><strong>Continuous Monitoring:</strong> Weekly performance reviews and adjustments</li>
        </ol>

        <h4>Challenges Overcome:</h4>
        <ul>
          <li><strong>Legacy System Integration:</strong> Built API bridges for older equipment</li>
          <li><strong>Change Resistance:</strong> Created AI champions program</li>
          <li><strong>Data Silos:</strong> Implemented unified data platform</li>
        </ul>

        <h3>Final Results After 18 Months</h3>
        <ul>
          <li><strong>Overall Equipment Effectiveness:</strong> 72% → 89% (+24%)</li>
          <li><strong>Defect Rate:</strong> 3.2% → 0.8% (-75%)</li>
          <li><strong>Maintenance Costs:</strong> $2.3M → $1.1M (-52%)</li>
          <li><strong>Total ROI:</strong> 376% in first year</li>
        </ul>
      `,
      category: "Case Studies",
      author: "Jennifer Martinez",
      date: "2025-01-05",
      readTime: "12 min read",
      tags: ["Process Optimization", "Manufacturing", "AI Implementation", "Efficiency"],
      image: "https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=800&h=400&fit=crop",
      featured: false,
      seoKeywords: "AI process optimization, manufacturing efficiency, predictive maintenance, quality control automation"
    },
    {
      id: 6,
      title: "AI Training Revolution: Upskilling Your Workforce for the Future",
      slug: "ai-training-upskilling-workforce-future",
      excerpt: "Transform your team into AI-powered professionals. Our proven training methodology has upskilled 5,000+ employees across 200+ companies.",
      content: `
        <h2>The AI Skills Gap Crisis</h2>
        <p>85% of companies report difficulty finding AI-skilled workers. The solution? Transform your existing workforce into AI professionals.</p>

        <h3>The Orgainse AI Training Framework</h3>
        
        <h4>Level 1: AI Literacy (All Employees - 8 hours)</h4>
        <ul>
          <li><strong>AI Fundamentals:</strong> What is AI and how does it work?</li>
          <li><strong>Business Applications:</strong> AI use cases in your industry</li>
          <li><strong>Ethical Considerations:</strong> Responsible AI development and use</li>
          <li><strong>Hands-on Experience:</strong> Using AI tools in daily work</li>
        </ul>

        <h4>Level 2: AI Application (Power Users - 24 hours)</h4>
        <ul>
          <li><strong>Tool Proficiency:</strong> Advanced features of AI platforms</li>
          <li><strong>Data Analysis:</strong> Using AI for insights and predictions</li>
          <li><strong>Process Integration:</strong> Embedding AI in workflows</li>
          <li><strong>Quality Assurance:</strong> Validating AI outputs</li>
        </ul>

        <h4>Level 3: AI Development (Technical Teams - 80 hours)</h4>
        <ul>
          <li><strong>Machine Learning:</strong> Algorithm selection and training</li>
          <li><strong>Data Engineering:</strong> Pipeline design and optimization</li>
          <li><strong>Model Deployment:</strong> Production systems and monitoring</li>
          <li><strong>Advanced Applications:</strong> Custom AI solution development</li>
        </ul>

        <h3>Training Success Stories</h3>
        
        <h4>Global Insurance Company (2,800 employees)</h4>
        <ul>
          <li><strong>Challenge:</strong> Manual claims processing taking 14 days average</li>
          <li><strong>Training Focus:</strong> Claims adjusters on AI-assisted evaluation</li>
          <li><strong>Results:</strong> 
            <ul>
              <li>Processing time reduced to 3 days</li>
              <li>Accuracy improved by 35%</li>
              <li>Employee satisfaction increased 40%</li>
            </ul>
          </li>
        </ul>

        <h4>Regional Healthcare Network (1,200 employees)</h4>
        <ul>
          <li><strong>Challenge:</strong> Administrative burden reducing patient care time</li>
          <li><strong>Training Focus:</strong> AI-powered clinical documentation</li>
          <li><strong>Results:</strong>
            <ul>
              <li>Documentation time reduced by 60%</li>
              <li>Patient interaction time increased by 45%</li>
              <li>Staff burnout decreased by 30%</li>
            </ul>
          </li>
        </ul>

        <h3>Training Delivery Methods</h3>
        
        <h4>Blended Learning Approach:</h4>
        <ul>
          <li><strong>Online Modules:</strong> Self-paced foundational content</li>
          <li><strong>Virtual Workshops:</strong> Interactive skill-building sessions</li>
          <li><strong>Hands-on Labs:</strong> Real-world project experience</li>
          <li><strong>Mentorship Program:</strong> Ongoing support and guidance</li>
        </ul>

        <h4>Customization by Role:</h4>
        <ul>
          <li><strong>Executives:</strong> Strategic AI planning and ROI measurement</li>
          <li><strong>Managers:</strong> Team leadership in AI adoption</li>
          <li><strong>Individual Contributors:</strong> Daily AI tool usage</li>
          <li><strong>IT Teams:</strong> Technical implementation and support</li>
        </ul>

        <h3>Measuring Training Impact</h3>
        
        <h4>Immediate Metrics (0-3 months):</h4>
        <ul>
          <li>Training completion rates</li>
          <li>Skill assessment scores</li>
          <li>Tool adoption rates</li>
          <li>Employee confidence surveys</li>
        </ul>

        <h4>Business Impact Metrics (3-12 months):</h4>
        <ul>
          <li>Process efficiency improvements</li>
          <li>Error rate reductions</li>
          <li>Innovation project launches</li>
          <li>Employee retention rates</li>
        </ul>

        <h3>Implementation Roadmap</h3>
        
        <h4>Phase 1: Assessment & Planning (Month 1)</h4>
        <ul>
          <li>Current skill level evaluation</li>
          <li>Training needs analysis</li>
          <li>Custom curriculum development</li>
          <li>Success metrics definition</li>
        </ul>

        <h4>Phase 2: Foundation Training (Months 2-3)</h4>
        <ul>
          <li>AI literacy for all employees</li>
          <li>Leadership alignment sessions</li>
          <li>Quick wins identification</li>
          <li>Champion network establishment</li>
        </ul>

        <h4>Phase 3: Skill Development (Months 4-8)</h4>
        <ul>
          <li>Role-specific training delivery</li>
          <li>Practical project implementation</li>
          <li>Progress monitoring and adjustment</li>
          <li>Peer learning facilitation</li>
        </ul>

        <h4>Phase 4: Continuous Learning (Ongoing)</h4>
        <ul>
          <li>Advanced skill development</li>
          <li>New technology updates</li>
          <li>Best practice sharing</li>
          <li>Innovation project support</li>
        </ul>
      `,
      category: "Training",
      author: "Dr. David Park",
      date: "2025-01-03",
      readTime: "14 min read",
      tags: ["AI Training", "Workforce Development", "Upskilling", "Change Management"],
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
      featured: false,
      seoKeywords: "AI training programs, workforce upskilling, artificial intelligence education, employee development"
    }
  ];

  const categories = ['All', 'Case Studies', 'Strategy', 'Analytics', 'Digital Transformation', 'Training'];

  useEffect(() => {
    setPosts(blogPosts);
    setFilteredPosts(blogPosts);
  }, []);

  useEffect(() => {
    let filtered = posts;
    
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredPosts(filtered);
  }, [selectedCategory, searchTerm, posts]);

  const featuredPosts = posts.filter(post => post.featured);

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Article Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <button
              onClick={() => setSelectedPost(null)}
              className="flex items-center text-orange-600 hover:text-orange-700 mb-6"
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Back to Blog
            </button>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{selectedPost.title}</h1>
            
            <div className="flex items-center text-gray-600 mb-6">
              <User className="w-4 h-4 mr-2" />
              <span className="mr-4">{selectedPost.author}</span>
              <Calendar className="w-4 h-4 mr-2" />
              <span className="mr-4">{new Date(selectedPost.date).toLocaleDateString()}</span>
              <Clock className="w-4 h-4 mr-2" />
              <span>{selectedPost.readTime}</span>
            </div>
            
            <img
              src={selectedPost.image}
              alt={selectedPost.title}
              className="w-full h-64 object-cover rounded-lg mb-8"
            />
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedPost.content }}
            />
            
            {/* Tags */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {selectedPost.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-12 p-6 bg-gradient-to-r from-orange-50 to-green-50 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Transform Your Business?</h3>
              <p className="text-gray-600 mb-4">
                Get personalized AI strategy recommendations based on your specific needs and industry.
              </p>
              <div className="flex space-x-4">
                <button className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                  Get Free Consultation
                </button>
                <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
                  Take AI Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blog Header */}
      <div className="bg-gradient-to-r from-orange-500 to-green-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">AI Transformation Insights</h1>
          <p className="text-xl opacity-90">
            Expert insights, case studies, and practical guides for your AI journey
          </p>
        </div>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Articles</h2>
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {featuredPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform"
                onClick={() => setSelectedPost(post)}
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs mr-2">
                      {post.category}
                    </span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="w-4 h-4 mr-1" />
                      <span>{post.author}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-orange-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedPost(post)}
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs mr-2">
                    {post.category}
                  </span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="w-4 h-4 mr-1" />
                    <span>{post.author}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-orange-500" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search terms or category filter.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogSystem;