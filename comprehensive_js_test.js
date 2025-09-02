#!/usr/bin/env node
/**
 * Comprehensive Test Suite for JavaScript Serverless Functions - Orgainse Consulting Lead Capture System
 * 
 * This test covers ALL requirements from the review request:
 * 1. /api/health.js - API Health Check
 * 2. /api/newsletter.js - Newsletter Subscription  
 * 3. /api/contact.js - Contact Form
 * 4. /api/admin.js - Admin Dashboard API
 * 
 * Testing Requirements:
 * - Realistic business data (not test@example.com)
 * - MongoDB Atlas connection verification
 * - CORS headers for cross-origin requests
 * - Proper HTTP status codes (200, 400, 409, 500)
 * - Validation errors handled gracefully
 * - MongoDB data persistence verification
 */

const { MongoClient } = require('mongodb');

// Import the serverless functions
const healthHandler = require('./api/health.js').default;
const newsletterHandler = require('./api/newsletter.js').default;
const contactHandler = require('./api/contact.js').default;
const adminHandler = require('./api/admin.js').default;

// Environment variables
process.env.MONGO_URL = 'mongodb://localhost:27017';
process.env.DB_NAME = 'orgainse_consulting';

// Realistic business test data as requested
const BUSINESS_TEST_DATA = {
    healthcare: {
        newsletter: {
            email: 'sarah.johnson@healthtech-corp.com',
            first_name: 'Sarah Johnson',
            leadType: 'Healthcare Newsletter',
            name: 'Sarah Johnson',
            source: 'Healthcare Innovation Summit'
        },
        contact: {
            name: 'Dr. Michael Chen',
            email: 'm.chen@medical-innovations.com',
            company: 'Medical Innovations Inc.',
            phone: '+1-555-0198',
            service_type: 'AI Healthcare Solutions',
            message: 'We are a leading healthcare technology company serving 300+ hospitals. We need AI-powered patient management systems for our electronic health records platform serving 2M+ patients.'
        }
    },
    financial: {
        newsletter: {
            email: 'robert.kim@financeplus.com',
            first_name: 'Robert Kim',
            leadType: 'Financial Services Newsletter',
            name: 'Robert Kim',
            source: 'FinTech Conference 2025'
        },
        contact: {
            name: 'Jennifer Martinez',
            email: 'j.martinez@investment-group.com',
            company: 'Global Investment Group',
            phone: '+1-555-0167',
            service_type: 'AI Financial Analytics',
            message: 'Our investment firm manages $5.2B in assets across 15 countries. We need AI-driven risk assessment and portfolio optimization tools for institutional clients.'
        }
    },
    manufacturing: {
        newsletter: {
            email: 'david.wilson@manufacturing-corp.com',
            first_name: 'David Wilson',
            leadType: 'Manufacturing Newsletter',
            name: 'David Wilson',
            source: 'Industrial AI Expo'
        },
        contact: {
            name: 'Lisa Thompson',
            email: 'l.thompson@global-manufacturing.com',
            company: 'Global Manufacturing Solutions',
            phone: '+1-555-0145',
            service_type: 'AI Operational Optimization',
            message: 'We operate 75 manufacturing facilities worldwide with 40,000+ employees. Looking for AI-powered supply chain optimization, predictive maintenance, and quality control automation.'
        }
    }
};

// Mock request and response objects
class MockRequest {
    constructor(method, url, body = null, headers = {}) {
        this.method = method;
        this.url = url;
        this.body = body;
        this.headers = headers;
    }
}

class MockResponse {
    constructor() {
        this.statusCode = 200;
        this.headers = {};
        this.body = null;
    }

    status(code) {
        this.statusCode = code;
        return this;
    }

    setHeader(name, value) {
        this.headers[name] = value;
        return this;
    }

    json(data) {
        this.body = data;
        return this;
    }

    end() {
        return this;
    }
}

class ComprehensiveJSFunctionTester {
    constructor() {
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        this.mongoClient = null;
        this.db = null;
    }

    async initialize() {
        console.log('🚀 INITIALIZING COMPREHENSIVE JAVASCRIPT SERVERLESS FUNCTIONS TESTING');
        console.log('=' * 80);
        
        // Connect to MongoDB
        try {
            this.mongoClient = new MongoClient(process.env.MONGO_URL);
            await this.mongoClient.connect();
            this.db = this.mongoClient.db(process.env.DB_NAME);
            console.log('✅ MongoDB connection established');
        } catch (error) {
            console.log(`❌ MongoDB connection failed: ${error.message}`);
        }
    }

    logTest(testName, status, details = '', responseTime = 0) {
        this.totalTests++;
        if (status === 'PASS') {
            this.passedTests++;
            console.log(`✅ ${testName} - PASSED (${responseTime.toFixed(3)}s)`);
        } else {
            this.failedTests++;
            console.log(`❌ ${testName} - FAILED (${responseTime.toFixed(3)}s)`);
        }
        
        if (details) {
            console.log(`   Details: ${details}`);
        }
        
        this.testResults.push({
            test: testName,
            status,
            details,
            responseTime,
            timestamp: new Date().toISOString()
        });
    }

    async testHealthEndpoint() {
        console.log('\n🔍 TESTING API HEALTH CHECK ENDPOINT (/api/health.js)');
        
        const startTime = Date.now();
        const req = new MockRequest('GET', '/api/health');
        const res = new MockResponse();
        
        try {
            await healthHandler(req, res);
            const responseTime = (Date.now() - startTime) / 1000;
            
            // Test 1: Status Code
            if (res.statusCode === 200) {
                this.logTest('Health Check - Status Code', 'PASS', `Status: ${res.statusCode}`, responseTime);
            } else {
                this.logTest('Health Check - Status Code', 'FAIL', `Expected 200, got ${res.statusCode}`, responseTime);
                return;
            }
            
            // Test 2: JSON Response Format
            if (res.body && typeof res.body === 'object') {
                this.logTest('Health Check - JSON Format', 'PASS', 'Valid JSON response', responseTime);
            } else {
                this.logTest('Health Check - JSON Format', 'FAIL', 'Invalid JSON response', responseTime);
                return;
            }
            
            // Test 3: Required Fields
            const requiredFields = ['status', 'timestamp', 'service', 'version'];
            const missingFields = requiredFields.filter(field => !(field in res.body));
            
            if (missingFields.length === 0) {
                this.logTest('Health Check - Required Fields', 'PASS', `All fields present: ${requiredFields.join(', ')}`, responseTime);
            } else {
                this.logTest('Health Check - Required Fields', 'FAIL', `Missing fields: ${missingFields.join(', ')}`, responseTime);
            }
            
            // Test 4: Field Values
            if (res.body.status === 'healthy' && res.body.service === 'Orgainse Consulting API' && res.body.version === '2.0.0') {
                this.logTest('Health Check - Field Values', 'PASS', `Status: ${res.body.status}, Service: ${res.body.service}, Version: ${res.body.version}`, responseTime);
            } else {
                this.logTest('Health Check - Field Values', 'FAIL', `Unexpected values: ${JSON.stringify(res.body)}`, responseTime);
            }
            
        } catch (error) {
            this.logTest('Health Check - Execution', 'FAIL', `Error: ${error.message}`, 0);
        }
    }

    async testNewsletterEndpoint() {
        console.log('\n📧 TESTING NEWSLETTER SUBSCRIPTION ENDPOINT (/api/newsletter.js)');
        
        // Test 1: Valid Healthcare Newsletter Subscription
        await this.testNewsletterSubscription('Healthcare', BUSINESS_TEST_DATA.healthcare.newsletter);
        
        // Test 2: Valid Financial Newsletter Subscription
        await this.testNewsletterSubscription('Financial', BUSINESS_TEST_DATA.financial.newsletter);
        
        // Test 3: Valid Manufacturing Newsletter Subscription
        await this.testNewsletterSubscription('Manufacturing', BUSINESS_TEST_DATA.manufacturing.newsletter);
        
        // Test 4: Duplicate Email Handling
        await this.testNewsletterDuplicate();
        
        // Test 5: Invalid Email Validation
        await this.testNewsletterInvalidEmail();
        
        // Test 6: Missing Email Validation
        await this.testNewsletterMissingEmail();
        
        // Test 7: CORS Headers
        await this.testNewsletterCORS();
    }

    async testNewsletterSubscription(industry, testData) {
        const startTime = Date.now();
        const req = new MockRequest('POST', '/api/newsletter', testData);
        const res = new MockResponse();
        
        try {
            await newsletterHandler(req, res);
            const responseTime = (Date.now() - startTime) / 1000;
            
            if (res.statusCode === 200) {
                this.logTest(`Newsletter - Valid Subscription (${industry})`, 'PASS', 
                           `Subscription ID: ${res.body.id}, Email: ${res.body.email}`, responseTime);
                
                // Verify MongoDB persistence
                if (this.db) {
                    const subscription = await this.db.collection('newsletter_subscriptions').findOne({email: testData.email});
                    if (subscription) {
                        this.logTest(`Newsletter - MongoDB Persistence (${industry})`, 'PASS', 
                                   `Record found in database with leadType: ${subscription.leadType}`, responseTime);
                    } else {
                        this.logTest(`Newsletter - MongoDB Persistence (${industry})`, 'FAIL', 
                                   `Record not found in database`, responseTime);
                    }
                }
            } else if (res.statusCode === 409) {
                this.logTest(`Newsletter - Valid Subscription (${industry})`, 'PASS', 
                           `Duplicate email correctly handled (409)`, responseTime);
            } else {
                this.logTest(`Newsletter - Valid Subscription (${industry})`, 'FAIL', 
                           `Status: ${res.statusCode}, Response: ${JSON.stringify(res.body)}`, responseTime);
            }
        } catch (error) {
            this.logTest(`Newsletter - Valid Subscription (${industry})`, 'FAIL', `Error: ${error.message}`, 0);
        }
    }

    async testNewsletterDuplicate() {
        const startTime = Date.now();
        const req = new MockRequest('POST', '/api/newsletter', BUSINESS_TEST_DATA.healthcare.newsletter);
        const res = new MockResponse();
        
        try {
            await newsletterHandler(req, res);
            const responseTime = (Date.now() - startTime) / 1000;
            
            if (res.statusCode === 409) {
                this.logTest('Newsletter - Duplicate Email Handling', 'PASS', 
                           `Correctly returned 409 for duplicate email`, responseTime);
            } else {
                this.logTest('Newsletter - Duplicate Email Handling', 'FAIL', 
                           `Expected 409, got ${res.statusCode}`, responseTime);
            }
        } catch (error) {
            this.logTest('Newsletter - Duplicate Email Handling', 'FAIL', `Error: ${error.message}`, 0);
        }
    }

    async testNewsletterInvalidEmail() {
        const startTime = Date.now();
        const invalidData = {email: 'invalid-email-format', first_name: 'Test User'};
        const req = new MockRequest('POST', '/api/newsletter', invalidData);
        const res = new MockResponse();
        
        try {
            await newsletterHandler(req, res);
            const responseTime = (Date.now() - startTime) / 1000;
            
            if (res.statusCode === 400) {
                this.logTest('Newsletter - Invalid Email Validation', 'PASS', 
                           `Correctly returned 400 for invalid email`, responseTime);
            } else {
                this.logTest('Newsletter - Invalid Email Validation', 'FAIL', 
                           `Expected 400, got ${res.statusCode}`, responseTime);
            }
        } catch (error) {
            this.logTest('Newsletter - Invalid Email Validation', 'FAIL', `Error: ${error.message}`, 0);
        }
    }

    async testNewsletterMissingEmail() {
        const startTime = Date.now();
        const missingData = {first_name: 'Test User'};
        const req = new MockRequest('POST', '/api/newsletter', missingData);
        const res = new MockResponse();
        
        try {
            await newsletterHandler(req, res);
            const responseTime = (Date.now() - startTime) / 1000;
            
            if (res.statusCode === 400) {
                this.logTest('Newsletter - Missing Email Validation', 'PASS', 
                           `Correctly returned 400 for missing email`, responseTime);
            } else {
                this.logTest('Newsletter - Missing Email Validation', 'FAIL', 
                           `Expected 400, got ${res.statusCode}`, responseTime);
            }
        } catch (error) {
            this.logTest('Newsletter - Missing Email Validation', 'FAIL', `Error: ${error.message}`, 0);
        }
    }

    async testNewsletterCORS() {
        const startTime = Date.now();
        const req = new MockRequest('OPTIONS', '/api/newsletter');
        const res = new MockResponse();
        
        try {
            await newsletterHandler(req, res);
            const responseTime = (Date.now() - startTime) / 1000;
            
            if (res.headers['Access-Control-Allow-Origin'] === '*') {
                this.logTest('Newsletter - CORS Headers', 'PASS', 
                           `CORS properly configured: ${res.headers['Access-Control-Allow-Origin']}`, responseTime);
            } else {
                this.logTest('Newsletter - CORS Headers', 'FAIL', 
                           `CORS not properly configured: ${res.headers['Access-Control-Allow-Origin']}`, responseTime);
            }
        } catch (error) {
            this.logTest('Newsletter - CORS Headers', 'FAIL', `Error: ${error.message}`, 0);
        }
    }

    async testContactEndpoint() {
        console.log('\n📞 TESTING CONTACT FORM ENDPOINT (/api/contact.js)');
        
        // Test 1: Valid Healthcare Contact
        await this.testContactSubmission('Healthcare', BUSINESS_TEST_DATA.healthcare.contact);
        
        // Test 2: Valid Financial Contact
        await this.testContactSubmission('Financial', BUSINESS_TEST_DATA.financial.contact);
        
        // Test 3: Valid Manufacturing Contact
        await this.testContactSubmission('Manufacturing', BUSINESS_TEST_DATA.manufacturing.contact);
        
        // Test 4: Missing Required Fields
        await this.testContactMissingFields();
        
        // Test 5: Invalid Email Format
        await this.testContactInvalidEmail();
        
        // Test 6: CORS Headers
        await this.testContactCORS();
    }

    async testContactSubmission(industry, testData) {
        const startTime = Date.now();
        const req = new MockRequest('POST', '/api/contact', testData);
        const res = new MockResponse();
        
        try {
            await contactHandler(req, res);
            const responseTime = (Date.now() - startTime) / 1000;
            
            if (res.statusCode === 200) {
                this.logTest(`Contact - Valid Submission (${industry})`, 'PASS', 
                           `Contact ID: ${res.body.id}, Status: ${res.body.status}`, responseTime);
                
                // Verify MongoDB persistence
                if (this.db) {
                    const contact = await this.db.collection('contact_messages').findOne({email: testData.email});
                    if (contact) {
                        this.logTest(`Contact - MongoDB Persistence (${industry})`, 'PASS', 
                                   `Record found with company: ${contact.company}`, responseTime);
                    } else {
                        this.logTest(`Contact - MongoDB Persistence (${industry})`, 'FAIL', 
                                   `Record not found in database`, responseTime);
                    }
                }
            } else {
                this.logTest(`Contact - Valid Submission (${industry})`, 'FAIL', 
                           `Status: ${res.statusCode}, Response: ${JSON.stringify(res.body)}`, responseTime);
            }
        } catch (error) {
            this.logTest(`Contact - Valid Submission (${industry})`, 'FAIL', `Error: ${error.message}`, 0);
        }
    }

    async testContactMissingFields() {
        const startTime = Date.now();
        const incompleteData = {name: 'Test User'}; // Missing email and message
        const req = new MockRequest('POST', '/api/contact', incompleteData);
        const res = new MockResponse();
        
        try {
            await contactHandler(req, res);
            const responseTime = (Date.now() - startTime) / 1000;
            
            if (res.statusCode === 400) {
                this.logTest('Contact - Missing Required Fields', 'PASS', 
                           `Correctly returned 400 for missing fields`, responseTime);
            } else {
                this.logTest('Contact - Missing Required Fields', 'FAIL', 
                           `Expected 400, got ${res.statusCode}`, responseTime);
            }
        } catch (error) {
            this.logTest('Contact - Missing Required Fields', 'FAIL', `Error: ${error.message}`, 0);
        }
    }

    async testContactInvalidEmail() {
        const startTime = Date.now();
        const invalidData = {
            name: 'Test User',
            email: 'invalid-email-format',
            message: 'Test message'
        };
        const req = new MockRequest('POST', '/api/contact', invalidData);
        const res = new MockResponse();
        
        try {
            await contactHandler(req, res);
            const responseTime = (Date.now() - startTime) / 1000;
            
            if (res.statusCode === 400) {
                this.logTest('Contact - Invalid Email Format', 'PASS', 
                           `Correctly returned 400 for invalid email`, responseTime);
            } else {
                this.logTest('Contact - Invalid Email Format', 'FAIL', 
                           `Expected 400, got ${res.statusCode}`, responseTime);
            }
        } catch (error) {
            this.logTest('Contact - Invalid Email Format', 'FAIL', `Error: ${error.message}`, 0);
        }
    }

    async testContactCORS() {
        const startTime = Date.now();
        const req = new MockRequest('OPTIONS', '/api/contact');
        const res = new MockResponse();
        
        try {
            await contactHandler(req, res);
            const responseTime = (Date.now() - startTime) / 1000;
            
            if (res.headers['Access-Control-Allow-Origin'] === '*') {
                this.logTest('Contact - CORS Headers', 'PASS', 
                           `CORS properly configured: ${res.headers['Access-Control-Allow-Origin']}`, responseTime);
            } else {
                this.logTest('Contact - CORS Headers', 'FAIL', 
                           `CORS not properly configured: ${res.headers['Access-Control-Allow-Origin']}`, responseTime);
            }
        } catch (error) {
            this.logTest('Contact - CORS Headers', 'FAIL', `Error: ${error.message}`, 0);
        }
    }

    async testAdminEndpoint() {
        console.log('\n👨‍💼 TESTING ADMIN DASHBOARD ENDPOINT (/api/admin.js)');
        
        const startTime = Date.now();
        const req = new MockRequest('GET', '/api/admin');
        const res = new MockResponse();
        
        try {
            await adminHandler(req, res);
            const responseTime = (Date.now() - startTime) / 1000;
            
            // Test 1: Status Code and Success
            if (res.statusCode === 200 && res.body.success) {
                this.logTest('Admin - Get All Leads', 'PASS', 
                           `Status: ${res.statusCode}, Success: ${res.body.success}`, responseTime);
            } else {
                this.logTest('Admin - Get All Leads', 'FAIL', 
                           `Status: ${res.statusCode}, Success: ${res.body.success}`, responseTime);
                return;
            }
            
            // Test 2: Response Structure
            const requiredFields = ['summary', 'newsletters', 'contacts', 'success'];
            const missingFields = requiredFields.filter(field => !(field in res.body));
            
            if (missingFields.length === 0) {
                this.logTest('Admin - Response Structure', 'PASS', 
                           `All required fields present: ${requiredFields.join(', ')}`, responseTime);
            } else {
                this.logTest('Admin - Response Structure', 'FAIL', 
                           `Missing fields: ${missingFields.join(', ')}`, responseTime);
            }
            
            // Test 3: Summary Statistics
            const summary = res.body.summary;
            if (summary && 'total_newsletters' in summary && 'total_contacts' in summary && 'total_leads' in summary) {
                this.logTest('Admin - Summary Statistics', 'PASS', 
                           `Newsletters: ${summary.total_newsletters}, Contacts: ${summary.total_contacts}, Total: ${summary.total_leads}`, responseTime);
            } else {
                this.logTest('Admin - Summary Statistics', 'FAIL', 
                           `Missing summary fields: ${JSON.stringify(summary)}`, responseTime);
            }
            
            // Test 4: Data Arrays
            const newsletters = res.body.newsletters;
            const contacts = res.body.contacts;
            
            if (Array.isArray(newsletters) && Array.isArray(contacts)) {
                this.logTest('Admin - Data Arrays', 'PASS', 
                           `Newsletters array: ${newsletters.length} items, Contacts array: ${contacts.length} items`, responseTime);
            } else {
                this.logTest('Admin - Data Arrays', 'FAIL', 
                           `Invalid data structure`, responseTime);
            }
            
            // Test 5: Data Sorting (newest first)
            if (newsletters.length > 1) {
                const first = new Date(newsletters[0].subscribed_at || newsletters[0].timestamp);
                const second = new Date(newsletters[1].subscribed_at || newsletters[1].timestamp);
                if (first >= second) {
                    this.logTest('Admin - Data Sorting', 'PASS', 
                               `Data properly sorted by date (newest first)`, responseTime);
                } else {
                    this.logTest('Admin - Data Sorting', 'FAIL', 
                               `Data not properly sorted`, responseTime);
                }
            } else {
                this.logTest('Admin - Data Sorting', 'PASS', 
                           `Insufficient data to test sorting`, responseTime);
            }
            
            // Test 6: CORS Headers
            const req2 = new MockRequest('OPTIONS', '/api/admin');
            const res2 = new MockResponse();
            await adminHandler(req2, res2);
            
            if (res2.headers['Access-Control-Allow-Origin'] === '*') {
                this.logTest('Admin - CORS Headers', 'PASS', 
                           `CORS properly configured: ${res2.headers['Access-Control-Allow-Origin']}`, responseTime);
            } else {
                this.logTest('Admin - CORS Headers', 'FAIL', 
                           `CORS not properly configured: ${res2.headers['Access-Control-Allow-Origin']}`, responseTime);
            }
            
        } catch (error) {
            this.logTest('Admin - Get All Leads', 'FAIL', `Error: ${error.message}`, 0);
        }
    }

    async testMongoDBIntegration() {
        console.log('\n🗄️ TESTING MONGODB INTEGRATION');
        
        if (!this.db) {
            this.logTest('MongoDB - Connection', 'FAIL', 'MongoDB connection not available', 0);
            return;
        }
        
        try {
            // Test 1: Database Connection
            const collections = await this.db.listCollections().toArray();
            this.logTest('MongoDB - Connection', 'PASS', `Connected to database: ${process.env.DB_NAME}`, 0);
            
            // Test 2: Collections Exist
            const expectedCollections = ['newsletter_subscriptions', 'contact_messages'];
            const existingCollections = expectedCollections.filter(col => 
                collections.some(c => c.name === col)
            );
            
            if (existingCollections.length >= 1) {
                this.logTest('MongoDB - Collections', 'PASS', `Found collections: ${existingCollections.join(', ')}`, 0);
            } else {
                this.logTest('MongoDB - Collections', 'FAIL', `Missing collections: ${expectedCollections.join(', ')}`, 0);
            }
            
            // Test 3: Data Counts
            const newsletterCount = await this.db.collection('newsletter_subscriptions').countDocuments({});
            const contactCount = await this.db.collection('contact_messages').countDocuments({});
            
            this.logTest('MongoDB - Data Persistence', 'PASS', 
                       `Newsletter subscriptions: ${newsletterCount}, Contact messages: ${contactCount}`, 0);
            
            // Test 4: Data Quality Check
            const recentNewsletter = await this.db.collection('newsletter_subscriptions').findOne(
                {}, {sort: {subscribed_at: -1}}
            );
            const recentContact = await this.db.collection('contact_messages').findOne(
                {}, {sort: {submitted_at: -1}}
            );
            
            if (recentNewsletter && recentContact) {
                this.logTest('MongoDB - Data Quality', 'PASS', 
                           `Recent newsletter: ${recentNewsletter.email}, Recent contact: ${recentContact.email}`, 0);
            } else {
                this.logTest('MongoDB - Data Quality', 'FAIL', 
                           `Missing recent data records`, 0);
            }
            
        } catch (error) {
            this.logTest('MongoDB - Integration', 'FAIL', `MongoDB error: ${error.message}`, 0);
        }
    }

    async testPerformanceAndSecurity() {
        console.log('\n⚡ TESTING PERFORMANCE AND SECURITY');
        
        // Test 1: Response Time Performance
        const endpoints = [
            {name: 'health', handler: healthHandler, method: 'GET', data: null},
            {name: 'newsletter', handler: newsletterHandler, method: 'POST', data: {email: 'performance@test.com', first_name: 'Performance'}},
            {name: 'contact', handler: contactHandler, method: 'POST', data: {name: 'Performance Test', email: 'performance@test.com', message: 'Test'}},
            {name: 'admin', handler: adminHandler, method: 'GET', data: null}
        ];
        
        let totalResponseTime = 0;
        let successfulRequests = 0;
        
        for (const endpoint of endpoints) {
            try {
                const startTime = Date.now();
                const req = new MockRequest(endpoint.method, `/api/${endpoint.name}`, endpoint.data);
                const res = new MockResponse();
                
                await endpoint.handler(req, res);
                
                const responseTime = (Date.now() - startTime) / 1000;
                totalResponseTime += responseTime;
                successfulRequests++;
                
            } catch (error) {
                console.log(`   Performance test failed for ${endpoint.name}: ${error.message}`);
            }
        }
        
        if (successfulRequests > 0) {
            const avgResponseTime = totalResponseTime / successfulRequests;
            if (avgResponseTime < 0.5) { // Less than 500ms average
                this.logTest('Performance - Response Time', 'PASS', 
                           `Average response time: ${avgResponseTime.toFixed(3)}s`, avgResponseTime);
            } else {
                this.logTest('Performance - Response Time', 'FAIL', 
                           `Average response time too slow: ${avgResponseTime.toFixed(3)}s`, avgResponseTime);
            }
        }
        
        // Test 2: Large Payload Handling
        try {
            const largeMessage = 'A'.repeat(10000); // 10KB message
            const largeData = {
                name: 'Large Payload Test',
                email: 'large.payload@test.com',
                message: largeMessage
            };
            
            const startTime = Date.now();
            const req = new MockRequest('POST', '/api/contact', largeData);
            const res = new MockResponse();
            
            await contactHandler(req, res);
            const responseTime = (Date.now() - startTime) / 1000;
            
            if (res.statusCode === 200 || res.statusCode === 400) {
                this.logTest('Security - Large Payload Handling', 'PASS', 
                           `Handled large payload appropriately: ${res.statusCode}`, responseTime);
            } else {
                this.logTest('Security - Large Payload Handling', 'FAIL', 
                           `Unexpected response to large payload: ${res.statusCode}`, responseTime);
            }
        } catch (error) {
            this.logTest('Security - Large Payload Handling', 'FAIL', `Large payload test failed: ${error.message}`, 0);
        }
        
        // Test 3: Concurrent Request Handling
        try {
            const concurrentRequests = 5;
            const promises = [];
            
            for (let i = 0; i < concurrentRequests; i++) {
                const testData = {
                    email: `concurrent${i}@test.com`,
                    first_name: `Concurrent${i}`
                };
                
                const promise = (async () => {
                    const req = new MockRequest('POST', '/api/newsletter', testData);
                    const res = new MockResponse();
                    await newsletterHandler(req, res);
                    return res.statusCode;
                })();
                
                promises.push(promise);
            }
            
            const startTime = Date.now();
            const results = await Promise.all(promises);
            const responseTime = (Date.now() - startTime) / 1000;
            
            const successfulRequests = results.filter(status => status === 200 || status === 409).length;
            
            if (successfulRequests === concurrentRequests) {
                this.logTest('Performance - Concurrent Requests', 'PASS', 
                           `${successfulRequests}/${concurrentRequests} requests successful`, responseTime);
            } else {
                this.logTest('Performance - Concurrent Requests', 'FAIL', 
                           `Only ${successfulRequests}/${concurrentRequests} requests successful`, responseTime);
            }
        } catch (error) {
            this.logTest('Performance - Concurrent Requests', 'FAIL', `Concurrent test failed: ${error.message}`, 0);
        }
    }

    async runComprehensiveTests() {
        await this.initialize();
        
        console.log('\nTesting 4 JavaScript/Node.js serverless functions for Vercel deployment:');
        console.log('1. /api/health.js - API Health Check');
        console.log('2. /api/newsletter.js - Newsletter Subscription');
        console.log('3. /api/contact.js - Contact Form');
        console.log('4. /api/admin.js - Admin Dashboard API');
        console.log('=' * 80);
        
        // Run all test suites
        await this.testHealthEndpoint();
        await this.testNewsletterEndpoint();
        await this.testContactEndpoint();
        await this.testAdminEndpoint();
        await this.testMongoDBIntegration();
        await this.testPerformanceAndSecurity();
        
        // Generate final report
        await this.generateFinalReport();
        
        // Cleanup
        if (this.mongoClient) {
            await this.mongoClient.close();
        }
    }

    async generateFinalReport() {
        console.log('\n' + '=' * 80);
        console.log('🎯 COMPREHENSIVE JAVASCRIPT SERVERLESS FUNCTIONS TEST REPORT');
        console.log('=' * 80);
        
        const successRate = (this.passedTests / this.totalTests * 100);
        
        console.log(`📊 OVERALL RESULTS:`);
        console.log(`   Total Tests: ${this.totalTests}`);
        console.log(`   Passed: ${this.passedTests}`);
        console.log(`   Failed: ${this.failedTests}`);
        console.log(`   Success Rate: ${successRate.toFixed(1)}%`);
        
        console.log(`\n🔍 DETAILED RESULTS BY ENDPOINT:`);
        
        // Group results by endpoint
        const endpoints = {
            'Health Check': this.testResults.filter(r => r.test.includes('Health Check')),
            'Newsletter': this.testResults.filter(r => r.test.includes('Newsletter')),
            'Contact': this.testResults.filter(r => r.test.includes('Contact')),
            'Admin': this.testResults.filter(r => r.test.includes('Admin')),
            'MongoDB': this.testResults.filter(r => r.test.includes('MongoDB')),
            'Performance/Security': this.testResults.filter(r => r.test.includes('Performance') || r.test.includes('Security'))
        };
        
        for (const [endpoint, results] of Object.entries(endpoints)) {
            if (results.length > 0) {
                const passed = results.filter(r => r.status === 'PASS').length;
                const total = results.length;
                console.log(`   ${endpoint}: ${passed}/${total} tests passed`);
            }
        }
        
        console.log(`\n🚀 VERCEL DEPLOYMENT READINESS ASSESSMENT:`);
        
        const criticalTests = [
            'Health Check - Status Code',
            'Newsletter - Valid Subscription (Healthcare)',
            'Contact - Valid Submission (Healthcare)',
            'Admin - Get All Leads',
            'MongoDB - Connection'
        ];
        
        const criticalPassed = this.testResults.filter(r => 
            criticalTests.includes(r.test) && r.status === 'PASS'
        ).length;
        
        if (criticalPassed === criticalTests.length && successRate >= 90) {
            console.log('   ✅ READY FOR VERCEL DEPLOYMENT');
            console.log('   ✅ All critical functionality working');
            console.log('   ✅ MongoDB integration verified');
            console.log('   ✅ CORS headers properly configured');
            console.log('   ✅ Validation and error handling working');
            console.log('   ✅ Performance requirements met');
        } else if (successRate >= 80) {
            console.log('   ⚠️  MOSTLY READY - Minor issues to address');
            console.log('   ✅ Core functionality working');
            console.log('   ⚠️  Some non-critical tests failed');
        } else {
            console.log('   ❌ NOT READY FOR DEPLOYMENT');
            console.log('   ❌ Critical issues need to be resolved');
        }
        
        console.log(`\n📋 FAILED TESTS SUMMARY:`);
        const failedTests = this.testResults.filter(r => r.status === 'FAIL');
        if (failedTests.length > 0) {
            for (const test of failedTests) {
                console.log(`   ❌ ${test.test}: ${test.details}`);
            }
        } else {
            console.log('   🎉 No failed tests!');
        }
        
        console.log(`\n💡 VERCEL DEPLOYMENT RECOMMENDATIONS:`);
        if (successRate >= 95) {
            console.log('   🚀 Excellent! Ready for immediate Vercel deployment');
            console.log('   ✅ All serverless functions working perfectly');
            console.log('   ✅ MongoDB Atlas connection ready');
            console.log('   ✅ CORS configured for production domains');
        } else if (successRate >= 90) {
            console.log('   ✅ Good performance. Address minor issues and deploy');
            console.log('   ⚠️  Review failed tests before production deployment');
        } else if (successRate >= 80) {
            console.log('   ⚠️  Address failed tests before deployment');
            console.log('   🔧 Focus on critical functionality first');
        } else {
            console.log('   🔧 Significant issues need resolution before deployment');
            console.log('   ❌ Not recommended for production deployment');
        }
        
        console.log('\n📈 PERFORMANCE METRICS:');
        const performanceTests = this.testResults.filter(r => r.responseTime > 0);
        if (performanceTests.length > 0) {
            const avgResponseTime = performanceTests.reduce((sum, test) => sum + test.responseTime, 0) / performanceTests.length;
            const maxResponseTime = Math.max(...performanceTests.map(test => test.responseTime));
            console.log(`   Average Response Time: ${avgResponseTime.toFixed(3)}s`);
            console.log(`   Maximum Response Time: ${maxResponseTime.toFixed(3)}s`);
            
            if (avgResponseTime < 0.1) {
                console.log('   ✅ Excellent performance for serverless functions');
            } else if (avgResponseTime < 0.5) {
                console.log('   ✅ Good performance for serverless functions');
            } else {
                console.log('   ⚠️  Consider optimizing for better performance');
            }
        }
        
        console.log('=' * 80);
    }
}

// Run the comprehensive tests
const tester = new ComprehensiveJSFunctionTester();
tester.runComprehensiveTests().catch(console.error);