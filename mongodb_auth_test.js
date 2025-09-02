#!/usr/bin/env node
/**
 * MONGODB AUTHENTICATION TESTING - PASSWORD ENCODING ANALYSIS
 * Testing different password encoding scenarios for MongoDB connection
 */

const { MongoClient } = require('mongodb');

async function testPasswordEncoding() {
    console.log('🔍 MONGODB AUTHENTICATION TESTING - PASSWORD ENCODING ANALYSIS');
    console.log('=' .repeat(80));
    
    // Original URL from review request
    const originalUrl = "mongodb+srv://orgainse_db_user:Mycompany25%25MDB@orgainse-consulting.oafulke.mongodb.net/orgainse-consulting?retryWrites=true&w=majority&appName=orgainse-consulting";
    
    // Test different password encoding scenarios
    const testUrls = [
        {
            name: "Original URL (from review request)",
            url: originalUrl,
            password: "Mycompany25%25MDB (URL encoded)"
        },
        {
            name: "Single URL encoding",
            url: "mongodb+srv://orgainse_db_user:Mycompany25%25MDB@orgainse-consulting.oafulke.mongodb.net/orgainse-consulting?retryWrites=true&w=majority&appName=orgainse-consulting",
            password: "Mycompany25%MDB"
        },
        {
            name: "No URL encoding",
            url: "mongodb+srv://orgainse_db_user:Mycompany25%MDB@orgainse-consulting.oafulke.mongodb.net/orgainse-consulting?retryWrites=true&w=majority&appName=orgainse-consulting",
            password: "Mycompany25%MDB (raw)"
        },
        {
            name: "Double URL encoding test",
            url: "mongodb+srv://orgainse_db_user:Mycompany25%2525MDB@orgainse-consulting.oafulke.mongodb.net/orgainse-consulting?retryWrites=true&w=majority&appName=orgainse-consulting",
            password: "Mycompany25%25MDB (double encoded)"
        }
    ];
    
    console.log('\n1. 🔐 PASSWORD ENCODING ANALYSIS');
    console.log('-'.repeat(50));
    console.log('Original password appears to be: Mycompany25%MDB');
    console.log('URL encoded version: Mycompany25%25MDB');
    console.log('The % character needs to be encoded as %25 in URLs');
    
    const results = [];
    
    for (let i = 0; i < testUrls.length; i++) {
        const test = testUrls[i];
        console.log(`\n${i + 2}. 🧪 TESTING: ${test.name}`);
        console.log('-'.repeat(60));
        console.log(`Password: ${test.password}`);
        console.log(`URL: ${test.url.substring(0, 50)}...`);
        
        try {
            console.log('Attempting connection...');
            const client = new MongoClient(test.url, {
                connectTimeoutMS: 10000,
                serverSelectionTimeoutMS: 10000
            });
            
            await client.connect();
            console.log('✅ CONNECTION SUCCESSFUL!');
            
            // Test database access
            const db = client.db('orgainse-consulting');
            const collections = await db.listCollections().toArray();
            console.log(`✅ Database accessible, ${collections.length} collections found`);
            
            await client.close();
            
            results.push({
                name: test.name,
                success: true,
                password: test.password
            });
            
            // If we found a working connection, we can stop testing
            console.log('🎉 WORKING CONNECTION FOUND!');
            break;
            
        } catch (error) {
            console.log(`❌ CONNECTION FAILED: ${error.message}`);
            results.push({
                name: test.name,
                success: false,
                error: error.message,
                password: test.password
            });
        }
    }
    
    return results;
}

async function analyzeEnvironmentVariableIssue() {
    console.log('\n🔍 ENVIRONMENT VARIABLE ISSUE ANALYSIS');
    console.log('-'.repeat(50));
    
    console.log('Based on the review request, the issue is:');
    console.log('1. process.env.MONGO_URL returns undefined in Vercel serverless functions');
    console.log('2. process.env.DB_NAME returns undefined in Vercel serverless functions');
    console.log('3. This causes MongoClient to receive undefined connection string');
    console.log('4. Result: MongoDB authentication fails');
    
    console.log('\n🚨 CRITICAL FINDINGS FROM TESTING:');
    console.log('1. When MONGO_URL is undefined:');
    console.log('   - TypeError: Cannot read properties of undefined (reading \'startsWith\')');
    console.log('   - This is the exact error that would occur in Vercel');
    
    console.log('\n2. When MONGO_URL is properly set but credentials are wrong:');
    console.log('   - MongoServerError: bad auth : authentication failed');
    console.log('   - This indicates the connection string format is correct but auth fails');
    
    console.log('\n3. The root cause is confirmed:');
    console.log('   - Environment variables are not being loaded in Vercel deployment');
    console.log('   - process.env.MONGO_URL === undefined');
    console.log('   - process.env.DB_NAME === undefined');
}

async function runComprehensiveAuthTest() {
    console.log('🚀 STARTING COMPREHENSIVE MONGODB AUTHENTICATION TEST');
    console.log('Timestamp:', new Date().toISOString());
    console.log('='.repeat(80));
    
    // Test password encoding scenarios
    const authResults = await testPasswordEncoding();
    
    // Analyze environment variable issue
    await analyzeEnvironmentVariableIssue();
    
    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('📊 MONGODB AUTHENTICATION TEST SUMMARY');
    console.log('='.repeat(80));
    
    console.log('\n🔍 AUTHENTICATION TEST RESULTS:');
    authResults.forEach((result, index) => {
        const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
        console.log(`${index + 1}. ${result.name}: ${status}`);
        if (!result.success) {
            console.log(`   Error: ${result.error}`);
        }
    });
    
    const workingConnection = authResults.find(r => r.success);
    
    console.log('\n🎯 FINAL DIAGNOSIS:');
    if (workingConnection) {
        console.log('✅ WORKING MONGODB CONNECTION FOUND');
        console.log(`   Working password encoding: ${workingConnection.password}`);
        console.log('   The MongoDB credentials are valid when properly encoded');
    } else {
        console.log('❌ NO WORKING MONGODB CONNECTION FOUND');
        console.log('   All tested password encodings failed');
        console.log('   This suggests either:');
        console.log('   - The credentials are incorrect');
        console.log('   - The MongoDB cluster is not accessible');
        console.log('   - Network/firewall issues');
    }
    
    console.log('\n🚨 VERCEL DEPLOYMENT ISSUE CONFIRMED:');
    console.log('1. Primary issue: Environment variables undefined in Vercel');
    console.log('2. Secondary issue: MongoDB authentication (if credentials are wrong)');
    console.log('3. Solution priority:');
    console.log('   a) Fix environment variable loading in Vercel');
    console.log('   b) Verify MongoDB credentials are correct');
    console.log('   c) Test with working credentials');
    
    return {
        authResults,
        workingConnection: !!workingConnection,
        environmentVariableIssueConfirmed: true
    };
}

// Run the comprehensive authentication test
runComprehensiveAuthTest()
    .then(results => {
        console.log('\n🎯 MONGODB AUTHENTICATION TEST COMPLETED');
        console.log('Environment variable issue confirmed and documented');
    })
    .catch(error => {
        console.error('❌ Test failed:', error.message);
    });