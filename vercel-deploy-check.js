#!/usr/bin/env node

/**
 * Vercel Deployment Readiness Check
 * Validates configuration against common deployment issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 VERCEL DEPLOYMENT READINESS CHECK\n');

// Check 1: Verify vercel.json exists and is valid
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  console.log('✅ vercel.json - Valid JSON configuration');
  
  // Check for required fields
  if (vercelConfig.version === 2) {
    console.log('✅ version - Correct (v2)');
  } else {
    console.log('❌ version - Should be 2');
  }
  
  if (vercelConfig.framework === 'create-react-app') {
    console.log('✅ framework - Correct (create-react-app)');
  } else {
    console.log('⚠️ framework - Consider setting to "create-react-app"');
  }
  
  // Check functions pattern
  if (vercelConfig.functions && vercelConfig.functions['api/**/*.js']) {
    console.log('✅ functions - Correct pattern (api/**/*.js)');
  } else {
    console.log('❌ functions - Missing or incorrect pattern');
  }
  
} catch (error) {
  console.log('❌ vercel.json - Invalid or missing');
  process.exit(1);
}

// Check 2: Verify no conflicting files
const conflictingFiles = [
  'now.json',
  '.now',
  '.nowignore'
];

let hasConflicts = false;
conflictingFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`❌ Conflicting file found: ${file}`);
    hasConflicts = true;
  }
});

if (!hasConflicts) {
  console.log('✅ No conflicting configuration files');
}

// Check 3: Verify package.json
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  if (packageJson.name) {
    console.log(`✅ package.json - Project name: ${packageJson.name}`);
  }
  
  if (packageJson.scripts && packageJson.scripts.build) {
    console.log('✅ package.json - Build script exists');
  } else {
    console.log('❌ package.json - Missing build script');
  }
  
  // Check for problematic configurations
  if (packageJson.reactSnap) {
    console.log('⚠️ package.json - reactSnap configuration found (may cause build issues)');
  }
  
} catch (error) {
  console.log('❌ package.json - Invalid or missing');
}

// Check 4: Verify API directory structure
if (fs.existsSync('api')) {
  const apiFiles = fs.readdirSync('api', { recursive: true });
  const jsFiles = apiFiles.filter(file => file.endsWith('.js'));
  console.log(`✅ API directory - ${jsFiles.length} JavaScript files found`);
} else {
  console.log('⚠️ API directory - Not found');
}

// Check 5: Verify build directory after build
if (fs.existsSync('build')) {
  console.log('✅ Build directory - Exists');
  
  if (fs.existsSync('build/index.html')) {
    console.log('✅ Build - index.html present');
  } else {
    console.log('❌ Build - index.html missing');
  }
  
  if (fs.existsSync('build/static')) {
    console.log('✅ Build - Static assets directory present');
  } else {
    console.log('❌ Build - Static assets directory missing');
  }
} else {
  console.log('⚠️ Build directory - Not found (run "yarn build" first)');
}

// Check 6: Environment variables
if (fs.existsSync('.env')) {
  console.log('✅ Environment - .env file exists');
} else {
  console.log('⚠️ Environment - .env file not found');
}

if (fs.existsSync('.env.production')) {
  console.log('✅ Environment - .env.production file exists');
} else {
  console.log('⚠️ Environment - .env.production file not found');
}

console.log('\n🎯 DEPLOYMENT READINESS SUMMARY:');
console.log('📋 Manual steps required in Vercel Dashboard:');
console.log('  1. Set environment variables:');
console.log('     - REACT_APP_BACKEND_URL (your production domain)');
console.log('     - MONGO_URL (MongoDB connection string)');
console.log('     - DB_NAME (orgainse-consulting)');
console.log('     - REACT_APP_ADMIN_USERNAME');
console.log('     - REACT_APP_ADMIN_PASSWORD');
console.log('  2. Ensure Git repository is connected');
console.log('  3. Deploy from main/master branch');
console.log('\n🚀 Ready for deployment!');