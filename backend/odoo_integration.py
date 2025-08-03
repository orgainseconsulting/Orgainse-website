"""
Odoo 18.3 Integration Layer for Orgainse Consulting
Handles all Odoo Business Suite integrations
"""

import os
import json
import requests
import xmlrpc.client
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OdooIntegration:
    """
    Odoo 18.3 Integration Class
    Provides methods to interact with Odoo Business Suite modules
    """
    
    def __init__(self):
        """Initialize Odoo connection parameters"""
        self.odoo_url = os.environ.get('ODOO_URL', 'https://your-odoo-instance.odoo.com')
        self.odoo_db = os.environ.get('ODOO_DB', 'your-database')
        self.odoo_username = os.environ.get('ODOO_USERNAME', 'admin')
        self.odoo_password = os.environ.get('ODOO_PASSWORD', 'admin')
        self.odoo_uid = None
        
        # Initialize connections
        self.common = None
        self.models = None
        self._initialize_connection()
    
    def _initialize_connection(self):
        """Initialize Odoo XML-RPC connection"""
        try:
            # Common endpoint for authentication
            self.common = xmlrpc.client.ServerProxy(f'{self.odoo_url}/xmlrpc/2/common')
            
            # Authenticate and get UID
            self.odoo_uid = self.common.authenticate(
                self.odoo_db, 
                self.odoo_username, 
                self.odoo_password, 
                {}
            )
            
            if self.odoo_uid:
                # Models endpoint for CRUD operations
                self.models = xmlrpc.client.ServerProxy(f'{self.odoo_url}/xmlrpc/2/object')
                logger.info(f"Successfully connected to Odoo. UID: {self.odoo_uid}")
            else:
                logger.error("Failed to authenticate with Odoo")
                
        except Exception as e:
            logger.error(f"Odoo connection error: {str(e)}")
            # Fall back to mock mode for development
            self.models = None
    
    def _execute_odoo_method(self, model: str, method: str, *args) -> Any:
        """Execute Odoo model method with error handling"""
        if not self.models or not self.odoo_uid:
            logger.warning(f"Odoo not connected. Mock execution: {model}.{method}")
            return {'mock': True, 'model': model, 'method': method}
        
        try:
            result = self.models.execute_kw(
                self.odoo_db, 
                self.odoo_uid, 
                self.odoo_password,
                model, 
                method, 
                args
            )
            logger.info(f"Odoo {model}.{method} executed successfully")
            return result
        except Exception as e:
            logger.error(f"Odoo execution error: {str(e)}")
            return None

    # ================================
    # CRM INTEGRATION METHODS
    # ================================
    
    async def create_crm_lead(self, lead_data: Dict) -> Optional[int]:
        """
        Create a new lead in Odoo CRM
        
        Args:
            lead_data: Dictionary with lead information
            
        Returns:
            Odoo lead ID or None if failed
        """
        odoo_lead_data = {
            'name': lead_data.get('name', 'Website Lead'),
            'email_from': lead_data.get('email'),
            'phone': lead_data.get('phone', ''),
            'partner_name': lead_data.get('contact_name', ''),
            'company_name': lead_data.get('company', ''),
            'description': lead_data.get('message', ''),
            'source_id': self._get_or_create_source('Website'),
            'team_id': self._get_sales_team_id(),
            'user_id': self._get_default_salesperson_id(),
            'stage_id': self._get_initial_stage_id(),
            'tag_ids': [(6, 0, [self._get_or_create_tag('Website Lead')])],
            'priority': '1',  # Medium priority
            'website': 'https://www.orgainse.com'
        }
        
        # Add custom fields if available
        if 'ai_score' in lead_data:
            odoo_lead_data['x_ai_maturity_score'] = lead_data['ai_score']
        
        if 'service_interest' in lead_data:
            odoo_lead_data['x_service_interest'] = lead_data['service_interest']
        
        lead_id = self._execute_odoo_method('crm.lead', 'create', [odoo_lead_data])
        
        if lead_id:
            logger.info(f"Created CRM lead with ID: {lead_id}")
            
            # Add activity reminder for follow-up
            await self._create_follow_up_activity(lead_id, 'crm.lead')
            
        return lead_id
    
    async def create_crm_opportunity(self, opportunity_data: Dict) -> Optional[int]:
        """
        Create a new opportunity in Odoo CRM
        
        Args:
            opportunity_data: Dictionary with opportunity information
            
        Returns:
            Odoo opportunity ID or None if failed
        """
        partner_id = await self._find_or_create_partner(opportunity_data.get('email'))
        
        odoo_opportunity_data = {
            'name': opportunity_data.get('name', 'Website Opportunity'),
            'partner_id': partner_id,
            'email_from': opportunity_data.get('email'),
            'phone': opportunity_data.get('phone', ''),
            'expected_revenue': opportunity_data.get('expected_revenue', 5000.0),
            'probability': opportunity_data.get('probability', 25),
            'date_deadline': (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
            'team_id': self._get_sales_team_id(),
            'user_id': self._get_default_salesperson_id(),
            'stage_id': self._get_opportunity_stage_id(),
            'source_id': self._get_or_create_source('Website'),
            'tag_ids': [(6, 0, [self._get_or_create_tag('Website Opportunity')])],
            'description': opportunity_data.get('description', '')
        }
        
        opportunity_id = self._execute_odoo_method('crm.lead', 'create', [odoo_opportunity_data])
        
        if opportunity_id:
            logger.info(f"Created CRM opportunity with ID: {opportunity_id}")
        
        return opportunity_id

    # ================================
    # EMAIL MARKETING INTEGRATION
    # ================================
    
    async def create_marketing_contact(self, contact_data: Dict) -> Optional[int]:
        """
        Create a contact in Odoo Email Marketing
        
        Args:
            contact_data: Dictionary with contact information
            
        Returns:
            Odoo contact ID or None if failed
        """
        # Check if contact already exists
        existing_contacts = self._execute_odoo_method(
            'mailing.contact', 'search', 
            [('email', '=', contact_data.get('email'))]
        )
        
        if existing_contacts:
            logger.info(f"Contact already exists: {contact_data.get('email')}")
            return existing_contacts[0]
        
        odoo_contact_data = {
            'name': contact_data.get('name', contact_data.get('email')),
            'email': contact_data.get('email'),
            'company_name': contact_data.get('company', ''),
            'list_ids': [(6, 0, [self._get_or_create_mailing_list('Newsletter Subscribers')])],
            'opt_out': False,
            'tag_ids': [(6, 0, [self._get_or_create_tag('Website Subscriber')])]
        }
        
        contact_id = self._execute_odoo_method('mailing.contact', 'create', [odoo_contact_data])
        
        if contact_id:
            logger.info(f"Created marketing contact with ID: {contact_id}")
            
            # Send welcome email
            await self._send_welcome_email(contact_id)
        
        return contact_id

    # ================================
    # CALENDAR INTEGRATION
    # ================================
    
    async def create_calendar_event(self, event_data: Dict) -> Optional[int]:
        """
        Create a calendar event in Odoo Calendar
        
        Args:
            event_data: Dictionary with event information
            
        Returns:
            Odoo event ID or None if failed
        """
        partner_id = await self._find_or_create_partner(event_data.get('email'))
        
        odoo_event_data = {
            'name': event_data.get('name', 'AI Consultation'),
            'start': event_data.get('start_datetime'),
            'stop': event_data.get('end_datetime'),
            'allday': False,
            'partner_ids': [(6, 0, [partner_id])] if partner_id else [],
            'user_id': self._get_consultant_user_id(),
            'location': event_data.get('location', 'Virtual Meeting'),
            'description': event_data.get('description', ''),
            'alarm_ids': [(6, 0, [self._get_reminder_alarm_id()])],
            'privacy': 'public',
            'show_as': 'busy',
            'categ_ids': [(6, 0, [self._get_or_create_event_category('Consultation')])]
        }
        
        event_id = self._execute_odoo_method('calendar.event', 'create', [odoo_event_data])
        
        if event_id:
            logger.info(f"Created calendar event with ID: {event_id}")
            
            # Send confirmation email
            await self._send_event_confirmation(event_id)
        
        return event_id

    # ================================
    # SALES INTEGRATION
    # ================================
    
    async def create_sales_quotation(self, quote_data: Dict) -> Optional[int]:
        """
        Create a sales quotation in Odoo Sales
        
        Args:
            quote_data: Dictionary with quotation information
            
        Returns:
            Odoo quotation ID or None if failed
        """
        partner_id = await self._find_or_create_partner(quote_data.get('email'))
        
        if not partner_id:
            logger.error("Could not create partner for quotation")
            return None
        
        odoo_quote_data = {
            'partner_id': partner_id,
            'validity_date': (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
            'payment_term_id': self._get_default_payment_term_id(),
            'team_id': self._get_sales_team_id(),
            'user_id': self._get_default_salesperson_id(),
            'source_id': self._get_or_create_source('Website'),
            'note': quote_data.get('note', 'Generated from website ROI calculator'),
            'order_line': self._prepare_quotation_lines(quote_data.get('services', []))
        }
        
        quote_id = self._execute_odoo_method('sale.order', 'create', [odoo_quote_data])
        
        if quote_id:
            logger.info(f"Created sales quotation with ID: {quote_id}")
            
            # Send quotation by email
            await self._send_quotation_email(quote_id)
        
        return quote_id

    # ================================
    # HELPER METHODS
    # ================================
    
    async def _find_or_create_partner(self, email: str) -> Optional[int]:
        """Find existing partner or create new one"""
        if not email:
            return None
        
        # Search for existing partner
        partners = self._execute_odoo_method(
            'res.partner', 'search', 
            [('email', '=', email)]
        )
        
        if partners:
            return partners[0]
        
        # Create new partner
        partner_data = {
            'name': email.split('@')[0].title(),
            'email': email,
            'is_company': False,
            'customer_rank': 1,
            'supplier_rank': 0
        }
        
        partner_id = self._execute_odoo_method('res.partner', 'create', [partner_data])
        
        if partner_id:
            logger.info(f"Created new partner with ID: {partner_id}")
        
        return partner_id
    
    def _get_or_create_source(self, source_name: str) -> int:
        """Get or create UTM source"""
        sources = self._execute_odoo_method(
            'utm.source', 'search', 
            [('name', '=', source_name)]
        )
        
        if sources:
            return sources[0]
        
        source_data = {'name': source_name}
        source_id = self._execute_odoo_method('utm.source', 'create', [source_data])
        return source_id or 1
    
    def _get_or_create_tag(self, tag_name: str) -> int:
        """Get or create CRM tag"""
        tags = self._execute_odoo_method(
            'crm.tag', 'search', 
            [('name', '=', tag_name)]
        )
        
        if tags:
            return tags[0]
        
        tag_data = {'name': tag_name, 'color': 2}
        tag_id = self._execute_odoo_method('crm.tag', 'create', [tag_data])
        return tag_id or 1
    
    def _get_sales_team_id(self) -> int:
        """Get default sales team ID"""
        teams = self._execute_odoo_method('crm.team', 'search', [], {'limit': 1})
        return teams[0] if teams else 1
    
    def _get_default_salesperson_id(self) -> int:
        """Get default salesperson ID"""
        users = self._execute_odoo_method(
            'res.users', 'search', 
            [('groups_id', 'in', [self._get_sales_group_id()])], 
            {'limit': 1}
        )
        return users[0] if users else 1
    
    def _get_initial_stage_id(self) -> int:
        """Get initial CRM stage ID"""
        stages = self._execute_odoo_method(
            'crm.stage', 'search', 
            [('is_won', '=', False)], 
            {'limit': 1, 'order': 'sequence'}
        )
        return stages[0] if stages else 1
    
    def _get_opportunity_stage_id(self) -> int:
        """Get opportunity stage ID"""
        stages = self._execute_odoo_method(
            'crm.stage', 'search', 
            [('name', 'ilike', 'qualified')], 
            {'limit': 1}
        )
        return stages[0] if stages else 1
    
    def _get_sales_group_id(self) -> int:
        """Get sales group ID"""
        groups = self._execute_odoo_method(
            'res.groups', 'search', 
            [('name', 'ilike', 'sales')], 
            {'limit': 1}
        )
        return groups[0] if groups else 1
    
    def _get_or_create_mailing_list(self, list_name: str) -> int:
        """Get or create mailing list"""
        lists = self._execute_odoo_method(
            'mailing.list', 'search', 
            [('name', '=', list_name)]
        )
        
        if lists:
            return lists[0]
        
        list_data = {'name': list_name}
        list_id = self._execute_odoo_method('mailing.list', 'create', [list_data])
        return list_id or 1
    
    def _get_consultant_user_id(self) -> int:
        """Get consultant user ID"""
        # This should be configured based on your Odoo setup
        return self.odoo_uid or 1
    
    def _get_reminder_alarm_id(self) -> int:
        """Get calendar reminder alarm ID"""
        alarms = self._execute_odoo_method(
            'calendar.alarm', 'search', 
            [('name', 'ilike', '15 minutes')], 
            {'limit': 1}
        )
        return alarms[0] if alarms else 1
    
    def _get_or_create_event_category(self, category_name: str) -> int:
        """Get or create event category"""
        categories = self._execute_odoo_method(
            'calendar.event.type', 'search', 
            [('name', '=', category_name)]
        )
        
        if categories:
            return categories[0]
        
        category_data = {'name': category_name}
        category_id = self._execute_odoo_method('calendar.event.type', 'create', [category_data])
        return category_id or 1
    
    def _get_default_payment_term_id(self) -> int:
        """Get default payment term ID"""
        terms = self._execute_odoo_method(
            'account.payment.term', 'search', 
            [], {'limit': 1}
        )
        return terms[0] if terms else 1
    
    def _prepare_quotation_lines(self, services: List[Dict]) -> List[tuple]:
        """Prepare quotation lines for services"""
        lines = []
        
        for service in services:
            line_data = {
                'product_id': self._get_or_create_service_product(service['name']),
                'name': service.get('description', service['name']),
                'product_uom_qty': service.get('quantity', 1),
                'price_unit': service.get('price', 1000.0),
                'discount': service.get('discount', 0)
            }
            lines.append((0, 0, line_data))
        
        return lines
    
    def _get_or_create_service_product(self, service_name: str) -> int:
        """Get or create service product"""
        products = self._execute_odoo_method(
            'product.product', 'search', 
            [('name', '=', service_name), ('type', '=', 'service')]
        )
        
        if products:
            return products[0]
        
        product_data = {
            'name': service_name,
            'type': 'service',
            'list_price': 1000.0,
            'standard_price': 500.0,
            'sale_ok': True,
            'purchase_ok': False
        }
        
        product_id = self._execute_odoo_method('product.product', 'create', [product_data])
        return product_id or 1
    
    # ================================
    # EMAIL AUTOMATION METHODS
    # ================================
    
    async def _create_follow_up_activity(self, res_id: int, res_model: str):
        """Create follow-up activity"""
        activity_data = {
            'activity_type_id': self._get_follow_up_activity_type_id(),
            'summary': 'Follow up on website lead',
            'date_deadline': (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d'),
            'user_id': self._get_default_salesperson_id(),
            'res_id': res_id,
            'res_model': res_model,
            'note': 'Follow up on lead generated from website'
        }
        
        self._execute_odoo_method('mail.activity', 'create', [activity_data])
    
    def _get_follow_up_activity_type_id(self) -> int:
        """Get follow-up activity type ID"""
        activity_types = self._execute_odoo_method(
            'mail.activity.type', 'search', 
            [('name', 'ilike', 'call')], 
            {'limit': 1}
        )
        return activity_types[0] if activity_types else 1
    
    async def _send_welcome_email(self, contact_id: int):
        """Send welcome email to new subscriber"""
        # This would trigger Odoo's email template
        logger.info(f"Welcome email should be sent to contact {contact_id}")
    
    async def _send_event_confirmation(self, event_id: int):
        """Send event confirmation email"""
        logger.info(f"Event confirmation should be sent for event {event_id}")
    
    async def _send_quotation_email(self, quote_id: int):
        """Send quotation by email"""
        logger.info(f"Quotation email should be sent for quote {quote_id}")

# Create singleton instance
odoo_integration = OdooIntegration()