from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta

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

# ================================
# INTERACTIVE TOOLS - ODOO INTEGRATED
# ================================

# AI Assessment Tool Models
class AIAssessmentResponse(BaseModel):
    question_id: str
    answer: str
    score: Optional[int] = None

class AIAssessmentCreate(BaseModel):
    name: str
    email: EmailStr
    company: str
    phone: Optional[str] = None
    responses: List[AIAssessmentResponse]
    
class AIAssessment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    company: str
    phone: Optional[str] = None
    responses: List[AIAssessmentResponse]
    ai_maturity_score: int
    recommendations: List[str]
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    odoo_lead_id: Optional[int] = None

# ROI Calculator Models
class ROICalculatorInput(BaseModel):
    company_name: str
    email: EmailStr
    phone: Optional[str] = None
    industry: str
    company_size: str
    current_project_cost: float
    project_duration_months: int
    current_efficiency_rating: int
    desired_services: List[str]

class ROICalculatorResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    input_data: ROICalculatorInput
    potential_savings: float
    roi_percentage: float
    payback_period_months: int
    recommended_services: List[Dict[str, Any]]
    estimated_project_cost: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    odoo_quote_id: Optional[int] = None

# Calendar Booking Models
class CalendarBookingCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    service_type: str
    preferred_datetime: datetime
    timezone: str
    message: Optional[str] = None

class CalendarBooking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    service_type: str
    preferred_datetime: datetime
    timezone: str
    message: Optional[str] = None
    status: str = "scheduled"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    odoo_event_id: Optional[int] = None
    odoo_opportunity_id: Optional[int] = None

# AI Assessment Tool Endpoint
@api_router.post("/ai-assessment", response_model=AIAssessment)
async def create_ai_assessment(input: AIAssessmentCreate):
    """Create AI Assessment with scoring and Odoo CRM integration"""
    try:
        # Calculate AI maturity score
        total_score = sum([resp.score or 0 for resp in input.responses])
        max_possible_score = len(input.responses) * 10  # Assuming 10 is max per question
        ai_maturity_score = int((total_score / max_possible_score) * 100) if max_possible_score > 0 else 0
        
        # Generate recommendations based on score
        recommendations = generate_ai_recommendations(ai_maturity_score, input.responses)
        
        # Create assessment object
        assessment_dict = input.dict()
        assessment_obj = AIAssessment(
            **assessment_dict,
            ai_maturity_score=ai_maturity_score,
            recommendations=recommendations
        )
        
        # Save to MongoDB
        result = await db.ai_assessments.insert_one(assessment_obj.dict())
        
        if result.inserted_id:
            logging.info(f"AI Assessment saved to MongoDB: {assessment_obj.id}")
            
            # Sync to Odoo CRM as qualified lead
            try:
                odoo_lead_data = {
                    'name': f"AI Assessment - {input.company}",
                    'email': input.email,
                    'phone': input.phone or '',
                    'contact_name': input.name,
                    'company': input.company,
                    'message': f"AI Maturity Score: {ai_maturity_score}/100",
                    'ai_score': ai_maturity_score,
                    'service_interest': 'AI Assessment'
                }
                
                odoo_lead_id = await odoo_integration.create_crm_lead(odoo_lead_data)
                
                if odoo_lead_id:
                    # Update MongoDB with Odoo ID
                    await db.ai_assessments.update_one(
                        {"id": assessment_obj.id},
                        {"$set": {"odoo_lead_id": odoo_lead_id}}
                    )
                    assessment_obj.odoo_lead_id = odoo_lead_id
                    logging.info(f"AI Assessment synced to Odoo CRM with ID: {odoo_lead_id}")
                
            except Exception as odoo_error:
                logging.error(f"Odoo CRM sync failed for AI Assessment: {str(odoo_error)}")
            
            return assessment_obj
        else:
            raise HTTPException(status_code=500, detail="Failed to save AI assessment")
    
    except Exception as e:
        logging.error(f"Error creating AI assessment: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ROI Calculator Endpoint
@api_router.post("/roi-calculator", response_model=ROICalculatorResult)
async def calculate_roi(input: ROICalculatorInput):
    """Calculate ROI and create Odoo Sales quotation"""
    try:
        # Calculate potential savings and ROI
        roi_results = calculate_business_roi(input)
        
        # Create ROI result object
        roi_result_obj = ROICalculatorResult(
            input_data=input,
            **roi_results
        )
        
        # Save to MongoDB
        result = await db.roi_calculations.insert_one(roi_result_obj.dict())
        
        if result.inserted_id:
            logging.info(f"ROI Calculation saved to MongoDB: {roi_result_obj.id}")
            
            # Create Odoo Sales quotation
            try:
                quote_data = {
                    'email': input.email,
                    'services': roi_result_obj.recommended_services,
                    'note': f"Generated from ROI Calculator - Potential savings: ${roi_result_obj.potential_savings:,.2f}"
                }
                
                odoo_quote_id = await odoo_integration.create_sales_quotation(quote_data)
                
                if odoo_quote_id:
                    # Update MongoDB with Odoo ID
                    await db.roi_calculations.update_one(
                        {"id": roi_result_obj.id},
                        {"$set": {"odoo_quote_id": odoo_quote_id}}
                    )
                    roi_result_obj.odoo_quote_id = odoo_quote_id
                    logging.info(f"ROI Calculator quote synced to Odoo Sales with ID: {odoo_quote_id}")
                
            except Exception as odoo_error:
                logging.error(f"Odoo Sales sync failed for ROI Calculator: {str(odoo_error)}")
            
            return roi_result_obj
        else:
            raise HTTPException(status_code=500, detail="Failed to save ROI calculation")
    
    except Exception as e:
        logging.error(f"Error calculating ROI: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Calendar Booking Endpoint
@api_router.post("/book-consultation", response_model=CalendarBooking)
async def book_consultation_slot(input: CalendarBookingCreate):
    """Book consultation with Odoo Calendar integration"""
    try:
        # Create booking object
        booking_dict = input.dict()
        booking_obj = CalendarBooking(**booking_dict)
        
        # Save to MongoDB
        result = await db.calendar_bookings.insert_one(booking_obj.dict())
        
        if result.inserted_id:
            logging.info(f"Calendar booking saved to MongoDB: {booking_obj.id}")
            
            # Create Odoo Calendar event and CRM opportunity
            try:
                # Prepare event data
                end_datetime = input.preferred_datetime + timedelta(minutes=30)
                event_data = {
                    'name': f"AI Consultation - {input.company or input.name}",
                    'email': input.email,
                    'start_datetime': input.preferred_datetime.isoformat(),
                    'end_datetime': end_datetime.isoformat(),
                    'location': 'Virtual Meeting',
                    'description': f"Service: {input.service_type}\nMessage: {input.message or 'N/A'}"
                }
                
                odoo_event_id = await odoo_integration.create_calendar_event(event_data)
                
                # Create CRM opportunity
                opportunity_data = {
                    'name': f"Consultation - {input.company or input.name}",
                    'email': input.email,
                    'expected_revenue': get_service_estimated_value(input.service_type),
                    'probability': 25,
                    'description': f"Consultation for {input.service_type}"
                }
                
                odoo_opportunity_id = await odoo_integration.create_crm_opportunity(opportunity_data)
                
                if odoo_event_id or odoo_opportunity_id:
                    # Update MongoDB with Odoo IDs
                    update_data = {}
                    if odoo_event_id:
                        update_data["odoo_event_id"] = odoo_event_id
                        booking_obj.odoo_event_id = odoo_event_id
                    if odoo_opportunity_id:
                        update_data["odoo_opportunity_id"] = odoo_opportunity_id
                        booking_obj.odoo_opportunity_id = odoo_opportunity_id
                    
                    await db.calendar_bookings.update_one(
                        {"id": booking_obj.id},
                        {"$set": update_data}
                    )
                    
                    logging.info(f"Calendar booking synced to Odoo - Event: {odoo_event_id}, Opportunity: {odoo_opportunity_id}")
                
            except Exception as odoo_error:
                logging.error(f"Odoo Calendar/CRM sync failed for booking: {str(odoo_error)}")
            
            return booking_obj
        else:
            raise HTTPException(status_code=500, detail="Failed to save calendar booking")
    
    except Exception as e:
        logging.error(f"Error creating calendar booking: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Helper Functions
def generate_ai_recommendations(score: int, responses: List[AIAssessmentResponse]) -> List[str]:
    """Generate AI recommendations based on assessment score"""
    recommendations = []
    
    if score < 30:
        recommendations.extend([
            "Start with AI Project Management fundamentals",
            "Implement basic automation tools",
            "Develop an AI readiness roadmap",
            "Focus on data collection and organization"
        ])
    elif score < 60:
        recommendations.extend([
            "Enhance your AI project management capabilities",
            "Implement advanced automation workflows",
            "Develop AI-powered analytics",
            "Create cross-functional AI teams"
        ])
    else:
        recommendations.extend([
            "Scale AI across all business operations",
            "Implement advanced AI solutions",
            "Develop AI innovation labs",
            "Lead industry AI transformation"
        ])
    
    return recommendations

def calculate_business_roi(input: ROICalculatorInput) -> Dict[str, Any]:
    """Calculate ROI based on business inputs"""
    # Base calculations
    annual_project_cost = input.current_project_cost * (12 / input.project_duration_months)
    
    # Efficiency improvements based on AI implementation
    efficiency_multiplier = {
        "1-10": 0.15,   # 15% improvement
        "11-50": 0.25,  # 25% improvement  
        "51-200": 0.35, # 35% improvement
        "200+": 0.45    # 45% improvement
    }.get(input.company_size, 0.25)
    
    # Calculate potential savings
    potential_annual_savings = annual_project_cost * efficiency_multiplier
    
    # Recommended services based on input
    recommended_services = get_recommended_services(input)
    
    # Estimate project cost
    estimated_project_cost = sum([service.get('price', 5000) for service in recommended_services])
    
    # ROI calculation
    roi_percentage = ((potential_annual_savings - estimated_project_cost) / estimated_project_cost) * 100
    payback_period_months = int((estimated_project_cost / (potential_annual_savings / 12)))
    
    return {
        'potential_savings': potential_annual_savings,
        'roi_percentage': roi_percentage,
        'payback_period_months': payback_period_months,
        'recommended_services': recommended_services,
        'estimated_project_cost': estimated_project_cost
    }

def get_recommended_services(input: ROICalculatorInput) -> List[Dict[str, Any]]:
    """Get recommended services based on input"""
    services = []
    
    if 'AI Project Management' in input.desired_services:
        services.append({
            'name': 'AI Project Management Service (PMaaS)',
            'description': 'GPT-powered project management with automated workflows',
            'price': 8000,
            'duration': '3 months'
        })
    
    if 'Digital Transformation' in input.desired_services:
        services.append({
            'name': 'Digital Transformation Consulting',
            'description': 'End-to-end digital transformation with AI integration',
            'price': 15000,
            'duration': '6 months'
        })
    
    if 'Operational Optimization' in input.desired_services:
        services.append({
            'name': 'AI-Powered Operational Optimization',
            'description': 'Process automation and efficiency optimization',
            'price': 10000,
            'duration': '4 months'
        })
    
    # Default service if none selected
    if not services:
        services.append({
            'name': 'AI Readiness Assessment & Strategy',
            'description': 'Comprehensive AI readiness evaluation and roadmap',
            'price': 5000,
            'duration': '1 month'
        })
    
    return services

def get_service_estimated_value(service_type: str) -> float:
    """Get estimated value for service type"""
    service_values = {
        'AI Project Management': 10000,
        'Digital Transformation': 20000,
        'Operational Optimization': 15000,
        'Business Strategy': 12000,
        'Risk Management': 8000,
        'General Consultation': 5000
    }
    return service_values.get(service_type, 5000)

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