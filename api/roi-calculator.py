import json
import uuid
import os
from datetime import datetime
from pymongo import MongoClient

def calculate_roi(annual_revenue, current_efficiency, target_efficiency, implementation_cost, annual_operating_cost):
    """Calculate ROI based on efficiency improvements"""
    try:
        # Calculate efficiency improvement
        efficiency_gain = target_efficiency - current_efficiency
        
        # Calculate annual savings based on efficiency gain
        # Assume efficiency translates to cost savings
        baseline_operational_cost = annual_revenue * 0.3  # 30% of revenue as operational baseline
        annual_savings = baseline_operational_cost * (efficiency_gain / 100)
        
        # Calculate net annual benefit
        net_annual_benefit = annual_savings - annual_operating_cost
        
        # Calculate total 3-year benefits
        total_benefits_3yr = net_annual_benefit * 3
        
        # Calculate ROI percentage
        roi_percentage = ((total_benefits_3yr - implementation_cost) / implementation_cost) * 100 if implementation_cost > 0 else 0
        
        # Calculate payback period in months
        if net_annual_benefit > 0:
            payback_months = (implementation_cost / net_annual_benefit) * 12
        else:
            payback_months = float('inf')
        
        return {
            'annual_savings': round(annual_savings, 2),
            'net_annual_benefit': round(net_annual_benefit, 2),
            'total_benefits_3yr': round(total_benefits_3yr, 2),
            'roi_percentage': round(roi_percentage, 1),
            'payback_months': round(payback_months, 1) if payback_months != float('inf') else None,
            'efficiency_gain': efficiency_gain
        }
    except Exception as e:
        raise ValueError(f"ROI calculation error: {str(e)}")

def handler(request):
    """ROI Calculator endpoint for Vercel"""
    
    # Handle CORS preflight
    if request.get('method') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
            'body': ''
        }
    
    try:
        # Parse request body
        body_str = request.get('body', '{}')
        if isinstance(body_str, bytes):
            body_str = body_str.decode('utf-8')
        body = json.loads(body_str)
        
        company_name = body.get('company_name', '').strip()
        industry = body.get('industry', '').strip()
        annual_revenue = float(body.get('annual_revenue', 0))
        current_efficiency = float(body.get('current_efficiency', 0))
        target_efficiency = float(body.get('target_efficiency', 0))
        implementation_cost = float(body.get('implementation_cost', 0))
        annual_operating_cost = float(body.get('annual_operating_cost', 0))
        email = body.get('email', '').strip().lower()
        
        # Validation
        if not email or annual_revenue <= 0:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'error': 'Email and valid annual revenue are required'})
            }
        
        if '@' not in email or '.' not in email:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'error': 'Invalid email format'})
            }
        
        if current_efficiency >= target_efficiency:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                'body': json.dumps({'error': 'Target efficiency must be higher than current efficiency'})
            }
        
        # Calculate ROI
        roi_results = calculate_roi(
            annual_revenue, current_efficiency, target_efficiency,
            implementation_cost, annual_operating_cost
        )
        
        # Database connection
        mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.environ.get('DB_NAME', 'orgainse_consulting')
        
        client = MongoClient(mongo_url)
        db = client[db_name]
        
        # Create ROI calculation record
        roi_calculation = {
            'id': str(uuid.uuid4()),
            'company_name': company_name,
            'industry': industry,
            'email': email,
            'inputs': {
                'annual_revenue': annual_revenue,
                'current_efficiency': current_efficiency,
                'target_efficiency': target_efficiency,
                'implementation_cost': implementation_cost,
                'annual_operating_cost': annual_operating_cost
            },
            'results': roi_results,
            'calculated_at': datetime.utcnow(),
            'source': 'website_roi_calculator'
        }
        
        # Save to database
        db.roi_calculations.insert_one(roi_calculation)
        client.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({
                'calculation_id': roi_calculation['id'],
                'results': roi_results,
                'message': 'ROI calculation completed successfully'
            }, default=str)
        }
        
    except (ValueError, TypeError) as e:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({'error': f'Invalid input data: {str(e)}'})
        }
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({'error': 'Invalid JSON data'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }