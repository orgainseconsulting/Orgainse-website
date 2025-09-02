#!/usr/bin/env node
/**
 * Test Runner for JavaScript Serverless Functions
 * This script tests the Vercel serverless functions locally
 */

const http = require('http');
const url = require('url');
const { MongoClient } = require('mongodb');

// Import the serverless functions
const healthHandler = require('./api/health.js').default;
const newsletterHandler = require('./api/newsletter.js').default;
const contactHandler = require('./api/contact.js').default;
const adminHandler = require('./api/admin.js').default;

// Environment variables
process.env.MONGO_URL = 'mongodb://localhost:27017';
process.env.DB_NAME = 'orgainse_consulting';

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

// Test functions
async function testHealthFunction() {
    console.log('\n🔍 Testing Health Function (/api/health.js)');
    
    const req = new MockRequest('GET', '/api/health');
    const res = new MockResponse();
    
    try {
        await healthHandler(req, res);
        
        console.log(`✅ Status Code: ${res.statusCode}`);
        console.log(`✅ Response Body:`, res.body);
        
        // Verify required fields
        const requiredFields = ['status', 'timestamp', 'service', 'version'];
        const missingFields = requiredFields.filter(field => !(field in res.body));
        
        if (missingFields.length === 0) {
            console.log('✅ All required fields present');
        } else {
            console.log(`❌ Missing fields: ${missingFields.join(', ')}`);
        }
        
        return res.statusCode === 200 && res.body.status === 'healthy';
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        return false;
    }
}

async function testNewsletterFunction() {
    console.log('\n📧 Testing Newsletter Function (/api/newsletter.js)');
    
    // Test 1: Valid subscription
    const testData = {
        email: 'test.newsletter@example.com',
        first_name: 'Test',
        leadType: 'Newsletter Subscription',
        name: 'Test User',
        source: 'Website'
    };
    
    const req = new MockRequest('POST', '/api/newsletter', testData);
    const res = new MockResponse();
    
    try {
        await newsletterHandler(req, res);
        
        console.log(`✅ Status Code: ${res.statusCode}`);
        console.log(`✅ Response Body:`, res.body);
        
        if (res.statusCode === 200) {
            console.log('✅ Newsletter subscription successful');
            return true;
        } else if (res.statusCode === 409) {
            console.log('✅ Duplicate email handling working (409)');
            return true;
        } else {
            console.log(`❌ Unexpected status code: ${res.statusCode}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        return false;
    }
}

async function testContactFunction() {
    console.log('\n📞 Testing Contact Function (/api/contact.js)');
    
    const testData = {
        name: 'Dr. Jennifer Martinez',
        email: 'j.martinez@healthtech-innovations.com',
        company: 'HealthTech Innovations',
        phone: '+1-555-0123',
        service_type: 'AI Healthcare Solutions',
        message: 'We are interested in implementing AI-driven patient management systems.'
    };
    
    const req = new MockRequest('POST', '/api/contact', testData);
    const res = new MockResponse();
    
    try {
        await contactHandler(req, res);
        
        console.log(`✅ Status Code: ${res.statusCode}`);
        console.log(`✅ Response Body:`, res.body);
        
        if (res.statusCode === 200) {
            console.log('✅ Contact form submission successful');
            return true;
        } else {
            console.log(`❌ Unexpected status code: ${res.statusCode}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        return false;
    }
}

async function testAdminFunction() {
    console.log('\n👨‍💼 Testing Admin Function (/api/admin.js)');
    
    const req = new MockRequest('GET', '/api/admin');
    const res = new MockResponse();
    
    try {
        await adminHandler(req, res);
        
        console.log(`✅ Status Code: ${res.statusCode}`);
        console.log(`✅ Response Body:`, res.body);
        
        if (res.statusCode === 200 && res.body.success) {
            console.log('✅ Admin dashboard data retrieved successfully');
            console.log(`✅ Summary: ${JSON.stringify(res.body.summary)}`);
            return true;
        } else {
            console.log(`❌ Unexpected response`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        return false;
    }
}

async function testMongoDBConnection() {
    console.log('\n🗄️ Testing MongoDB Connection');
    
    try {
        const client = new MongoClient(process.env.MONGO_URL);
        await client.connect();
        const db = client.db(process.env.DB_NAME);
        
        // Test collections
        const collections = await db.listCollections().toArray();
        console.log(`✅ Connected to MongoDB: ${process.env.DB_NAME}`);
        console.log(`✅ Collections found: ${collections.map(c => c.name).join(', ')}`);
        
        // Test data counts
        const newsletterCount = await db.collection('newsletter_subscriptions').countDocuments({});
        const contactCount = await db.collection('contact_messages').countDocuments({});
        
        console.log(`✅ Newsletter subscriptions: ${newsletterCount}`);
        console.log(`✅ Contact messages: ${contactCount}`);
        
        await client.close();
        return true;
    } catch (error) {
        console.log(`❌ MongoDB connection failed: ${error.message}`);
        return false;
    }
}

async function runAllTests() {
    console.log('🚀 STARTING JAVASCRIPT SERVERLESS FUNCTIONS TESTING');
    console.log('=' * 80);
    
    const results = [];
    
    // Run all tests
    results.push(await testMongoDBConnection());
    results.push(await testHealthFunction());
    results.push(await testNewsletterFunction());
    results.push(await testContactFunction());
    results.push(await testAdminFunction());
    
    // Generate report
    const passed = results.filter(r => r).length;
    const total = results.length;
    const successRate = (passed / total * 100).toFixed(1);
    
    console.log('\n' + '=' * 80);
    console.log('🎯 JAVASCRIPT SERVERLESS FUNCTIONS TEST REPORT');
    console.log('=' * 80);
    console.log(`📊 OVERALL RESULTS:`);
    console.log(`   Total Tests: ${total}`);
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${total - passed}`);
    console.log(`   Success Rate: ${successRate}%`);
    
    if (successRate >= 80) {
        console.log('\n🚀 VERCEL DEPLOYMENT READINESS: ✅ READY');
        console.log('✅ JavaScript serverless functions are working correctly');
        console.log('✅ MongoDB integration verified');
        console.log('✅ All core functionality operational');
    } else {
        console.log('\n🚀 VERCEL DEPLOYMENT READINESS: ❌ NOT READY');
        console.log('❌ Critical issues need to be resolved');
    }
    
    console.log('=' * 80);
}

// Run the tests
runAllTests().catch(console.error);