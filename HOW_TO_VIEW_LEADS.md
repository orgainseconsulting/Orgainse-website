# 📊 HOW TO VIEW CAPTURED LEADS

## 🎯 **3 WAYS TO VIEW YOUR LEADS**

### **Method 1: Admin Dashboard (Recommended)**
1. **Go to your website**: `https://orgainse-new-website-java.vercel.app/admin`
2. **View real-time statistics**:
   - Total leads captured
   - Newsletter subscribers count
   - Contact messages count
   - Last updated timestamp

3. **Browse leads**:
   - **Newsletter Subscribers**: Email, name, date subscribed, status
   - **Contact Messages**: Name, email, company, service type, message, date

4. **Export data**:
   - Click "Export CSV" buttons
   - Download spreadsheets for analysis

### **Method 2: MongoDB Atlas Dashboard**
1. **Login to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Use your credentials**: orgainse@gmail.com
3. **Select cluster**: orgainse-consulting
4. **Browse Collections**:
   - Click "Browse Collections"
   - Select database: `orgainse-consulting`
   - View collections:
     - `newsletter_subscriptions` - Newsletter signups
     - `contact_messages` - All business inquiries

### **Method 3: API Endpoints (For Developers)**
- **Get all leads**: `https://orgainse-new-website-java.vercel.app/api/admin`
- **Returns JSON data** with all newsletters and contacts

---

## 📋 **LEAD TYPES CAPTURED**

### **Newsletter Subscriptions** (`newsletter_subscriptions` collection):
```json
{
  "_id": "...",
  "id": "1754588643821",
  "email": "user@example.com",
  "first_name": "John",
  "leadType": "Newsletter Subscription",
  "source": "Website",
  "subscribed_at": "2025-01-07T12:30:43.821Z",
  "status": "active",
  "timestamp": "2025-01-07T12:30:43.821Z"
}
```

### **Contact Messages** (`contact_messages` collection):
```json
{
  "_id": "...",
  "id": "1754588723456",
  "name": "Jane Smith",
  "email": "jane@company.com",
  "company": "ABC Corp",
  "phone": "+1-555-0123",
  "service_type": "AI Transformation",
  "leadType": "Contact Inquiry",
  "source": "Website",
  "message": "Interested in AI solutions...",
  "submitted_at": "2025-01-07T12:32:03.456Z",
  "status": "new",
  "timestamp": "2025-01-07T12:32:03.456Z"
}
```

### **Business Inquiries Include**:
- Contact form submissions
- AI Assessment completions
- ROI Calculator submissions
- Consultation bookings
- Service-specific inquiries (6 service types)

---

## 🚀 **LEAD SOURCES TRACKED**

Your system tracks leads from:
- ✅ **Homepage Newsletter** → Newsletter Subscriptions
- ✅ **Contact Page** → Contact Messages  
- ✅ **AI Assessment Tool** → Contact Messages (leadType: "AI Assessment")
- ✅ **ROI Calculator** → Contact Messages (leadType: "ROI Calculator")
- ✅ **Service Page Inquiries** → Contact Messages (leadType: "Service Inquiry")
- ✅ **Consultation Booking** → Contact Messages (leadType: "Consultation")

---

## 📈 **ACCESSING YOUR ADMIN DASHBOARD**

**URL**: `https://orgainse-new-website-java.vercel.app/admin`

**What You'll See**:
- Real-time lead count statistics
- Sortable tables with all lead data
- Export functionality for data analysis
- Mobile-responsive design for viewing anywhere

**No login required** - Direct access to your lead data!

---

## 💡 **TIPS FOR LEAD MANAGEMENT**

1. **Regular Exports**: Download CSV files weekly for CRM import
2. **Lead Tracking**: Monitor which sources generate most leads
3. **Follow-up**: Use contact information for business development
4. **Analytics**: Track lead generation trends over time
5. **Data Backup**: Regular CSV exports serve as data backup

**🎯 Your complete lead capture and management system is now fully operational!**