import json
import uuid
from datetime import datetime
from ._db import get_database, json_response, error_response, CORS_HEADERS

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

async def handler(request):
    """ROI Calculator endpoint"""
    
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': ''
        }
    
    if request.method != 'POST':
        return error_response('Method not allowed', 405)
    
    try:
        # Parse request body
        body = json.loads(request.body) if hasattr(request, 'body') else request
        
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
            return error_response('Email and valid annual revenue are required', 400)
        
        if current_efficiency >= target_efficiency:
            return error_response('Target efficiency must be higher than current efficiency', 400)
        
        # Calculate ROI
        roi_results = calculate_roi(
            annual_revenue, current_efficiency, target_efficiency,
            implementation_cost, annual_operating_cost
        )
        
        # Get database
        db = get_database()
        
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
        await db.roi_calculations.insert_one(roi_calculation)
        
        return json_response({
            'calculation_id': roi_calculation['id'],
            'results': roi_results,
            'message': 'ROI calculation completed successfully'
        })
        
    except (ValueError, TypeError) as e:
        return error_response(f'Invalid input data: {str(e)}', 400)
    except json.JSONDecodeError:
        return error_response('Invalid JSON data', 400)
    except Exception as e:
        return error_response(f'Internal server error: {str(e)}', 500)

# For Vercel runtime
def main(request):
    """Vercel function entry point"""
    import asyncio
    return asyncio.run(handler(request))