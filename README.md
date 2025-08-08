# Orgainse Consulting Website

A modern, full-stack consulting website built with React, FastAPI, and MongoDB, featuring interactive lead generation tools and Odoo CRM integration.

## 🚀 Features

- **Interactive Lead Generation Tools**: AI Assessment, ROI Calculator, Smart Calendar booking
- **Regional Pricing System**: PPP-adjusted pricing across 7 global regions
- **Odoo Integration**: Complete CRM, Marketing, and Calendar synchronization
- **Responsive Design**: Modern UI with animations and mobile optimization
- **Multi-Industry Support**: IT, EdTech, FinTech, Healthcare, Hospitality, Software Development

## 🛠 Tech Stack

- **Frontend**: React 18, Tailwind CSS, Custom CSS animations
- **Backend**: FastAPI, Python
- **Database**: MongoDB
- **Integration**: Odoo SaaS 18.3 via XML-RPC

## 📁 Project Structure

```
├── frontend/                 # React application
│   ├── src/
│   │   ├── App.js           # Main component
│   │   ├── App.css          # Custom styles
│   │   └── index.js         # Entry point
│   ├── public/              # Static assets
│   └── package.json         # Dependencies
├── backend/                 # FastAPI application
│   ├── server.py           # Main server
│   ├── odoo_integration.py # Odoo integration
│   └── requirements.txt    # Python dependencies
└── tests/                  # Test files
```

## 🔧 Setup

### Frontend
```bash
cd frontend
npm install
npm start
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Environment Variables

**Backend (.env)**:
```
MONGO_URL=mongodb://localhost:27017/orgainse_db
ODOO_URL=your-odoo-instance.odoo.com
ODOO_DB=your_database_name
ODOO_USERNAME=your_username
ODOO_PASSWORD=your_password
```

**Frontend (.env)**:
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 📊 API Endpoints

- `POST /api/contact` - Contact form submissions
- `POST /api/newsletter` - Newsletter subscriptions  
- `POST /api/ai-assessment` - AI maturity assessment
- `POST /api/roi-calculator` - ROI calculations
- `POST /api/book-consultation` - Consultation booking

## 🌍 Global Support

**Regions**: India, USA, UK, UAE, Australia, New Zealand, South Africa
**Pricing**: Regional PPP-adjusted pricing with local currency support

## 🚀 Deployment

Production-ready for deployment on:
- Vercel (with GitHub integration)
- Netlify (drag-and-drop support)
- Any static hosting platform

## 📞 Contact

**Orgainse Consulting**
- Email: info@orgainse.com
- Headquarters: Bangalore (India), Austin (USA)