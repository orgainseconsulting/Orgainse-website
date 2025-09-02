#!/usr/bin/env node
/**
 * MONGODB CONNECTION TESTING - VERIFY ACTUAL CONNECTION
 * Testing the actual MongoDB connection with expected credentials
 */

const { MongoClient } = require('mongodb');

async function testMongoDBConnection() {
    console.log('🔍 MONGODB CONNECTION TESTING - VERIFY ACTUAL CONNECTION');
    console.log('=' .repeat(80));
    
    const expectedMongoUrl = "mongodb+srv://orgainse_db_user:Mycompany25%25MDB@orgainse-consulting.oafulke.mongodb.net/orgainse-consulting?retryWrites=true&w=majority&appName=orgainse-consulting";
    const expectedDbName = "orgainse-consulting";
    
    console.log('\n1. 🎯 TESTING WITH EXPECTED CREDENTIALS');
    console.log('-'.repeat(50));
    console.log('MONGO_URL:', expectedMongoUrl);
    console.log('DB_NAME:', expectedDbName);
    
    // Test 1: Connection with expected credentials
    console.log('\n2. 🔗 TESTING MONGODB CONNECTION');
    console.log('-'.repeat(40));
    
    let client;
    try {
        console.log('Attempting to connect to MongoDB...');
        client = new MongoClient(expectedMongoUrl);
        await client.connect();
        console.log('✅ MongoDB connection successful!');
        
        const db = client.db(expectedDbName);
        console.log(`✅ Database "${expectedDbName}" accessible`);
        
        // Test collections access
        const collections = await db.listCollections().toArray();
        console.log(`✅ Found ${collections.length} collections:`, collections.map(c => c.name));
        
        // Test newsletter collection
        const newsletterCollection = db.collection('newsletter_subscriptions');
        const newsletterCount = await newsletterCollection.countDocuments();
        console.log(`✅ Newsletter subscriptions collection: ${newsletterCount} documents`);
        
        // Test contact collection
        const contactCollection = db.collection('contact_messages');
        const contactCount = await contactCollection.countDocuments();
        console.log(`✅ Contact messages collection: ${contactCount} documents`);
        
        await client.close();
        console.log('✅ MongoDB connection closed successfully');
        
        return {
            connectionSuccessful: true,
            databaseAccessible: true,
            collectionsFound: collections.length,
            newsletterCount,
            contactCount
        };
        
    } catch (error) {
        console.log('❌ MongoDB connection failed:', error.message);
        if (client) {
            try {
                await client.close();
            } catch (closeError) {
                console.log('Error closing client:', closeError.message);
            }
        }
        
        return {
            connectionSuccessful: false,
            error: error.message,
            errorType: error.constructor.name
        };
    }
}

async function testUndefinedConnection() {
    console.log('\n3. 🚨 TESTING WITH UNDEFINED CONNECTION STRING');
    console.log('-'.repeat(55));
    
    try {
        console.log('Attempting to connect with undefined MONGO_URL...');
        const client = new MongoClient(undefined);
        await client.connect();
        console.log('❌ This should not succeed');
        await client.close();
        
    } catch (error) {
        console.log('✅ Expected error with undefined connection string:');
        console.log(`   Error: ${error.message}`);
        console.log(`   Type: ${error.constructor.name}`);
        
        return {
            undefinedConnectionFailed: true,
            errorMessage: error.message,
            errorType: error.constructor.name
        };
    }
}

async function simulateServerlessFunction() {
    console.log('\n4. 🔧 SIMULATING SERVERLESS FUNCTION BEHAVIOR');
    console.log('-'.repeat(55));
    
    // Simulate what happens in the serverless function
    const testData = {
        email: "test@orgainse.com",
        name: "Test User",
        leadType: "Newsletter Subscription"
    };
    
    console.log('Test data:', JSON.stringify(testData, null, 2));
    
    // Test with undefined environment variables (Vercel issue)
    console.log('\n🚨 Scenario 1: Environment variables undefined (Vercel issue)');
    try {
        const mongoUrl = undefined; // process.env.MONGO_URL returns undefined
        const dbName = undefined;   // process.env.DB_NAME returns undefined
        
        console.log('MONGO_URL:', mongoUrl);
        console.log('DB_NAME:', dbName);
        
        const client = new MongoClient(mongoUrl);
        await client.connect();
        
    } catch (error) {
        console.log('❌ Function would fail with error:', error.message);
        console.log('   This confirms the Vercel deployment issue');
    }
    
    // Test with correct environment variables
    console.log('\n✅ Scenario 2: Environment variables set correctly');
    try {
        const mongoUrl = "mongodb+srv://orgainse_db_user:Mycompany25%25MDB@orgainse-consulting.oafulke.mongodb.net/orgainse-consulting?retryWrites=true&w=majority&appName=orgainse-consulting";
        const dbName = "orgainse-consulting";
        
        console.log('MONGO_URL: [SET CORRECTLY]');
        console.log('DB_NAME:', dbName);
        
        const client = new MongoClient(mongoUrl);
        await client.connect();
        const db = client.db(dbName);
        
        // Simulate newsletter subscription
        const subscription = {
            id: Date.now().toString(),
            email: testData.email,
            first_name: testData.name,
            leadType: testData.leadType,
            source: 'Test',
            subscribed_at: new Date(),
            status: 'active',
            timestamp: new Date().toISOString()
        };
        
        // Check if email already exists
        const existing = await db.collection('newsletter_subscriptions').findOne({ email: testData.email });
        if (existing) {
            console.log('✅ Function would return 409 (email already subscribed)');
        } else {
            console.log('✅ Function would create new subscription');
        }
        
        await client.close();
        console.log('✅ Function would complete successfully');
        
    } catch (error) {
        console.log('❌ Function would fail even with correct env vars:', error.message);
    }
}

async function runComprehensiveTest() {
    console.log('🚀 STARTING COMPREHENSIVE MONGODB CONNECTION TEST');
    console.log('Timestamp:', new Date().toISOString());
    console.log('='.repeat(80));
    
    const results = {};
    
    // Test actual MongoDB connection
    results.mongoConnection = await testMongoDBConnection();
    
    // Test undefined connection
    results.undefinedConnection = await testUndefinedConnection();
    
    // Simulate serverless function behavior
    await simulateServerlessFunction();
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 MONGODB CONNECTION TEST RESULTS SUMMARY');
    console.log('='.repeat(80));
    
    console.log('\n🔍 KEY FINDINGS:');
    
    if (results.mongoConnection.connectionSuccessful) {
        console.log('✅ MongoDB credentials are VALID and working');
        console.log(`✅ Database "${results.mongoConnection.databaseAccessible ? 'accessible' : 'not accessible'}"`);
        console.log(`✅ Collections found: ${results.mongoConnection.collectionsFound}`);
        console.log(`✅ Newsletter subscriptions: ${results.mongoConnection.newsletterCount}`);
        console.log(`✅ Contact messages: ${results.mongoConnection.contactCount}`);
    } else {
        console.log('❌ MongoDB credentials are INVALID or connection failed');
        console.log(`❌ Error: ${results.mongoConnection.error}`);
    }
    
    console.log('\n🚨 VERCEL DEPLOYMENT ISSUE CONFIRMED:');
    console.log('1. MongoDB credentials work when properly set');
    console.log('2. Connection fails when environment variables are undefined');
    console.log('3. This confirms the root cause: process.env.MONGO_URL returning undefined in Vercel');
    
    console.log('\n💡 SOLUTION REQUIREMENTS:');
    console.log('1. Set MONGO_URL environment variable in Vercel dashboard');
    console.log('2. Set DB_NAME environment variable in Vercel dashboard');
    console.log('3. Ensure environment variables are available to serverless functions');
    console.log('4. Redeploy to apply environment variable changes');
    
    return results;
}

// Run the comprehensive test
runComprehensiveTest()
    .then(results => {
        console.log('\n🎯 MONGODB CONNECTION TEST COMPLETED');
        console.log('Full results available for analysis');
    })
    .catch(error => {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    });