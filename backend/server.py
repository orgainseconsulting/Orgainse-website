from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import secrets
import hashlib
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.auth.transport.requests import Request
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Email configuration (optional - for notifications)
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_USER = os.environ.get('EMAIL_USER', '')
EMAIL_PASSWORD = os.environ.get('EMAIL_PASSWORD', '')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'info@orgainse.com')

# Google Calendar API configuration
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI')
SECRET_KEY = os.environ.get('SECRET_KEY', 'default-secret-key')

# OAuth 2.0 scopes for Google Calendar
SCOPES = ['https://www.googleapis.com/auth/calendar.events']

# In-memory storage for user credentials (use database in production)
user_credentials = {}
csrf_states = {}

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

# Service Inquiry Tracking Models
class ServiceInquiry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    service_id: str
    service_name: str
    inquiry_type: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    source: str
    user_data: Optional[Dict[str, Any]] = None

class ServiceInquiryCreate(BaseModel):
    service_id: str
    service_name: str
    inquiry_type: str
    source: str
    user_data: Optional[Dict[str, Any]] = None
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

# Google Calendar Integration Models
class GoogleCalendarBookingCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    service_type: str
    start_datetime: str
    end_datetime: str
    timezone: str = "UTC"
    message: Optional[str] = None

class GoogleCalendarBooking(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_id: str
    html_link: str
    meet_link: Optional[str] = None
    name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    service_type: str
    start_datetime: str
    end_datetime: str
    timezone: str
    message: Optional[str] = None
    status: str = "confirmed"
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class CalendarAuthResponse(BaseModel):
    authorization_url: str
    state: str

class CalendarAuthCallback(BaseModel):
    user_id: str
    status: str

class AvailableSlot(BaseModel):
    start_datetime: str
    end_datetime: str
    available: bool

class AvailableSlotsResponse(BaseModel):
    slots: List[AvailableSlot]
    timezone: str
    date_range: str


# Google Calendar Helper Functions
def create_flow():
    """Create OAuth flow for Google Calendar"""
    return Flow.from_client_config(
        client_config={
            "web": {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [GOOGLE_REDIRECT_URI]
            }
        },
        scopes=SCOPES
    )

def generate_secure_state(user_session_id: str = None) -> str:
    """Generate cryptographically secure state parameter for CSRF protection"""
    timestamp = int(datetime.utcnow().timestamp())
    random_component = secrets.token_urlsafe(32)
    
    state_data = f"{user_session_id or 'anonymous'}:{timestamp}:{random_component}"
    state_hash = hashlib.sha256(state_data.encode()).hexdigest()[:16]
    
    final_state = f"{state_hash}:{timestamp}"
    
    # Store state with expiration (10 minutes)
    csrf_states[final_state] = {
        'user_session': user_session_id or 'anonymous',
        'created': datetime.utcnow(),
        'used': False
    }
    
    return final_state

def validate_state(state: str) -> bool:
    """Validate CSRF state parameter"""
    if state not in csrf_states:
        logging.warning(f"Invalid OAuth state attempted: {state[:16]}...")
        return False
    
    state_info = csrf_states[state]
    
    # Check if already used
    if state_info['used']:
        logging.warning(f"OAuth state replay attempted: {state[:16]}...")
        return False
    
    # Check expiration (10 minutes)
    if datetime.utcnow() - state_info['created'] > timedelta(minutes=10):
        logging.warning(f"Expired OAuth state attempted: {state[:16]}...")
        del csrf_states[state]
        return False
    
    # Mark as used
    state_info['used'] = True
    return True

def get_calendar_service(user_id: str):
    """Get Google Calendar service for user"""
    if user_id not in user_credentials:
        raise HTTPException(status_code=401, detail="User not authenticated")
    
    credentials = user_credentials[user_id]
    
    # Refresh credentials if expired
    if credentials.expired and credentials.refresh_token:
        try:
            credentials.refresh(Request())
            user_credentials[user_id] = credentials
        except Exception as e:
            logging.error(f"Failed to refresh credentials: {str(e)}")
            raise HTTPException(status_code=401, detail="Authentication expired, please re-authenticate")
    
    return build('calendar', 'v3', credentials=credentials)

def get_business_hours():
    """Get business hours configuration"""
    return {
        'monday': {'start': '09:00', 'end': '17:00'},
        'tuesday': {'start': '09:00', 'end': '17:00'},
        'wednesday': {'start': '09:00', 'end': '17:00'},
        'thursday': {'start': '09:00', 'end': '17:00'},
        'friday': {'start': '09:00', 'end': '17:00'},
        'saturday': None,  # Closed
        'sunday': None,   # Closed
    }

def generate_available_slots(start_date: datetime, end_date: datetime, duration_minutes: int = 30) -> List[Dict]:
    """Generate potential time slots based on business hours"""
    slots = []
    current_date = start_date.date()
    end_date_only = end_date.date()
    
    business_hours = get_business_hours()
    
    while current_date <= end_date_only:
        day_name = current_date.strftime('%A').lower()
        
        if day_name in business_hours and business_hours[day_name]:
            day_hours = business_hours[day_name]
            
            # Parse business hours for the day
            start_time = datetime.strptime(day_hours['start'], '%H:%M').time()
            end_time = datetime.strptime(day_hours['end'], '%H:%M').time()
            
            # Generate slots for the day
            current_datetime = datetime.combine(current_date, start_time)
            end_datetime = datetime.combine(current_date, end_time)
            
            while current_datetime + timedelta(minutes=duration_minutes) <= end_datetime:
                slot_end = current_datetime + timedelta(minutes=duration_minutes)
                slots.append({
                    'start': current_datetime,
                    'end': slot_end,
                    'duration': duration_minutes
                })
                current_datetime += timedelta(minutes=duration_minutes)
        
        current_date += timedelta(days=1)
    
    return slots

def filter_available_slots(potential_slots: List[Dict], existing_events: List[Dict]) -> List[Dict]:
    """Filter out slots that conflict with existing events"""
    available_slots = []
    
    for slot in potential_slots:
        is_available = True
        
        for event in existing_events:
            event_start = parse_event_datetime(event['start'])
            event_end = parse_event_datetime(event['end'])
            
            # Check for overlap
            if (slot['start'] < event_end and slot['end'] > event_start):
                is_available = False
                break
        
        if is_available:
            available_slots.append({
                'start_datetime': slot['start'].isoformat(),
                'end_datetime': slot['end'].isoformat(),
                'available': True
            })
    
    return available_slots

def parse_event_datetime(event_datetime: Dict) -> datetime:
    """Parse event datetime from Google Calendar API response"""
    if 'dateTime' in event_datetime:
        return datetime.fromisoformat(event_datetime['dateTime'].replace('Z', '+00:00'))
    else:
        # All-day event
        return datetime.fromisoformat(event_datetime['date'] + 'T00:00:00')


# Email notification helper
async def send_email_notification(subject: str, body: str, to_email: str = None):
    """Send email notification"""
    if not EMAIL_USER or not EMAIL_PASSWORD:
        logging.warning("Email credentials not configured - skipping email notification")
        return False
    
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_USER
        msg['To'] = to_email or ADMIN_EMAIL
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'html'))
        
        server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
        server.starttls()
        server.login(EMAIL_USER, EMAIL_PASSWORD)
        text = msg.as_string()
        server.sendmail(EMAIL_USER, to_email or ADMIN_EMAIL, text)
        server.quit()
        
        logging.info(f"Email sent successfully to {to_email or ADMIN_EMAIL}")
        return True
    except Exception as e:
        logging.error(f"Email sending failed: {str(e)}")
        return False


# API Routes
@api_router.get("/")
async def root():
    return {"message": "Orgainse Consulting API - Let us plan your SUCCESS!", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Contact form endpoint
@api_router.post("/contact", response_model=ContactMessage)
async def create_contact_message(input: ContactMessageCreate):
    """Handle contact form submissions"""
    try:
        contact_dict = input.dict()
        contact_obj = ContactMessage(**contact_dict)
        
        # Insert into MongoDB
        result = await db.contact_messages.insert_one(contact_obj.dict())
        
        if result.inserted_id:
            logging.info(f"Contact message saved to MongoDB: {contact_obj.id}")
            
            # Send email notification to admin
            email_subject = f"New Contact Form Submission - {contact_obj.subject}"
            email_body = f"""
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> {contact_obj.name}</p>
            <p><strong>Email:</strong> {contact_obj.email}</p>
            <p><strong>Phone:</strong> {contact_obj.phone or 'Not provided'}</p>
            <p><strong>Company:</strong> {contact_obj.company or 'Not provided'}</p>
            <p><strong>Subject:</strong> {contact_obj.subject}</p>
            <p><strong>Message:</strong></p>
            <p>{contact_obj.message}</p>
            <p><strong>Timestamp:</strong> {contact_obj.timestamp}</p>
            """
            
            await send_email_notification(email_subject, email_body)
            
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

# Newsletter subscription endpoint
@api_router.post("/newsletter", response_model=NewsletterSubscription)
async def subscribe_newsletter(input: NewsletterSubscriptionCreate):
    """Handle newsletter subscriptions"""
    try:
        # Check if email already exists
        existing_sub = await db.newsletter_subscriptions.find_one({"email": input.email})
        if existing_sub:
            raise HTTPException(status_code=409, detail="Email already subscribed")
        
        subscription_dict = input.dict()
        subscription_obj = NewsletterSubscription(**subscription_dict)
        
        # Save to MongoDB
        result = await db.newsletter_subscriptions.insert_one(subscription_obj.dict())
        
        if result.inserted_id:
            logging.info(f"Newsletter subscription saved to MongoDB: {subscription_obj.id}")
            
            # Send welcome email to subscriber
            welcome_subject = "Welcome to Orgainse Consulting Newsletter!"
            welcome_body = f"""
            <h2>Welcome to Orgainse Consulting!</h2>
            <p>Thank you for subscribing to our newsletter.</p>
            <p>You'll receive updates about:</p>
            <ul>
                <li>AI-native business transformation insights</li>
                <li>Project management best practices</li>
                <li>Industry trends and case studies</li>
                <li>Exclusive offers and resources</li>
            </ul>
            <p>Best regards,<br/>The Orgainse Team</p>
            """
            
            await send_email_notification(welcome_subject, welcome_body, subscription_obj.email)
            
            # Notify admin
            admin_subject = f"New Newsletter Subscription: {subscription_obj.email}"
            admin_body = f"""
            <h2>New Newsletter Subscription</h2>
            <p><strong>Email:</strong> {subscription_obj.email}</p>
            <p><strong>Timestamp:</strong> {subscription_obj.timestamp}</p>
            """
            
            await send_email_notification(admin_subject, admin_body)
            
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
            
            # Send email notification to admin
            email_subject = f"New Consultation Request - {consultation_obj.service_type}"
            email_body = f"""
            <h2>New Consultation Request</h2>
            <p><strong>Name:</strong> {consultation_obj.name}</p>
            <p><strong>Email:</strong> {consultation_obj.email}</p>
            <p><strong>Phone:</strong> {consultation_obj.phone or 'Not provided'}</p>
            <p><strong>Company:</strong> {consultation_obj.company or 'Not provided'}</p>
            <p><strong>Service Type:</strong> {consultation_obj.service_type}</p>
            <p><strong>Preferred Date:</strong> {consultation_obj.preferred_date or 'Not specified'}</p>
            <p><strong>Message:</strong></p>
            <p>{consultation_obj.message or 'No additional message'}</p>
            <p><strong>Timestamp:</strong> {consultation_obj.timestamp}</p>
            """
            
            await send_email_notification(email_subject, email_body)
            
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

# AI Assessment Tool Endpoint
@api_router.post("/ai-assessment", response_model=AIAssessment)
async def create_ai_assessment(input: AIAssessmentCreate):
    """Create AI Assessment with scoring"""
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
            
            # Send email notification to admin
            email_subject = f"New AI Assessment Completed - {input.company}"
            email_body = f"""
            <h2>New AI Assessment Completed</h2>
            <p><strong>Name:</strong> {input.name}</p>
            <p><strong>Email:</strong> {input.email}</p>
            <p><strong>Company:</strong> {input.company}</p>
            <p><strong>Phone:</strong> {input.phone or 'Not provided'}</p>
            <p><strong>AI Maturity Score:</strong> {ai_maturity_score}/100</p>
            <p><strong>Recommendations:</strong></p>
            <ul>
                {''.join([f'<li>{rec}</li>' for rec in recommendations])}
            </ul>
            <p><strong>Timestamp:</strong> {assessment_obj.timestamp}</p>
            """
            
            await send_email_notification(email_subject, email_body)
            
            return assessment_obj
        else:
            raise HTTPException(status_code=500, detail="Failed to save AI assessment")
    
    except Exception as e:
        logging.error(f"Error creating AI assessment: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ROI Calculator Endpoint
@api_router.post("/roi-calculator", response_model=ROICalculatorResult)
async def calculate_roi(input: ROICalculatorInput):
    """Calculate ROI"""
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
            
            # Send email notification to admin
            email_subject = f"New ROI Calculation - {input.company_name}"
            email_body = f"""
            <h2>New ROI Calculation Completed</h2>
            <p><strong>Company:</strong> {input.company_name}</p>
            <p><strong>Email:</strong> {input.email}</p>
            <p><strong>Industry:</strong> {input.industry}</p>
            <p><strong>Company Size:</strong> {input.company_size}</p>
            <p><strong>Current Project Cost:</strong> ${input.current_project_cost:,.2f}</p>
            <p><strong>Potential Savings:</strong> ${roi_result_obj.potential_savings:,.2f}</p>
            <p><strong>ROI Percentage:</strong> {roi_result_obj.roi_percentage:.1f}%</p>
            <p><strong>Payback Period:</strong> {roi_result_obj.payback_period_months} months</p>
            <p><strong>Recommended Services:</strong></p>
            <ul>
                {''.join([f'<li>{service["name"]} - ${service["price"]:,.2f}</li>' for service in roi_result_obj.recommended_services])}
            </ul>
            <p><strong>Timestamp:</strong> {roi_result_obj.timestamp}</p>
            """
            
            await send_email_notification(email_subject, email_body)
            
            return roi_result_obj
        else:
            raise HTTPException(status_code=500, detail="Failed to save ROI calculation")
    
    except Exception as e:
        logging.error(f"Error calculating ROI: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Calendar Booking Endpoint
@api_router.post("/book-consultation", response_model=CalendarBooking)
async def book_consultation_slot(input: CalendarBookingCreate):
    """Book consultation"""
    try:
        # Create booking object
        booking_dict = input.dict()
        booking_obj = CalendarBooking(**booking_dict)
        
        # Save to MongoDB
        result = await db.calendar_bookings.insert_one(booking_obj.dict())
        
        if result.inserted_id:
            logging.info(f"Calendar booking saved to MongoDB: {booking_obj.id}")
            
            # Send confirmation email to client
            client_subject = "Consultation Booking Confirmed - Orgainse Consulting"
            client_body = f"""
            <h2>Consultation Booking Confirmed</h2>
            <p>Dear {input.name},</p>
            <p>Thank you for booking a consultation with Orgainse Consulting.</p>
            <p><strong>Booking Details:</strong></p>
            <ul>
                <li><strong>Service:</strong> {input.service_type}</li>
                <li><strong>Date & Time:</strong> {input.preferred_datetime.strftime('%B %d, %Y at %I:%M %p')} ({input.timezone})</li>
                <li><strong>Duration:</strong> 30 minutes</li>
                <li><strong>Meeting Type:</strong> Virtual (link will be provided)</li>
            </ul>
            <p>We'll send you the meeting link 24 hours before the consultation.</p>
            <p>Best regards,<br/>The Orgainse Team</p>
            """
            
            await send_email_notification(client_subject, client_body, input.email)
            
            # Send notification to admin
            admin_subject = f"New Consultation Booking - {input.service_type}"
            admin_body = f"""
            <h2>New Consultation Booking</h2>
            <p><strong>Name:</strong> {input.name}</p>
            <p><strong>Email:</strong> {input.email}</p>
            <p><strong>Phone:</strong> {input.phone or 'Not provided'}</p>
            <p><strong>Company:</strong> {input.company or 'Not provided'}</p>
            <p><strong>Service Type:</strong> {input.service_type}</p>
            <p><strong>Preferred Date & Time:</strong> {input.preferred_datetime.strftime('%B %d, %Y at %I:%M %p')} ({input.timezone})</p>
            <p><strong>Message:</strong> {input.message or 'No additional message'}</p>
            <p><strong>Timestamp:</strong> {booking_obj.timestamp}</p>
            """
            
            await send_email_notification(admin_subject, admin_body)
            
            return booking_obj
        else:
            raise HTTPException(status_code=500, detail="Failed to save calendar booking")
    
    except Exception as e:
        logging.error(f"Error creating calendar booking: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Service Inquiry Tracking Endpoint
@api_router.post("/service-inquiry", response_model=ServiceInquiry)
async def track_service_inquiry(input: ServiceInquiryCreate):
    """Track service-specific inquiries for CRM analytics"""
    try:
        inquiry_dict = input.dict()
        inquiry_obj = ServiceInquiry(**inquiry_dict)
        
        # Save to MongoDB
        result = await db.service_inquiries.insert_one(inquiry_obj.dict())
        
        if result.inserted_id:
            logging.info(f"Service inquiry tracked: {inquiry_obj.id} for service {inquiry_obj.service_name}")
            
            # Send email notification to admin with service-specific details
            email_subject = f"Service Interest: {inquiry_obj.service_name}"
            email_body = f"""
            <h2>New Service Interest Tracked</h2>
            <p><strong>Service:</strong> {inquiry_obj.service_name}</p>
            <p><strong>Service ID:</strong> {inquiry_obj.service_id}</p>
            <p><strong>Inquiry Type:</strong> {inquiry_obj.inquiry_type}</p>
            <p><strong>Source:</strong> {inquiry_obj.source}</p>
            <p><strong>Timestamp:</strong> {inquiry_obj.timestamp}</p>
            <p><strong>Additional Data:</strong> {inquiry_obj.user_data or 'None'}</p>
            <hr>
            <p><em>This indicates strong interest in this specific service. Consider prioritizing follow-up.</em></p>
            """
            
            await send_email_notification(email_subject, email_body)
            
            return inquiry_obj
        else:
            raise HTTPException(status_code=500, detail="Failed to track service inquiry")
    
    except Exception as e:
        logging.error(f"Error tracking service inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/service-inquiries", response_model=List[ServiceInquiry])
async def get_service_inquiries():
    """Get all service inquiries for analytics"""
    try:
        inquiries = await db.service_inquiries.find().sort("timestamp", -1).to_list(100)
        return [ServiceInquiry(**inquiry) for inquiry in inquiries]
    except Exception as e:
        logging.error(f"Error fetching service inquiries: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
# Google Calendar Integration Endpoints
@api_router.get("/calendar/auth/login", response_model=CalendarAuthResponse)
async def google_calendar_login():
    """Initiate Google Calendar OAuth flow"""
    try:
        flow = create_flow()
        flow.redirect_uri = GOOGLE_REDIRECT_URI
        
        # Generate secure state parameter
        state = generate_secure_state()
        
        authorization_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent',
            state=state
        )
        
        return CalendarAuthResponse(
            authorization_url=authorization_url,
            state=state
        )
    
    except Exception as e:
        logging.error(f"Error initiating OAuth flow: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to initiate authentication")

@api_router.get("/calendar/auth/callback", response_model=CalendarAuthCallback)
async def google_calendar_callback(code: str, state: str):
    """Handle OAuth callback from Google"""
    try:
        # Validate state parameter
        if not validate_state(state):
            raise HTTPException(status_code=400, detail="Invalid or expired authentication state")
        
        flow = create_flow()
        flow.redirect_uri = GOOGLE_REDIRECT_URI
        
        # Exchange authorization code for credentials
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Generate user ID and store credentials
        user_id = "user_" + str(len(user_credentials) + 1) + "_" + str(int(datetime.utcnow().timestamp()))
        user_credentials[user_id] = credentials
        
        logging.info(f"User authenticated successfully: {user_id}")
        
        return CalendarAuthCallback(
            user_id=user_id,
            status="authenticated"
        )
    
    except Exception as e:
        logging.error(f"Error handling OAuth callback: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Authentication failed: {str(e)}")

@api_router.get("/calendar/available-slots", response_model=AvailableSlotsResponse)
async def get_available_slots(user_id: str, date: str = None, duration: int = 30):
    """Get available time slots for booking consultations"""
    try:
        service = get_calendar_service(user_id)
        
        # Set date range (default: next 7 days)
        if date:
            start_date = datetime.fromisoformat(date + 'T00:00:00')
        else:
            start_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        end_date = start_date + timedelta(days=7)
        
        # Get existing events from calendar
        events_result = service.events().list(
            calendarId='primary',
            timeMin=start_date.isoformat() + 'Z',
            timeMax=end_date.isoformat() + 'Z',
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        existing_events = events_result.get('items', [])
        
        # Generate potential slots based on business hours
        potential_slots = generate_available_slots(start_date, end_date, duration)
        
        # Filter out conflicts with existing events
        available_slots = filter_available_slots(potential_slots, existing_events)
        
        return AvailableSlotsResponse(
            slots=available_slots[:20],  # Limit to 20 slots for performance
            timezone="UTC",
            date_range=f"{start_date.date()} to {end_date.date()}"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching available slots: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch available slots")

@api_router.post("/calendar/book-consultation", response_model=GoogleCalendarBooking)
async def book_google_calendar_consultation(booking: GoogleCalendarBookingCreate, user_id: str):
    """Book consultation using Google Calendar"""
    try:
        service = get_calendar_service(user_id)
        
        # Create event object
        event = {
            'summary': f'Free Consultation - {booking.name}',
            'description': f'''Consultation Details:
- Name: {booking.name}
- Email: {booking.email}
- Phone: {booking.phone or 'Not provided'}
- Company: {booking.company or 'Not provided'}
- Service Type: {booking.service_type}
- Message: {booking.message or 'No additional message'}

This is a free 30-minute consultation session.''',
            'start': {
                'dateTime': booking.start_datetime,
                'timeZone': booking.timezone,
            },
            'end': {
                'dateTime': booking.end_datetime,
                'timeZone': booking.timezone,
            },
            'attendees': [
                {'email': booking.email},
            ],
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 15},
                ],
            },
            'conferenceData': {
                'createRequest': {
                    'requestId': f"consultation-{booking.email}-{int(datetime.utcnow().timestamp())}",
                    'conferenceSolutionKey': {'type': 'hangoutsMeet'}
                }
            }
        }
        
        # Create the event
        created_event = service.events().insert(
            calendarId='primary',
            body=event,
            conferenceDataVersion=1
        ).execute()
        
        # Extract meeting link
        meet_link = None
        if 'conferenceData' in created_event and 'entryPoints' in created_event['conferenceData']:
            for entry_point in created_event['conferenceData']['entryPoints']:
                if entry_point.get('entryPointType') == 'video':
                    meet_link = entry_point.get('uri')
                    break
        
        # Create booking object
        booking_obj = GoogleCalendarBooking(
            event_id=created_event['id'],
            html_link=created_event['htmlLink'],
            meet_link=meet_link,
            name=booking.name,
            email=booking.email,
            phone=booking.phone,
            company=booking.company,
            service_type=booking.service_type,
            start_datetime=booking.start_datetime,
            end_datetime=booking.end_datetime,
            timezone=booking.timezone,
            message=booking.message
        )
        
        # Save to MongoDB
        result = await db.google_calendar_bookings.insert_one(booking_obj.dict())
        
        if result.inserted_id:
            logging.info(f"Google Calendar booking saved: {booking_obj.id}")
            
            # Send confirmation email to client
            start_dt = datetime.fromisoformat(booking.start_datetime.replace('Z', '+00:00'))
            client_subject = "Consultation Confirmed - Orgainse Consulting"
            client_body = f"""
            <h2>Your Consultation is Confirmed!</h2>
            <p>Dear {booking.name},</p>
            <p>Thank you for booking a consultation with Orgainse Consulting. Your meeting has been scheduled and added to your calendar.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">Meeting Details:</h3>
                <p><strong>Service:</strong> {booking.service_type}</p>
                <p><strong>Date & Time:</strong> {start_dt.strftime('%B %d, %Y at %I:%M %p')} ({booking.timezone})</p>
                <p><strong>Duration:</strong> 30 minutes</p>
                <p><strong>Meeting Type:</strong> Virtual via Google Meet</p>
                {f'<p><strong>Join Meeting:</strong> <a href="{meet_link}" style="color: #059669;">{meet_link}</a></p>' if meet_link else ''}
                <p><strong>Calendar Link:</strong> <a href="{created_event['htmlLink']}" style="color: #059669;">View in Google Calendar</a></p>
            </div>
            
            <p>You'll receive calendar reminders 24 hours and 15 minutes before the meeting.</p>
            <p>We look forward to discussing your AI transformation journey!</p>
            
            <p>Best regards,<br/>
            <strong>The Orgainse Consulting Team</strong><br/>
            AI-Native Business Transformation Experts</p>
            """
            
            await send_email_notification(client_subject, client_body, booking.email)
            
            # Notify admin
            admin_subject = f"New Consultation Booked - {booking.service_type}"
            admin_body = f"""
            <h2>New Google Calendar Consultation Booked</h2>
            <p><strong>Client:</strong> {booking.name}</p>
            <p><strong>Email:</strong> {booking.email}</p>
            <p><strong>Phone:</strong> {booking.phone or 'Not provided'}</p>
            <p><strong>Company:</strong> {booking.company or 'Not provided'}</p>
            <p><strong>Service Type:</strong> {booking.service_type}</p>
            <p><strong>Date & Time:</strong> {start_dt.strftime('%B %d, %Y at %I:%M %p')} ({booking.timezone})</p>
            <p><strong>Message:</strong> {booking.message or 'No additional message'}</p>
            <p><strong>Calendar Link:</strong> <a href="{created_event['htmlLink']}">View in Google Calendar</a></p>
            {f'<p><strong>Meet Link:</strong> <a href="{meet_link}">Join Meeting</a></p>' if meet_link else ''}
            <p><strong>Event ID:</strong> {created_event['id']}</p>
            """
            
            await send_email_notification(admin_subject, admin_body)
            
        return booking_obj
    
    except HTTPException:
        raise
    except HttpError as error:
        logging.error(f"Google Calendar API error: {str(error)}")
        if error.resp.status == 403:
            raise HTTPException(status_code=403, detail="Calendar access forbidden. Please re-authenticate.")
        else:
            raise HTTPException(status_code=400, detail=f"Calendar API error: {str(error)}")
    except Exception as e:
        logging.error(f"Error creating Google Calendar booking: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create booking")

@api_router.get("/calendar/bookings", response_model=List[GoogleCalendarBooking])
async def get_google_calendar_bookings():
    """Get all Google Calendar bookings"""
    try:
        bookings = await db.google_calendar_bookings.find().sort("timestamp", -1).to_list(100)
        return [GoogleCalendarBooking(**booking) for booking in bookings]
    except Exception as e:
        logging.error(f"Error fetching Google Calendar bookings: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# Analytics endpoints
@api_router.get("/analytics/overview")
async def get_analytics_overview():
    try:
        # Get counts from different collections
        contact_count = await db.contact_messages.count_documents({})
        newsletter_count = await db.newsletter_subscriptions.count_documents({})
        consultation_count = await db.consultation_requests.count_documents({})
        ai_assessment_count = await db.ai_assessments.count_documents({})
        roi_calculation_count = await db.roi_calculations.count_documents({})
        calendar_booking_count = await db.calendar_bookings.count_documents({})
        service_inquiry_count = await db.service_inquiries.count_documents({})
        
        # Get recent activity
        recent_contacts = await db.contact_messages.count_documents({
            "timestamp": {"$gte": datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)}
        })
        
        # Service-specific analytics
        service_interest_stats = await db.service_inquiries.aggregate([
            {"$group": {"_id": "$service_name", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]).to_list(10)
        
        return {
            "total_contacts": contact_count,
            "total_newsletter_subscribers": newsletter_count,
            "total_consultations": consultation_count,
            "total_ai_assessments": ai_assessment_count,
            "total_roi_calculations": roi_calculation_count,
            "total_calendar_bookings": calendar_booking_count,
            "total_service_inquiries": service_inquiry_count,
            "today_contacts": recent_contacts,
            "service_interest_breakdown": service_interest_stats,
            "timestamp": datetime.utcnow()
        }
    
    except Exception as e:
        logging.error(f"Error fetching analytics: {str(e)}")
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
        await db.ai_assessments.create_index("timestamp")
        await db.roi_calculations.create_index("timestamp") 
        await db.calendar_bookings.create_index("timestamp")
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.error(f"Error creating indexes: {str(e)}")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Shutting down database connection...")
    client.close()