/**
 * Orgainse Lead Capture API - Google Apps Script
 * Captures leads directly into Google Sheets with email notifications
 */

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Open the Google Sheet (replace 'SHEET_ID' with your actual sheet ID)
    const sheet = SpreadsheetApp.openById('YOUR_SHEET_ID').getActiveSheet();
    
    // Prepare the row data
    const timestamp = new Date();
    const leadType = data.leadType || 'Website Contact';
    const name = data.name || '';
    const email = data.email || '';
    const company = data.company || '';
    const phone = data.phone || '';
    const message = data.message || '';
    const source = data.source || 'orgainse.com';
    
    // Add row to sheet
    sheet.appendRow([
      timestamp,
      leadType,
      name,
      email,
      company,
      phone,
      message,
      source
    ]);
    
    // Send email notification (optional)
    sendEmailNotification(data, timestamp);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Lead captured successfully',
        timestamp: timestamp
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendEmailNotification(data, timestamp) {
  const subject = `🎯 New Lead: ${data.name || 'Unknown'} from Orgainse Website`;
  
  const body = `
    New lead captured on Orgainse website!
    
    📊 LEAD DETAILS:
    • Name: ${data.name || 'Not provided'}
    • Email: ${data.email || 'Not provided'}
    • Company: ${data.company || 'Not provided'}
    • Phone: ${data.phone || 'Not provided'}
    • Type: ${data.leadType || 'Website Contact'}
    • Source: ${data.source || 'orgainse.com'}
    • Time: ${timestamp}
    
    💬 MESSAGE:
    ${data.message || 'No message provided'}
    
    ---
    Captured via Orgainse Lead System
  `;
  
  // Send email to admin (replace with your email)
  GmailApp.sendEmail('info@orgainse.com', subject, body);
}

// Test function to verify setup
function testCapture() {
  const testData = {
    leadType: 'Test Lead',
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Test Company',
    phone: '+1234567890',
    message: 'This is a test lead',
    source: 'Manual Test'
  };
  
  const result = doPost({
    postData: {
      contents: JSON.stringify(testData)
    }
  });
  
  console.log(result.getContent());
}