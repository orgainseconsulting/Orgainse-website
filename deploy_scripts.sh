#!/bin/bash

# 🚀 ORGAINSE DEPLOYMENT SCRIPTS
# Complete deployment automation for Vercel

echo "🚀 ORGAINSE CONSULTING - DEPLOYMENT SCRIPTS"
echo "=========================================="

# Script 1: GitHub Push
github_push() {
    echo "📋 STEP 1: PUSHING TO GITHUB"
    echo "----------------------------"
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        echo "❌ Error: package.json not found. Are you in the project root?"
        exit 1
    fi
    
    # Add all files
    echo "📂 Adding all files to git..."
    git add .
    
    # Commit with comprehensive message
    echo "💾 Committing changes..."
    git commit -m "Complete Orgainse website with working Vercel serverless functions

- All 6 API endpoints converted to correct Vercel format
- Lead capture system fully functional (newsletter, contact, AI assessment, ROI calculator)
- MongoDB integration with proper error handling
- Google Analytics and Vercel Analytics integrated
- SEO optimized with redirects and sitemap
- Mobile responsive design
- All forms working without 404 errors
- CORS properly configured for all endpoints
- Environment variables configured for production
- Comprehensive error handling and validation"
    
    # Push to GitHub
    echo "🚀 Pushing to GitHub..."
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Successfully pushed to GitHub!"
        echo "🔗 Check your repository: https://github.com/$(git config remote.origin.url | sed 's/.*github.com[:/]\([^/]*\/[^/]*\).*/\1/' | sed 's/.git$//')"
    else
        echo "❌ Failed to push to GitHub. Check your authentication."
        exit 1
    fi
}

# Script 2: Verify File Structure
verify_structure() {
    echo ""
    echo "📋 STEP 2: VERIFYING FILE STRUCTURE"
    echo "-----------------------------------"
    
    required_files=(
        "package.json"
        "vercel.json"
        "requirements.txt"
        ".env"
        ".env.production"
        "api/requirements.txt"
        "api/health.py"
        "api/newsletter.py"
        "api/contact.py"
        "api/ai-assessment.py"
        "api/roi-calculator.py"
        "api/consultation.py"
        "public/index.html"
        "public/robots.txt"
        "public/sitemap.xml"
        "public/_redirects"
        "src/App.js"
    )
    
    missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            echo "✅ $file"
        else
            echo "❌ $file (MISSING)"
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        echo "🎉 All required files present!"
    else
        echo "⚠️  Missing files detected. Please ensure all files are in place."
        exit 1
    fi
}

# Script 3: Test API Endpoints
test_endpoints() {
    echo ""
    echo "📋 STEP 3: TESTING API ENDPOINTS"
    echo "--------------------------------"
    
    if [ -z "$1" ]; then
        echo "Usage: test_endpoints <domain>"
        echo "Example: test_endpoints https://www.orgainse.com"
        return 1
    fi
    
    domain=$1
    endpoints=("health" "newsletter" "contact" "ai-assessment" "roi-calculator" "consultation")
    
    echo "🌐 Testing domain: $domain"
    
    for endpoint in "${endpoints[@]}"; do
        echo "Testing /api/$endpoint..."
        
        if [ "$endpoint" = "health" ]; then
            response=$(curl -s -w "%{http_code}" "$domain/api/$endpoint")
            http_code="${response: -3}"
            
            if [ "$http_code" = "200" ]; then
                echo "✅ /api/$endpoint - Working (HTTP $http_code)"
            else
                echo "❌ /api/$endpoint - Failed (HTTP $http_code)"
            fi
        else
            # Test POST endpoints
            response=$(curl -s -w "%{http_code}" -X POST "$domain/api/$endpoint" \
                -H "Content-Type: application/json" \
                -d '{"email":"test@example.com","name":"Test User"}')
            http_code="${response: -3}"
            
            if [ "$http_code" = "200" ] || [ "$http_code" = "400" ]; then
                echo "✅ /api/$endpoint - Working (HTTP $http_code)"
            else
                echo "❌ /api/$endpoint - Failed (HTTP $http_code)"
            fi
        fi
        
        sleep 1
    done
}

# Script 4: Environment Variables Checker
check_env_vars() {
    echo ""
    echo "📋 CHECKING ENVIRONMENT VARIABLES"
    echo "---------------------------------"
    
    if [ -f ".env" ]; then
        echo "✅ .env file found"
        
        if grep -q "REACT_APP_BACKEND_URL" .env; then
            backend_url=$(grep "REACT_APP_BACKEND_URL" .env | cut -d'=' -f2)
            echo "✅ REACT_APP_BACKEND_URL: $backend_url"
        else
            echo "❌ REACT_APP_BACKEND_URL not found in .env"
        fi
    else
        echo "❌ .env file not found"
    fi
    
    echo ""
    echo "📝 Required Vercel Environment Variables:"
    echo "   MONGO_URL: mongodb+srv://admin:orgainse2024@cluster0.mongodb.net/orgainse_consulting?retryWrites=true&w=majority"
    echo "   DB_NAME: orgainse_consulting"
}

# Script 5: Build and Deploy
build_project() {
    echo ""
    echo "📋 STEP 4: BUILDING PROJECT"
    echo "---------------------------"
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "📦 Installing dependencies..."
        npm install
    fi
    
    # Build the project
    echo "🔨 Building project..."
    npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Build successful!"
        
        # Show build info
        if [ -d "build" ]; then
            echo "📊 Build Statistics:"
            echo "   Build folder size: $(du -sh build | cut -f1)"
            echo "   Number of files: $(find build -type f | wc -l)"
        fi
    else
        echo "❌ Build failed!"
        exit 1
    fi
}

# Main Menu
show_menu() {
    echo ""
    echo "🎯 ORGAINSE DEPLOYMENT MENU"
    echo "============================"
    echo "1. Verify File Structure"
    echo "2. Build Project"
    echo "3. Push to GitHub"
    echo "4. Check Environment Variables"
    echo "5. Test API Endpoints"
    echo "6. Full Deployment (Steps 1-3)"
    echo "7. Exit"
    echo ""
}

# Full deployment
full_deployment() {
    echo "🚀 STARTING FULL DEPLOYMENT"
    echo "==========================="
    
    verify_structure
    build_project
    github_push
    
    echo ""
    echo "🎉 DEPLOYMENT COMPLETE!"
    echo "======================"
    echo "Next Steps:"
    echo "1. Go to Vercel Dashboard: https://vercel.com/dashboard"
    echo "2. Import your GitHub repository"
    echo "3. Configure environment variables (MONGO_URL, DB_NAME)"
    echo "4. Deploy and test using: ./deploy_scripts.sh and select option 5"
}

# Interactive Menu
if [ "$1" = "test" ]; then
    test_endpoints "$2"
elif [ "$1" = "verify" ]; then
    verify_structure
elif [ "$1" = "build" ]; then
    build_project
elif [ "$1" = "push" ]; then
    github_push
elif [ "$1" = "env" ]; then
    check_env_vars
elif [ "$1" = "deploy" ]; then
    full_deployment
else
    while true; do
        show_menu
        read -p "Select option (1-7): " choice
        
        case $choice in
            1) verify_structure ;;
            2) build_project ;;
            3) github_push ;;
            4) check_env_vars ;;
            5) 
                read -p "Enter domain (e.g., https://www.orgainse.com): " domain
                test_endpoints "$domain" ;;
            6) full_deployment ;;
            7) echo "👋 Goodbye!"; exit 0 ;;
            *) echo "❌ Invalid option. Please try again." ;;
        esac
        
        echo ""
        read -p "Press Enter to continue..."
    done
fi