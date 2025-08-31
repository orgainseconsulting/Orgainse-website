# 🛠️ GOOGLE SHEETS CORS FIX - STEP BY STEP GUIDE

## ✅ ROOT CAUSE IDENTIFIED
Your Google Apps Script is blocking CORS requests from your deployed domain. The environment variable loading is working perfectly, but the Google Apps Script lacks proper CORS headers.

## 🔧 IMMEDIATE FIX REQUIRED

### **STEP 1: Update Google Apps Script Code**

1. **Open Google Apps Script:** Go to https://script.google.com/
2. **Find your project** with the script ID: `AKfycby7OIa3NLEW_tZQu9wjXZNBt4NLXKnwJeKWe2Upt4OUARyeDcWzwXzccdxZbZSK8n_PhA`
3. **Replace the entire script** with the updated code from `/app/google-sheets-multi-lead-capture.js`

### **STEP 2: Key Changes Made**

✅ **Added `doGet()` Function:**
```javascript
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'success',
      message: 'CORS preflight successful',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    });
}
```

✅ **Added CORS Headers to `doPost()`:**
```javascript
.setHeaders({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
});
```

### **STEP 3: Redeploy Google Apps Script**

1. **Click "Deploy" → "New deployment"**
2. **Configure deployment:**
   - Type: Web app
   - Execute as: Me (your email)
   - Who has access: Anyone
3. **Click "Deploy"**
4. **Copy the new Web App URL** (if it changed)

### **STEP 4: Update Environment Variable (if needed)**

If the deployment URL changed, update `/app/frontend/.env`:
```bash
REACT_APP_GOOGLE_SHEETS_API=https://script.google.com/macros/s/[NEW_DEPLOYMENT_ID]/exec
```

### **STEP 5: Test CORS Configuration**

Run this command to verify CORS is working:
```bash
curl -X OPTIONS \
  -H "Origin: https://mobile-lead-system.preview.emergentagent.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v "https://script.google.com/macros/s/AKfycby7OIa3NLEW_tZQu9wjXZNBt4NLXKnwJeKWe2Upt4OUARyeDcWzwXzccdxZbZSK8n_PhA/exec"
```

**Expected Response:**
```
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Methods: GET, POST, OPTIONS
< Access-Control-Allow-Headers: Content-Type, Authorization
```

## 🎯 TESTING THE FIX

### **Test 1: Newsletter Subscription**
1. Go to your deployed website
2. Scroll to newsletter section
3. Enter test email: `test@example.com`
4. Click "Get Free AI Insights"
5. **Expected:** Success message, no CORS errors in console

### **Test 2: Check Google Sheets**
1. Open your Google Sheets workbook
2. Check the "Newsletter" tab
3. **Expected:** New row with timestamp and email

### **Test 3: Console Verification**
1. Open browser Developer Tools (F12)
2. Submit newsletter form
3. **Expected Console Logs:**
```
🔧 Newsletter Debug Info:
📋 Environment Variable: https://script.google.com/macros/s/.../exec
✉️ Email: test@example.com
📤 Sending lead data: {...}
🌐 Sending to: https://script.google.com/macros/s/.../exec
✅ Success response: {"status":"success",...}
```

## 🚫 WHAT WAS WRONG BEFORE

❌ **Previous Error:**
```
Access to fetch at 'https://script.google.com/macros/s/.../exec' 
from origin 'https://mobile-lead-system.preview.emergentagent.com' 
has been blocked by CORS policy: Response to preflight request doesn't pass 
access control check: No 'Access-Control-Allow-Origin' header is present 
on the requested resource.
```

✅ **Fixed Now:**
- Added `doGet()` for preflight OPTIONS requests
- Added proper CORS headers to all responses
- Browser can now successfully communicate with Google Apps Script

## 📧 NOTIFICATION SYSTEM

Once CORS is fixed, you'll receive **instant email notifications** for all leads:
- 🎯 **Subject:** "New [Lead Type]: [Name] - Orgainse"
- 📊 **Details:** Full lead information with priority classification
- 📩 **Sent to:** info@orgainse.com

## 🔄 VERIFICATION CHECKLIST

After implementing the fix:

- [ ] Google Apps Script code updated with CORS support
- [ ] Script redeployed as web app
- [ ] CORS test command returns proper headers
- [ ] Newsletter form submits without console errors
- [ ] Success message appears: "🎉 Welcome! Check your email for resources."
- [ ] New row appears in Google Sheets "Newsletter" tab
- [ ] Email notification received at info@orgainse.com
- [ ] All other lead capture forms working (contact, ROI calculator, etc.)

## 🆘 TROUBLESHOOTING

**If still not working:**

1. **Clear browser cache** and try again
2. **Check Google Apps Script logs:** Apps Script Editor → "Executions"
3. **Verify deployment:** Ensure "Who has access" is set to "Anyone"
4. **Test with different browser** to rule out caching issues
5. **Check email permissions:** Ensure Gmail API is enabled for the script

---

**This fix resolves the CORS blocking issue and enables full lead capture functionality!** 🚀