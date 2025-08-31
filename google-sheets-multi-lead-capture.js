/**
 * Orgainse Multi-Sheet Lead Capture System
 * Routes different lead types to appropriate sheets
 */

// Configuration - UPDATE THESE VALUES
const CONFIG = {
  SPREADSHEET_ID: 'YOUR_SHEET_ID_HERE',
  ADMIN_EMAIL: 'info@orgainse.com',
  
  // Sheet names (must match your Google Sheets tabs)
  SHEETS: {
    NEWSLETTER: 'Newsletter',
    ROI_CALCULATOR: 'ROI Calculator', 
    AI_ASSESSMENT: 'AI Assessment',
    CONSULTATIONS: 'Consultations',
    SERVICE_INQUIRIES: 'Service Inquiries',
    CONTACT_FORMS: 'Contact Forms',
    DASHBOARD: 'Dashboard'
  }
};

/**
 * Handle preflight OPTIONS requests for CORS
 */
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

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const timestamp = new Date();
    
    // Route to appropriate sheet based on lead type
    const result = routeLeadData(data, timestamp);
    
    // Send notification email
    sendNotificationEmail(data, timestamp);
    
    // Update dashboard stats
    updateDashboard(data.leadType, timestamp);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Lead captured successfully',
        timestamp: timestamp.toISOString(),
        leadType: data.leadType,
        sheet: result.sheetName
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
      
  } catch (error) {
    console.error('Lead capture error:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Failed to capture lead: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
  }
}

function routeLeadData(data, timestamp) {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  
  switch (data.leadType) {
    case 'Newsletter':
      return captureNewsletterLead(spreadsheet, data, timestamp);
      
    case 'ROI Calculator':
      return captureROICalculatorLead(spreadsheet, data, timestamp);
      
    case 'AI Assessment':
      return captureAIAssessmentLead(spreadsheet, data, timestamp);
      
    case 'Consultation':
      return captureConsultationLead(spreadsheet, data, timestamp);
      
    case 'Service Inquiry':
      return captureServiceInquiryLead(spreadsheet, data, timestamp);
      
    case 'Contact Form':
    default:
      return captureContactFormLead(spreadsheet, data, timestamp);
  }
}

function captureNewsletterLead(spreadsheet, data, timestamp) {
  const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.NEWSLETTER);
  
  sheet.appendRow([
    timestamp,
    data.email || '',
    data.source || 'orgainse.com',
    data.userAgent || '',
    data.ipAddress || ''
  ]);
  
  return { sheetName: CONFIG.SHEETS.NEWSLETTER };
}

function captureROICalculatorLead(spreadsheet, data, timestamp) {
  const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.ROI_CALCULATOR);
  
  sheet.appendRow([
    timestamp,
    data.name || '',
    data.email || '',
    data.company || '',
    data.role || '',
    data.company_size || '',
    data.industry || '',
    data.current_project_cost || 0,
    data.project_duration_months || 0,
    data.current_efficiency_rating || 0,
    Array.isArray(data.desired_services) ? data.desired_services.join(', ') : '',
    data.roiResult || '',
    data.source || 'orgainse.com/roi-calculator'
  ]);
  
  return { sheetName: CONFIG.SHEETS.ROI_CALCULATOR };
}

function captureAIAssessmentLead(spreadsheet, data, timestamp) {
  const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.AI_ASSESSMENT);
  
  sheet.appendRow([
    timestamp,
    data.name || '',
    data.email || '',
    data.company || '',
    data.role || '',
    data.industry || '',
    data.company_size || '',
    data.current_ai_usage || '',
    data.main_challenges || '',
    data.goals || '',
    data.assessmentScore || '',
    data.recommendations || '',
    data.source || 'orgainse.com/ai-assessment'
  ]);
  
  return { sheetName: CONFIG.SHEETS.AI_ASSESSMENT };
}

function captureConsultationLead(spreadsheet, data, timestamp) {
  const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.CONSULTATIONS);
  
  sheet.appendRow([
    timestamp,
    data.name || '',
    data.email || '',
    data.phone || '',
    data.company || '',
    data.service_type || '',
    data.preferred_date || '',
    data.preferred_time || '',
    data.message || '',
    data.urgency || '',
    data.budget_range || '',
    data.source || 'orgainse.com/consultation'
  ]);
  
  return { sheetName: CONFIG.SHEETS.CONSULTATIONS };
}

function captureServiceInquiryLead(spreadsheet, data, timestamp) {
  const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.SERVICE_INQUIRIES);
  
  sheet.appendRow([
    timestamp,
    data.leadType || 'Service Inquiry',
    data.service_name || '',
    data.name || '',
    data.email || '',
    data.company || '',
    data.phone || '',
    data.message || '',
    data.budget || '',
    data.timeline || '',
    data.source || 'orgainse.com/services'
  ]);
  
  return { sheetName: CONFIG.SHEETS.SERVICE_INQUIRIES };
}

function captureContactFormLead(spreadsheet, data, timestamp) {
  const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.CONTACT_FORMS);
  
  sheet.appendRow([
    timestamp,
    data.name || '',
    data.email || '',
    data.phone || '',
    data.company || '',
    data.subject || '',
    data.message || '',
    data.source || 'orgainse.com/contact'
  ]);
  
  return { sheetName: CONFIG.SHEETS.CONTACT_FORMS };
}

function updateDashboard(leadType, timestamp) {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(CONFIG.SHEETS.DASHBOARD);
    
    const today = timestamp.toDateString();
    const lastRow = sheet.getLastRow();
    
    // Find today's row or create new one
    let todayRow = -1;
    if (lastRow > 1) {
      const dates = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (let i = 0; i < dates.length; i++) {
        if (dates[i][0].toDateString() === today) {
          todayRow = i + 2; // +2 because array is 0-indexed and we start from row 2
          break;
        }
      }
    }
    
    if (todayRow === -1) {
      // Create new row for today
      sheet.appendRow([timestamp, 1, 0, 0, 0, 0, 0, 0]);
      todayRow = sheet.getLastRow();
    }
    
    // Update counters based on lead type
    const row = sheet.getRange(todayRow, 1, 1, 8).getValues()[0];
    row[1] += 1; // Total leads
    
    switch (leadType) {
      case 'Newsletter': row[2] += 1; break;
      case 'ROI Calculator': row[3] += 1; break;
      case 'AI Assessment': row[4] += 1; break;
      case 'Consultation': row[5] += 1; break;
      case 'Service Inquiry': row[6] += 1; break;
      case 'Contact Form': 
      default: row[7] += 1; break;
    }
    
    sheet.getRange(todayRow, 1, 1, 8).setValues([row]);
    
  } catch (error) {
    console.error('Dashboard update failed:', error);
  }
}

function sendNotificationEmail(data, timestamp) {
  try {
    const subject = `🎯 New ${data.leadType || 'Lead'}: ${data.name || 'Unknown'} - Orgainse`;
    
    let emailBody = `
🚀 NEW LEAD CAPTURED - ${data.leadType || 'General Contact'}

📊 LEAD DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Name: ${data.name || 'Not provided'}
• Email: ${data.email || 'Not provided'}
• Company: ${data.company || 'Not provided'}
• Phone: ${data.phone || 'Not provided'}
• Source: ${data.source || 'orgainse.com'}
• Captured: ${timestamp.toLocaleString()}
• Lead Type: ${data.leadType || 'Contact Form'}
`;

    // Add specific details based on lead type
    if (data.leadType === 'ROI Calculator') {
      emailBody += `
💰 ROI CALCULATOR DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Current Project Cost: $${data.current_project_cost || 'N/A'}
• Duration: ${data.project_duration_months || 'N/A'} months
• Efficiency Rating: ${data.current_efficiency_rating || 'N/A'}/10
• Desired Services: ${Array.isArray(data.desired_services) ? data.desired_services.join(', ') : 'N/A'}
• Industry: ${data.industry || 'N/A'}
`;
    } else if (data.leadType === 'AI Assessment') {
      emailBody += `
🧠 AI ASSESSMENT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Current AI Usage: ${data.current_ai_usage || 'N/A'}
• Main Challenges: ${data.main_challenges || 'N/A'}
• Goals: ${data.goals || 'N/A'}
• Company Size: ${data.company_size || 'N/A'}
• Industry: ${data.industry || 'N/A'}
`;
    } else if (data.leadType === 'Consultation') {
      emailBody += `
📞 CONSULTATION REQUEST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Service Type: ${data.service_type || 'N/A'}
• Preferred Date: ${data.preferred_date || 'N/A'}
• Preferred Time: ${data.preferred_time || 'N/A'}
• Urgency: ${data.urgency || 'N/A'}
• Budget Range: ${data.budget_range || 'N/A'}
`;
    }

    emailBody += `
💬 MESSAGE/INQUIRY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.message || data.subject || 'No message provided'}

🎯 PRIORITY LEVEL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${getPriorityLevel(data)}

---
💡 Powered by Orgainse Multi-Sheet Lead System
    `;
    
    GmailApp.sendEmail(CONFIG.ADMIN_EMAIL, subject, emailBody);
    
  } catch (emailError) {
    console.error('Email notification failed:', emailError);
  }
}

function getPriorityLevel(data) {
  if (data.leadType === 'Consultation') return '🔴 HIGH - Consultation Request';
  if (data.leadType === 'ROI Calculator' && data.current_project_cost > 50000) return '🟠 HIGH - High Budget ROI';
  if (data.leadType === 'AI Assessment') return '🟡 MEDIUM - Assessment Interest';
  if (data.leadType === 'Service Inquiry') return '🟡 MEDIUM - Service Interest';
  return '🟢 STANDARD - Newsletter/Contact';
}

// Test function for each lead type
function testAllLeadTypes() {
  const testLeads = [
    {
      leadType: 'Newsletter',
      email: 'test@newsletter.com',
      source: 'Homepage Newsletter'
    },
    {
      leadType: 'Contact Form',
      name: 'John Smith',
      email: 'john@company.com',
      phone: '+1234567890',
      company: 'Test Corp',
      subject: 'AI Consulting Inquiry',
      message: 'Interested in AI transformation services',
      source: 'Contact Page'
    },
    {
      leadType: 'ROI Calculator',
      name: 'Sarah Johnson',
      email: 'sarah@startup.com',
      company: 'Innovation Inc',
      current_project_cost: 75000,
      project_duration_months: 6,
      current_efficiency_rating: 7,
      desired_services: ['AI Strategy', 'Process Automation'],
      industry: 'Technology'
    }
  ];
  
  testLeads.forEach((testData, index) => {
    console.log(`Testing ${testData.leadType}...`);
    const result = doPost({
      postData: {
        contents: JSON.stringify(testData)
      }
    });
    console.log(`Test ${index + 1} Result:`, result.getContent());
  });
}