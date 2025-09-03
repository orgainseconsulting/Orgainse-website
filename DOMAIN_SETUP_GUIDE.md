# 🌐 DOMAIN SETUP GUIDE - ORGAINSE CONSULTING

## 🎯 **YOUR DESIRED SETUP:**

**Main Website**: `orgainse-website.vercel.app` → redirects to → `www.orgainse.com`
**Admin Portal**: `orgainse-website.vercel.app/admin` (same project, different route)

**Result**: One website, clean URLs, professional domain setup

---

## 🚀 **STEP-BY-STEP IMPLEMENTATION**

### **OPTION A: Rename Current Project (Easiest)**

#### **Step 1: Change Project Name in Vercel**
1. Go to **Vercel Dashboard**
2. Select project: `orgainse-new-website-java`
3. Go to **Settings** tab
4. Scroll to **"Project Name"** section
5. Change name from `orgainse-new-website-java` to `orgainse-website`
6. Click **"Save"**

**Result**: Your URL automatically becomes `orgainse-website.vercel.app`

#### **Step 2: Add Custom Domain**
1. In same project, go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter: `www.orgainse.com`
4. Follow DNS configuration instructions
5. Set `www.orgainse.com` as **Primary Domain**

#### **Step 3: Configure DNS (At Your Domain Registrar)**
Add this CNAME record:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

---

### **OPTION B: Create Fresh Project (Recommended)**

#### **Step 1: Create New Vercel Project**
1. Go to **Vercel Dashboard**
2. Click **"New Project"**
3. Import from **same GitHub repository**
4. **Project Name**: `orgainse-website`
5. **Framework**: Create React App
6. **Root Directory**: `./` (leave empty)

#### **Step 2: Add Environment Variables**
In new project, add:
```
MONGO_URL = mongodb+srv://orgainse_db_user:Mycompany25%25MDB@orgainse-consulting.g0jdlcn.mongodb.net/?retryWrites=true&w=majority&appName=orgainse-consulting

DB_NAME = orgainse-consulting
```

#### **Step 3: Deploy**
Click **"Deploy"** and wait for completion.

#### **Step 4: Add Custom Domain**
1. Go to **Settings** → **Domains**
2. Add: `www.orgainse.com`
3. Configure DNS as shown above
4. Set as primary domain

#### **Step 5: Remove Old Project** (Optional)
Delete `orgainse-new-website-java` project to avoid confusion.

---

## 🎯 **FINAL URL STRUCTURE**

After setup, you'll have:

### **Public URLs:**
- **Vercel URL**: `https://orgainse-website.vercel.app`
- **Custom Domain**: `https://www.orgainse.com` (primary)
- **Admin Portal**: `https://www.orgainse.com/admin`

### **How It Works:**
1. **Main Website**: Users visit `www.orgainse.com`
2. **Admin Access**: You visit `www.orgainse.com/admin`
3. **Backend**: Same project serves both frontend and admin
4. **Professional**: Clean URLs, no "new-website-java" in URL

---

## 📋 **DNS CONFIGURATION**

### **At Your Domain Registrar** (where you bought orgainse.com):

#### **Required DNS Records:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600 (or Auto)
```

#### **Optional - Root Domain Redirect:**
If you want `orgainse.com` (without www) to redirect to `www.orgainse.com`:
```
Type: A
Name: @
Value: 76.76.19.19
TTL: 3600
```

### **Verification:**
After DNS setup (takes 5-60 minutes):
- `www.orgainse.com` → Your website ✅
- `www.orgainse.com/admin` → Admin dashboard ✅
- `orgainse.com` → Redirects to `www.orgainse.com` ✅

---

## 🔍 **TESTING CHECKLIST**

After deployment and DNS setup:

### **Website Testing:**
- [ ] `https://orgainse-website.vercel.app` loads
- [ ] `https://www.orgainse.com` loads (after DNS propagation)
- [ ] Homepage, About, Services, Contact pages work
- [ ] Newsletter signup works
- [ ] Service card inquiries work
- [ ] Contact form works

### **Admin Testing:**
- [ ] `https://orgainse-website.vercel.app/admin` loads
- [ ] `https://www.orgainse.com/admin` loads (after DNS)
- [ ] Shows lead statistics
- [ ] Displays service-specific leads
- [ ] CSV export works
- [ ] Mobile responsive

### **API Testing:**
- [ ] `https://www.orgainse.com/api/health` returns JSON
- [ ] `https://www.orgainse.com/api/admin` returns lead data
- [ ] All forms submit successfully

---

## ⚡ **QUICK START (RECOMMENDED PATH)**

### **Method: Create Fresh Project**

1. **Create New Project**:
   - Vercel Dashboard → New Project
   - Same GitHub repo
   - Name: `orgainse-website`

2. **Environment Variables**:
   ```
   MONGO_URL = mongodb+srv://orgainse_db_user:Mycompany25%25MDB@orgainse-consulting.g0jdlcn.mongodb.net/?retryWrites=true&w=majority&appName=orgainse-consulting
   DB_NAME = orgainse-consulting
   ```

3. **Deploy & Test**:
   - Test: `orgainse-website.vercel.app`
   - Test admin: `orgainse-website.vercel.app/admin`

4. **Add Custom Domain**:
   - Settings → Domains → Add `www.orgainse.com`
   - Configure DNS at your registrar

5. **Final Testing**:
   - Test: `www.orgainse.com`
   - Test admin: `www.orgainse.com/admin`

---

## 🎉 **EXPECTED RESULTS**

### **Professional Setup:**
- ✅ **Main Site**: `www.orgainse.com`
- ✅ **Admin Portal**: `www.orgainse.com/admin`
- ✅ **Backup URLs**: `orgainse-website.vercel.app`
- ✅ **Same Project**: One deployment, clean structure
- ✅ **All Features**: Website + Admin in one place

### **Benefits:**
- ✅ Professional domain structure
- ✅ Easy admin access
- ✅ Clean URLs for clients
- ✅ Simplified management
- ✅ Better SEO with custom domain

---

## 📞 **NEED HELP?**

**DNS Issues**: DNS changes take 5-60 minutes to propagate globally
**Testing**: Always test Vercel URL first, then custom domain
**Backup**: Keep old project until new one is fully working

**🚀 This setup gives you the exact professional URL structure you want!**