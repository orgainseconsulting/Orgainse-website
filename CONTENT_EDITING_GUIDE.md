# 📝 WEBSITE CONTENT EDITING GUIDE

## 🎯 **WHERE TO FIND & EDIT WEBSITE CONTENT**

All your website content is stored in **GitHub** in specific files. Here's exactly where to find and edit each section:

---

## 📂 **MAIN CONTENT FILE**

### **PRIMARY FILE: `/src/App.js`**
**Location**: `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/blob/main/src/App.js`

**This file contains 90% of your website content including:**
- Homepage text
- About page content  
- Services descriptions
- Contact page text
- All headings, paragraphs, and button text

---

## 🏠 **HOMEPAGE CONTENT LOCATIONS**

### **Hero Section** (Top banner):
**File**: `/src/App.js`
**Search for**: `"Transform Your Business with AI-Native Solutions"`
**Lines**: ~500-600

**Content includes**:
- Main headline
- Subtitle text
- Call-to-action buttons
- Description paragraphs

### **Services Preview Section**:
**File**: `/src/App.js`
**Search for**: `"Our Core Services"`
**Lines**: ~800-1000

### **Features Section**:
**File**: `/src/App.js` 
**Search for**: `"Why Choose OrgAInse"`
**Lines**: ~1200-1400

### **Newsletter Section**:
**File**: `/src/App.js`
**Search for**: `"Stay ahead with AI insights"`
**Lines**: ~1500-1600

---

## 📋 **ABOUT PAGE CONTENT**

### **About Page Content**:
**File**: `/src/App.js`
**Search for**: `"About OrgAInse Consulting"`
**Lines**: ~1800-2200

**Content includes**:
- Company description
- Mission statement
- Team information
- Company values

---

## 🛠️ **SERVICES PAGE CONTENT**

### **Services Descriptions**:
**File**: `/src/App.js`
**Search for**: `"AI Strategy & Automation"`
**Lines**: ~2400-3000

**The 6 Service Cards**:
1. **AI Strategy & Automation**
2. **Digital Transformation** 
3. **Data Analytics & Business Intelligence**
4. **Process Optimization**
5. **Tech Integration & Support**
6. **Training & Change Management**

### **Service Popup Content**:
**File**: `/src/components/ServicePopup.js`
**Content**: Detailed service descriptions in popups

---

## 📞 **CONTACT PAGE CONTENT**

### **Contact Information**:
**File**: `/src/App.js`
**Search for**: `"Get in Touch"`
**Lines**: ~4000-4200

**Content includes**:
- Contact form labels
- Contact information
- Office address
- Email and phone

---

## 🔧 **TOOLS & CALCULATORS CONTENT**

### **AI Assessment Tool**:
**File**: `/src/App.js`
**Search for**: `"AI Readiness Assessment"`
**Lines**: ~2800-3200

### **ROI Calculator**:
**File**: `/src/App.js`
**Search for**: `"ROI Calculator"`
**Lines**: ~3400-3800

### **Smart Calendar**:
**File**: `/src/App.js`
**Search for**: `"Schedule Consultation"`
**Lines**: ~3900-4100

---

## 🔍 **HOW TO FIND SPECIFIC CONTENT**

### **Method 1: Search in GitHub**
1. Go to your GitHub repository
2. Open `/src/App.js`
3. Press `Ctrl+F` (or `Cmd+F` on Mac)
4. Search for the text you want to change
5. Click "Edit" (pencil icon)
6. Make changes
7. Commit changes

### **Method 2: Search by Section**
Use these search terms to find sections quickly:

| **Section** | **Search Term** |
|-------------|-----------------|
| Homepage Hero | `"Transform Your Business"` |
| About Us | `"About OrgAInse"` |
| Services | `"Our Core Services"` |
| Contact | `"Get in Touch"` |
| Newsletter | `"Stay ahead with AI"` |
| Footer | `"OrgAInse Consulting"` |

---

## 📝 **COMMON CONTENT EDITS**

### **1. Change Company Description**:
**File**: `/src/App.js`
**Search**: `"OrgAInse Consulting is an AI-native"`
**Edit**: Company description text

### **2. Update Service Descriptions**:
**File**: `/src/App.js`
**Search**: Service names like `"AI Strategy & Automation"`
**Edit**: Service descriptions and features

### **3. Modify Contact Information**:
**File**: `/src/App.js`
**Search**: `"contact@orgainse.com"` or phone numbers
**Edit**: Contact details

### **4. Change Headlines**:
**File**: `/src/App.js`
**Search**: Main headlines in quotes
**Edit**: Page titles and headings

### **5. Update Button Text**:
**File**: `/src/App.js`
**Search**: Button text like `"Get Started"` or `"Learn More"`
**Edit**: Call-to-action text

---

## 🎨 **STYLING & DESIGN FILES**

### **CSS Styles**:
**File**: `/src/App.css`
**Content**: Colors, fonts, spacing, animations

### **Tailwind Config**:
**File**: `/tailwind.config.js`
**Content**: Design system configuration

---

## 🌐 **SEO & METADATA**

### **Page Titles & Descriptions**:
**File**: `/public/index.html`
**Content**: HTML meta tags, page title

### **SEO Component**:
**File**: `/src/components/SEOHead.js`
**Content**: Dynamic SEO content for different pages

---

## 🔄 **HOW TO MAKE CHANGES**

### **Step 1: Edit on GitHub**
1. Go to your repository on GitHub
2. Navigate to the file (usually `/src/App.js`)
3. Click the pencil icon (Edit)
4. Make your text changes
5. Scroll down to "Commit changes"
6. Add commit message: "Update website content"
7. Click "Commit changes"

### **Step 2: Auto-Deployment**
- Vercel automatically detects GitHub changes
- Website updates in 2-3 minutes
- No manual deployment needed

### **Step 3: Verify Changes**
- Visit your website
- Check that changes appear correctly
- Test on mobile and desktop

---

## 📋 **CONTENT EDITING CHECKLIST**

When editing content:
- [ ] Keep text inside quotes (`"text here"`)
- [ ] Don't change HTML tags (`<div>`, `<h1>`, etc.)
- [ ] Don't modify JavaScript code
- [ ] Test changes after deployment
- [ ] Check mobile responsiveness
- [ ] Verify links still work

---

## ⚠️ **IMPORTANT NOTES**

### **What to Edit**:
- ✅ Text content inside quotes
- ✅ Headlines and descriptions
- ✅ Contact information
- ✅ Service descriptions
- ✅ Company information

### **What NOT to Edit**:
- ❌ Code syntax (brackets, semicolons)
- ❌ Function names
- ❌ HTML tags
- ❌ JavaScript logic
- ❌ Import statements

---

## 🎯 **QUICK REFERENCE**

**Your GitHub Repository**: `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME`
**Main Content File**: `/src/App.js` (90% of website text)
**Contact Info**: Search "contact@orgainse.com" in App.js
**Service Content**: Search service names in App.js
**Company Info**: Search "OrgAInse Consulting" in App.js

**🚀 Most of your website content is in one file (`/src/App.js`) - just search for the text you want to change!**