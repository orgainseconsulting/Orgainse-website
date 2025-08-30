# 📊 COMPLETE MULTI-SHEET LEAD CAPTURE SETUP GUIDE

## 🎯 WHAT YOU'LL GET

A sophisticated lead capture system with **7 organized sheets** in one Google Workbook:

1. **📧 Newsletter** - Email subscriptions
2. **💰 ROI Calculator** - ROI assessment submissions  
3. **🧠 AI Assessment** - AI readiness evaluations
4. **📞 Consultations** - Direct consultation requests
5. **🔧 Service Inquiries** - Specific service interest
6. **📝 Contact Forms** - General contact submissions
7. **📊 Dashboard** - Daily analytics summary

---

## 🏗️ STEP 1: CREATE GOOGLE WORKBOOK WITH 7 SHEETS

### **1.1 Create Main Workbook:**
1. **Go to**: [https://sheets.google.com](https://sheets.google.com)
2. **Create new sheet**: Name it "**Orgainse Leads**"
3. **Copy the Sheet ID** from URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`

### **1.2 Create All Required Sheets:**

Right-click on the sheet tab at bottom and select "Insert sheet" for each of these:

#### **Sheet 1: Rename default sheet to "Newsletter"**
**Headers in Row 1:**
```
A1: Timestamp | B1: Email | C1: Source | D1: User Agent | E1: IP
```

#### **Sheet 2: Create "ROI Calculator"**
**Headers in Row 1:**
```
A1: Timestamp | B1: Name | C1: Email | D1: Company | E1: Role | F1: Company Size
G1: Industry | H1: Current Cost | I1: Duration | J1: Efficiency | K1: Desired Services
L1: ROI Result | M1: Source
```

#### **Sheet 3: Create "AI Assessment"**
**Headers in Row 1:**
```
A1: Timestamp | B1: Name | C1: Email | D1: Company | E1: Role | F1: Industry
G1: Company Size | H1: Current AI Usage | I1: Main Challenges | J1: Goals
K1: Assessment Score | L1: Recommendations | M1: Source
```

#### **Sheet 4: Create "Consultations"**
**Headers in Row 1:**
```
A1: Timestamp | B1: Name | C1: Email | D1: Phone | E1: Company | F1: Service Type
G1: Preferred Date | H1: Preferred Time | I1: Message | J1: Urgency
K1: Budget Range | L1: Source
```

#### **Sheet 5: Create "Service Inquiries"**
**Headers in Row 1:**
```
A1: Timestamp | B1: Lead Type | C1: Service Name | D1: Name | E1: Email
F1: Company | G1: Phone | H1: Message | I1: Budget | J1: Timeline | K1: Source
```

#### **Sheet 6: Create "Contact Forms"**
**Headers in Row 1:**
```
A1: Timestamp | B1: Name | C1: Email | D1: Phone | E1: Company
F1: Subject | G1: Message | H1: Source
```

#### **Sheet 7: Create "Dashboard"**
**Headers in Row 1:**
```
A1: Date | B1: Total Leads | C1: Newsletter | D1: ROI Calc | E1: AI Assess
F1: Consults | G1: Services | H1: Contacts
```

---

## 🔧 STEP 2: APPS SCRIPT SETUP

### **2.1 Open Apps Script:**
1. **In your Google Workbook**: Extensions → Apps Script
2. **Delete existing code**
3. **Paste the multi-sheet capture code** (I've provided this in the separate file)

### **2.2 Update Configuration:**
**In the code, replace:**
- `YOUR_SHEET_ID_HERE` → Your actual Google Sheet ID
- `info@orgainse.com` → Your actual email address

### **2.3 Test and Deploy:**
1. **Save**: Ctrl+S
2. **Test**: Run → `testAllLeadTypes`
3. **Grant permissions** when prompted
4. **Verify**: Check that all 7 sheets get test data
5. **Deploy**: Deploy → New deployment → Web app
6. **Copy Web App URL**

---

## 🌐 STEP 3: UPDATE VERCEL DEPLOYMENT

### **3.1 Environment Variable:**
**In Vercel Dashboard** → Settings → Environment Variables:
```
Name: REACT_APP_GOOGLE_SHEETS_API
Value: [Your Apps Script Web App URL]
```

### **3.2 Redeploy:**
Deployments → Redeploy (without build cache)

---

## 📊 STEP 4: WHAT EACH FORM CAPTURES

### **🔗 Newsletter Subscriptions (Homepage, About, Services):**
- Email address
- Source page
- Timestamp
- User agent (for analytics)

### **💰 ROI Calculator (/roi-calculator):**
- Full contact details (name, email, company, role)
- Project financials (cost, duration, efficiency rating)
- Desired services (multi-select)
- Industry and company size
- Calculated ROI results

### **🧠 AI Assessment (/ai-assessment):**
- Complete profile (name, email, company, role)
- Current AI usage and challenges
- Business goals and objectives
- Assessment scores and recommendations
- Industry and company size data

### **📞 Consultation Booking (/consultation):**
- Full contact information
- Service type preferences
- Preferred date and time slots
- Urgency level and budget range
- Detailed message/requirements

### **🔧 Service Inquiries (Service popups, /services):**
- Specific service interest
- Contact details and company info
- Project timeline and budget
- Custom messages for each service

### **📝 Contact Forms (/contact):**
- Standard contact form data
- Subject and detailed messages
- Phone and company information
- Source tracking

### **📊 Dashboard (Auto-generated):**
- Daily lead counts by type
- Total leads per day
- Lead source analytics
- Conversion funnel data

---

## 🎯 EXPECTED RESULTS

### **Real-Time Lead Capture:**
Every form submission instantly creates:
1. **Organized row** in appropriate sheet
2. **Email notification** with lead details and priority
3. **Dashboard update** with daily statistics

### **Smart Email Notifications:**
- 🔴 **HIGH Priority**: Consultations, high-budget ROI calculations
- 🟡 **MEDIUM Priority**: AI assessments, service inquiries  
- 🟢 **STANDARD Priority**: Newsletter, general contact

### **Sample Lead Entries:**

**ROI Calculator Sheet:**
```
2024-08-30 10:30 | John Smith | john@techcorp.com | Tech Corp | CTO | 50-200 | Technology | $75,000 | 6 | 7 | AI Strategy, Process Automation | 285% ROI | orgainse.com/roi-calculator
```

**Consultation Sheet:**
```
2024-08-30 14:15 | Sarah Johnson | sarah@startup.com | +1234567890 | Startup Inc | AI Strategy | 2024-09-05 | 2:00 PM | Need complete AI transformation | High | $50-100k | orgainse.com/consultation
```

---

## 🚀 IMMEDIATE BENEFITS

### **Organization:**
- ✅ **No more mixed data** - each lead type in its own sheet
- ✅ **Easy filtering** and sorting by lead quality
- ✅ **Separate follow-up** workflows for each lead type

### **Analytics:**
- ✅ **Daily dashboard** showing lead distribution
- ✅ **Lead source tracking** for marketing ROI
- ✅ **Conversion funnel** analysis by lead type

### **Business Intelligence:**
- ✅ **ROI calculation trends** - which services generate highest value leads
- ✅ **Assessment insights** - common business challenges and goals
- ✅ **Consultation patterns** - preferred times, urgency levels, budgets

### **Follow-up Efficiency:**
- ✅ **Priority-based** email notifications
- ✅ **Complete context** for each lead type
- ✅ **Action-ready data** for sales team

---

## 📞 NEXT STEPS

**Ready to set this up?** Let's start with:

1. **Create the Google Workbook** with 7 sheets and headers
2. **Share your Sheet ID** with me
3. **I'll help you configure the Apps Script**
4. **Test the complete system**
5. **Deploy to Vercel**

**This will give you the most sophisticated lead capture system for an AI consulting business - better organized than most enterprise CRM systems!** 🎯

**Are you ready to create the Google Workbook with the 7 sheets?**