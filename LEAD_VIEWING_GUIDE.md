# 📊 Lead Viewing Guide - Orgainse Consulting

## Overview
This guide shows you how to view and manage leads captured from your website forms. All leads are stored in your MongoDB database and can be accessed through multiple methods.

---

## 📋 METHOD 1: Simple Command Line (Easiest)

### **STEP 1: Open Terminal/Command Prompt**
- **Windows:** Press `Win + R`, type `cmd`, press Enter
- **Mac:** Press `Cmd + Space`, type `terminal`, press Enter
- **Linux:** Press `Ctrl + Alt + T`

### **STEP 2: Navigate to Backend Directory**
```bash
cd /app/backend
```

### **STEP 3: Run the Admin Dashboard**
```bash
python3 admin_dashboard.py
```

### **STEP 4: Choose What to View**
The script will show you a menu:
```
🎯 ORGAINSE CONSULTING - ADMIN DASHBOARD
==================================================
1. View Newsletter Subscribers
2. View All Collections Summary  
3. Export Leads to CSV
--------------------------------------------------
Enter choice (1-3):
```

**Type `1` and press Enter** to view newsletter subscribers.

### **Expected Output**

#### **If You Have Leads:**
```
📧 NEWSLETTER SUBSCRIBERS
============================================================
📊 Total Subscribers: 3
------------------------------------------------------------
 1. Email: john@example.com
    ID: abc123def456
    Date: 2024-09-01 14:30:25
    Status: subscribed
----------------------------------------
 2. Email: sarah@company.com
    ID: def789ghi012
    Date: 2024-09-01 13:15:10
    Status: subscribed
----------------------------------------
```

#### **If No Leads Yet:**
```
📧 NEWSLETTER SUBSCRIBERS
============================================================
📝 No newsletter subscribers yet
```

### **Menu Options Explained**

#### **Option 1: View Newsletter Subscribers**
- Shows all email addresses captured from your website forms
- Displays subscriber details including ID, date, and status
- Sorted by most recent first

#### **Option 2: View All Collections Summary**
Shows overview of all lead types:
```
🎯 ORGAINSE CONSULTING - LEAD DASHBOARD
======================================================================
📊 NEWSLETTER: 5 entries
   • john@example.com - 2024-09-01 14:30
   • sarah@company.com - 2024-09-01 13:15

📊 CONTACTS: 0 entries
📊 LEADS: 0 entries
📊 ASSESSMENTS: 0 entries
📊 CONSULTATIONS: 0 entries
```

#### **Option 3: Export to CSV**
- Creates a CSV file with all leads
- File saved with timestamp: `orgainse_leads_YYYYMMDD_HHMMSS.csv`
- Can be opened in Excel or Google Sheets

Example output:
```
✅ Exported 5 leads to orgainse_leads_20240901_143025.csv
```

---

## 🔧 Troubleshooting

### **If Command Not Found:**
```bash
# Try this instead:
python admin_dashboard.py
```

### **If Permission Denied:**
```bash
# Make the file executable:
chmod +x admin_dashboard.py
python3 admin_dashboard.py
```

### **If Can't Find File:**
```bash
# Check you're in the right directory:
pwd
ls -la admin_dashboard.py
```

---

## 📊 METHOD 2: Web Admin Dashboard

### **Access via Browser**
1. Open the file `/app/admin_dashboard.html` in your web browser
2. Or visit the API endpoint directly for JSON data:
   ```
   https://cache-refresh-web.preview.emergentagent.com/api/admin/leads
   ```

### **Features**
- **Real-time statistics:** Total leads, today's leads, weekly leads
- **Interactive table:** View all newsletter subscribers
- **Auto-refresh:** Updates every 30 seconds
- **Responsive design:** Works on mobile and desktop

---

## 🔗 METHOD 3: API Endpoints

### **View Statistics**
```bash
curl https://cache-refresh-web.preview.emergentagent.com/api/admin/stats
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_leads": 25,
    "today_leads": 3,
    "week_leads": 12
  }
}
```

### **View All Leads**
```bash
curl https://cache-refresh-web.preview.emergentagent.com/api/admin/leads
```

**Response:**
```json
{
  "success": true,
  "data": {
    "newsletters": [
      {
        "id": "abc123def456",
        "email": "john@example.com",
        "timestamp": "2024-09-01T14:30:25Z",
        "status": "subscribed"
      }
    ],
    "total_count": 1
  }
}
```

---

## 💾 METHOD 4: Direct Database Query

### **Quick Database Check**
```bash
cd /app/backend && python3 -c "
from pymongo import MongoClient
import os
client = MongoClient(os.environ.get('MONGO_URL', 'mongodb://localhost:27017'))
db = client['orgainse_consulting']
leads = list(db.newsletter.find())
print(f'Total leads: {len(leads)}')
for lead in leads:
    print(f'Email: {lead.get(\"email\")}, Date: {lead.get(\"timestamp\")}')
client.close()
"
```

---

## 📁 Data Storage Details

### **Database Information**
- **Database:** MongoDB
- **Database Name:** `orgainse_consulting`
- **Collection:** `newsletter` (for all form submissions)
- **Location:** `mongodb://localhost:27017`

### **Data Structure**
Each lead contains:
```json
{
  "id": "unique_identifier",
  "email": "user@example.com", 
  "timestamp": "2024-09-01T14:30:25Z",
  "status": "subscribed"
}
```

---

## 🚀 Quick Start

**Most Common Usage:**
```bash
cd /app/backend
python3 admin_dashboard.py
# Type "1" to view newsletter subscribers
```

**Export for Excel/Google Sheets:**
```bash
cd /app/backend
python3 admin_dashboard.py
# Type "3" to export CSV file
```

---

## 📞 Support

If you encounter any issues:
1. Check that the backend server is running
2. Verify MongoDB connection
3. Ensure you're in the correct directory (`/app/backend`)
4. Try the web dashboard method as an alternative

For technical support, check the logs:
```bash
tail -f /var/log/supervisor/backend.*.log
```