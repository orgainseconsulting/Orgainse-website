from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime

# Import Odoo integration
from odoo_integration import odoo_integration

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(
    title="Orgainse Consulting API",
    description="AI-native consulting services API",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    subject: str
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = "new"

class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    subject: str
    message: str

class NewsletterSubscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = "active"

class NewsletterSubscriptionCreate(BaseModel):
    email: EmailStr

class ConsultationRequest(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    service_type: str
    preferred_date: Optional[str] = None
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = "pending"

class ConsultationRequestCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    service_type: str
    preferred_date: Optional[str] = None
    message: Optional[str] = None


# API Routes
@api_router.get("/")
async def root():
    return {"message": "Orgainse Consulting API - Let us plan your SUCCESS!", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Contact form endpoint with Odoo CRM integration
@api_router.post("/contact", response_model=ContactMessage)
async def create_contact_message(input: ContactMessageCreate):
    """Handle contact form submissions with Odoo CRM integration"""
    try:
        contact_dict = input.dict()
        contact_obj = ContactMessage(**contact_dict)
        
        # Insert into MongoDB for performance
        result = await db.contact_messages.insert_one(contact_obj.dict())
        
        if result.inserted_id:
            logging.info(f"Contact message saved to MongoDB: {contact_obj.id}")
            
            # Sync to Odoo CRM as a lead
            try:
                odoo_lead_data = {
                    'name': f"Contact Form: {contact_obj.subject}",
                    'email': contact_obj.email,
                    'phone': contact_obj.phone or '',
                    'contact_name': contact_obj.name,
                    'company': contact_obj.company or '',
                    'message': contact_obj.message,
                    'service_interest': contact_obj.subject
                }
                
                odoo_lead_id = await odoo_integration.create_crm_lead(odoo_lead_data)
                
                if odoo_lead_id:
                    # Update MongoDB record with Odoo ID
                    await db.contact_messages.update_one(
                        {"id": contact_obj.id},
                        {"$set": {"odoo_lead_id": odoo_lead_id}}
                    )
                    logging.info(f"Contact synced to Odoo CRM with ID: {odoo_lead_id}")
                
            except Exception as odoo_error:
                logging.error(f"Odoo CRM sync failed: {str(odoo_error)}")
                # Continue without Odoo - MongoDB save was successful
            
            return contact_obj
        else:
            raise HTTPException(status_code=500, detail="Failed to save contact message")
    
    except Exception as e:
        logging.error(f"Error creating contact message: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/contact", response_model=List[ContactMessage])
async def get_contact_messages():
    try:
        messages = await db.contact_messages.find().sort("timestamp", -1).to_list(100)
        return [ContactMessage(**message) for message in messages]
    except Exception as e:
        logging.error(f"Error fetching contact messages: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Newsletter subscription endpoint with Odoo Marketing integration
@api_router.post("/newsletter", response_model=NewsletterSubscription)
async def subscribe_newsletter(input: NewsletterSubscriptionCreate):
    """Handle newsletter subscriptions with Odoo Email Marketing integration"""
    try:
        # Check if email already exists
        existing_sub = await db.newsletter_subscriptions.find_one({"email": input.email})
        if existing_sub:
            raise HTTPException(status_code=409, detail="Email already subscribed")
        
        subscription_dict = input.dict()
        subscription_obj = NewsletterSubscription(**subscription_dict)
        
        # Save to MongoDB for performance
        result = await db.newsletter_subscriptions.insert_one(subscription_obj.dict())
        
        if result.inserted_id:
            logging.info(f"Newsletter subscription saved to MongoDB: {subscription_obj.id}")
            
            # Sync to Odoo Email Marketing
            try:
                marketing_contact_data = {
                    'email': subscription_obj.email,
                    'name': subscription_obj.email.split('@')[0].title(),
                    'company': ''
                }
                
                odoo_contact_id = await odoo_integration.create_marketing_contact(marketing_contact_data)
                
                if odoo_contact_id:
                    # Update MongoDB record with Odoo ID
                    await db.newsletter_subscriptions.update_one(
                        {"id": subscription_obj.id},
                        {"$set": {"odoo_contact_id": odoo_contact_id}}
                    )
                    logging.info(f"Newsletter subscription synced to Odoo Marketing with ID: {odoo_contact_id}")
                
            except Exception as odoo_error:
                logging.error(f"Odoo Marketing sync failed: {str(odoo_error)}")
                # Continue without Odoo - MongoDB save was successful
            
            return subscription_obj
        else:
            raise HTTPException(status_code=500, detail="Failed to save subscription")
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating newsletter subscription: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Consultation booking endpoint
@api_router.post("/consultation", response_model=ConsultationRequest)
async def book_consultation(input: ConsultationRequestCreate):
    try:
        consultation_dict = input.dict()
        consultation_obj = ConsultationRequest(**consultation_dict)
        
        result = await db.consultation_requests.insert_one(consultation_obj.dict())
        
        if result.inserted_id:
            logging.info(f"Consultation request created: {consultation_obj.id}")
            return consultation_obj
        else:
            raise HTTPException(status_code=500, detail="Failed to save consultation request")
    
    except Exception as e:
        logging.error(f"Error creating consultation request: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/consultation", response_model=List[ConsultationRequest])
async def get_consultation_requests():
    try:
        consultations = await db.consultation_requests.find().sort("timestamp", -1).to_list(100)
        return [ConsultationRequest(**consultation) for consultation in consultations]
    except Exception as e:
        logging.error(f"Error fetching consultation requests: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Legacy status check endpoints (keeping for compatibility)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    try:
        status_dict = input.dict()
        status_obj = StatusCheck(**status_dict)
        result = await db.status_checks.insert_one(status_obj.dict())
        
        if result.inserted_id:
            return status_obj
        else:
            raise HTTPException(status_code=500, detail="Failed to save status check")
    
    except Exception as e:
        logging.error(f"Error creating status check: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    try:
        status_checks = await db.status_checks.find().to_list(1000)
        return [StatusCheck(**status_check) for status_check in status_checks]
    except Exception as e:
        logging.error(f"Error fetching status checks: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Analytics endpoints
@api_router.get("/analytics/overview")
async def get_analytics_overview():
    try:
        # Get counts from different collections
        contact_count = await db.contact_messages.count_documents({})
        newsletter_count = await db.newsletter_subscriptions.count_documents({})
        consultation_count = await db.consultation_requests.count_documents({})
        
        # Get recent activity
        recent_contacts = await db.contact_messages.count_documents({
            "timestamp": {"$gte": datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)}
        })
        
        return {
            "total_contacts": contact_count,
            "total_newsletter_subscribers": newsletter_count,
            "total_consultations": consultation_count,
            "today_contacts": recent_contacts,
            "timestamp": datetime.utcnow()
        }
    
    except Exception as e:
        logging.error(f"Error fetching analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Include the router in the main app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Application events
@app.on_event("startup")
async def startup_event():
    logger.info("Orgainse Consulting API starting up...")
    
    # Create indexes for better performance
    try:
        await db.contact_messages.create_index("timestamp")
        await db.newsletter_subscriptions.create_index("email", unique=True)
        await db.consultation_requests.create_index("timestamp")
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.error(f"Error creating indexes: {str(e)}")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Shutting down database connection...")
    client.close()