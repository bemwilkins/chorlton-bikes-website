# Google Apps Script Setup - Free File Upload Solution

Since you have Google Workspace, we can use **Google Apps Script** which is completely free and handles file uploads perfectly!

## Why Google Apps Script?

- ✅ **100% Free** - No limits, no subscriptions
- ✅ **File Uploads** - Full support for attachments
- ✅ **Uses Your Google Workspace** - Sends from your domain
- ✅ **Reliable** - Google's infrastructure
- ✅ **No Third-Party Services** - Everything stays in your Google account

## Setup Steps

### 1. Create the Google Apps Script

1. Go to [https://script.google.com/](https://script.google.com/)
2. Click **"New Project"**
3. Delete the default code and paste this script:

```javascript
function doPost(e) {
  try {
    // Parse the form data
    const formData = e.parameter;
    const name = formData.name || 'Unknown';
    const email = formData.email || 'No email provided';
    
    // Get the uploaded file
    const fileBlob = e.parameter.photo;
    
    // Create email body
    const emailBody = `
New Bike Donation Submission

Name: ${name}
Email: ${email}

This submission was made through the Bikes4Refugees form on the Chorlton Bikes website.
    `.trim();
    
    // Send email with attachment
    MailApp.sendEmail({
      to: 'ben@chorltonbikedeliveries.coop', // Change to hello@chorltonbikes.coop for production
      subject: 'Bikes4Refugees Bike Donation',
      body: emailBody,
      attachments: fileBlob ? [fileBlob] : [],
      replyTo: email
    });
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'success',
        'message': 'Form submitted successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        'result': 'error',
        'message': error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Click **"Save"** (give it a name like "Bikes4Refugees Form Handler")

### 2. Deploy as Web App (First Time)

1. Click **"Deploy"** → **"New deployment"**
2. Click the gear icon ⚙️ next to "Select type" → Choose **"Web app"**
3. Set these settings:
   - **Description**: "Bikes4Refugees Form Handler"
   - **Execute as**: "Me" (your Google account)
   - **Who has access**: "Anyone" (so the form can submit)
4. Click **"Deploy"**
5. **Copy the Web App URL** - you'll need this!

### 2b. Update Existing Deployment (After Code Changes)

**Important**: When you update the code, you MUST create a new deployment version for changes to take effect!

1. Click **"Deploy"** → **"Manage deployments"**
2. Find your existing deployment and click the **pencil/edit icon** ✏️
3. Click **"New version"** (this creates a new version with your updated code)
4. Optionally update the description
5. Click **"Deploy"**
6. **The Web App URL stays the same** - no need to update your website!

**OR** (Alternative method):
1. Click **"Deploy"** → **"New deployment"**
2. This will create a new deployment with a new URL
3. **Update your website** with the new URL if you use this method (It looks like: `https://script.google.com/macros/s/AKfycby.../exec`)

### 3. Authorize the Script

1. When you first run it, Google will ask for permission
2. Click **"Review Permissions"**
3. Choose your Google account
4. Click **"Advanced"** → **"Go to [Project Name] (unsafe)"**
5. Click **"Allow"** to grant permissions

### 4. Update Your Website Code

Open `index.html` and update the form action (around line 105):

```html
<form id="bikes-refugees-form" class="bikes-refugees-form" 
      action="YOUR_WEB_APP_URL_HERE" 
      method="POST" 
      enctype="multipart/form-data">
```

Replace `YOUR_WEB_APP_URL_HERE` with the Web App URL you copied in step 2.

### 5. Update the JavaScript

The JavaScript in `script.js` should already work, but make sure it's handling the response correctly.

### 6. Test It!

1. Fill out the form on your website
2. Upload a test photo
3. Submit
4. Check your email - you should receive it with the photo attached!

## Production Changes

When ready for production:

1. In the Google Apps Script, change the recipient email:
   ```javascript
   to: 'hello@chorltonbikes.coop',
   ```

2. Update the form action URL if you redeploy (the URL stays the same unless you create a new version)

## Troubleshooting

**Form not submitting?**
- Check browser console for errors
- Verify Web App URL is correct
- Make sure script is deployed and permissions are granted

**Email not received?**
- Check spam folder
- Verify the `to` email in the script
- Check Google Apps Script execution logs (View → Execution log)

**File not attaching?**
- Make sure `enctype="multipart/form-data"` is in form tag
- Check file size (Google Apps Script has a 50MB limit per file)
- Verify file input has `name="photo"`

## Advanced: Add Spam Protection

You can add a simple honeypot field or reCAPTCHA later if needed. For now, the basic setup should work great!

## Notes

- **Free Forever**: Google Apps Script is free with Google Workspace
- **No Limits**: No submission limits (within reason)
- **Reliable**: Uses Google's email infrastructure
- **Secure**: Runs on Google's servers

