// Google Apps Script Code for Bikes4Refugees Form
// Copy and paste this into your Google Apps Script project
// See GOOGLE_APPS_SCRIPT_SETUP.md for full instructions

function doPost(e) {
  try {
    // Parse form data - can come as JSON or form parameters
    let name, email, photoBase64, photoName, photoType;
    
    if (e.postData && e.postData.contents) {
      // Try to parse as JSON first
      try {
        const postData = JSON.parse(e.postData.contents);
        name = postData.name || 'Unknown';
        email = postData.email || 'No email provided';
        photoBase64 = postData.photo;
        photoName = postData.photoName || 'photo.jpg';
        photoType = postData.photoType || 'image/jpeg';
      } catch (jsonError) {
        // If not JSON, try form parameters
        name = e.parameter.name || 'Unknown';
        email = e.parameter.email || 'No email provided';
        photoBase64 = e.parameter.photo;
        photoName = e.parameter.photoName || 'photo.jpg';
        photoType = e.parameter.photoType || 'image/jpeg';
      }
    } else {
      // Use form parameters directly
      name = e.parameter.name || 'Unknown';
      email = e.parameter.email || 'No email provided';
      photoBase64 = e.parameter.photo;
      photoName = e.parameter.photoName || 'photo.jpg';
      photoType = e.parameter.photoType || 'image/jpeg';
    }
    
    // Convert base64 to blob for email attachment
    let fileBlob = null;
    if (photoBase64) {
      try {
        const photoBytes = Utilities.base64Decode(photoBase64);
        fileBlob = Utilities.newBlob(photoBytes, photoType, photoName);
      } catch (decodeError) {
        Logger.log('Error decoding photo: ' + decodeError.toString());
      }
    }
    
    // Create email body
    const emailBody = `
New Bike Donation Submission

Name: ${name}
Email: ${email}
${fileBlob ? `Photo: ${photoName}` : 'No photo attached'}

This submission was made through the Bikes4Refugees form on the Chorlton Bikes website.
    `.trim();
    
    // Prepare email options
    const mailOptions = {
      to: 'ben@chorltonbikedeliveries.coop', // Change to hello@chorltonbikes.coop for production
      subject: 'Bikes4Refugees Bike Donation',
      body: emailBody,
      replyTo: email
    };
    
    // Add attachment if file exists
    if (fileBlob && fileBlob.getBytes().length > 0) {
      mailOptions.attachments = [fileBlob];
    }
    
    // Send email
    MailApp.sendEmail(mailOptions);
    
    // Return success HTML page (for iframe submission)
    return HtmlService.createHtmlOutput(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Success</title>
        </head>
        <body>
          <p>Form submitted successfully!</p>
          <script>
            // Send message to parent window if in iframe
            if (window.parent !== window) {
              window.parent.postMessage('form-success', '*');
            }
          </script>
        </body>
      </html>
    `);
      
  } catch (error) {
    // Log error for debugging
    Logger.log('Error: ' + error.toString());
    Logger.log('Error details: ' + JSON.stringify(error));
    
    // Return error response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle OPTIONS request for CORS preflight
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.JSON);
}

