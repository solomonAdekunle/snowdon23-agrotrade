const https = require('https');
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const formData = JSON.parse(event.body);
    
    // Validate required fields
    if (!formData.fullName || !formData.email || !formData.product || !formData.message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    // Environment variables
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = 'apptu7Bf35Da3H3wD';
    const AIRTABLE_TABLE_NAME = 'Request form';
    const ADMIN_EMAILS = process.env.ADMIN_EMAILS || 'info.team@snowdon23resource.com';
    const ZOHO_USER = process.env.ZOHO_USER;
    const ZOHO_PASS = process.env.ZOHO_PASS;

    // Check if environment variables are set
    if (!AIRTABLE_API_KEY || !ZOHO_USER || !ZOHO_PASS) {
      console.error('Missing environment variables');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Ensure interestedProducts is an array
    const interestedProducts = Array.isArray(formData.product)
      ? formData.product
      : [formData.product].filter(Boolean);

    // Prepare Airtable record
    const airtableData = JSON.stringify({
      fields: {
        'Full Name': formData.fullName || '',
        'Email Address': formData.email || '',
        'Phone Number': formData.phone || '',
        'Company Name': formData.company || '',
        'Interested Products': interestedProducts,
        'Message / Request': formData.message || '',
        'Lead Source': 'Website Contact Form',
        'Date Submitted': new Date().toISOString()
      },
      typecast: true
    });

    // Send to Airtable
    console.log('Sending data to Airtable...');
    const options = {
      hostname: 'api.airtable.com',
      path: `/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(airtableData)
      }
    };

    const airtableResult = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Airtable submission successful');
            resolve(JSON.parse(data));
          } else {
            console.error('❌ Airtable error:', res.statusCode, data);
            reject(new Error(`Airtable returned status ${res.statusCode}: ${data}`));
          }
        });
      });
      req.on('error', (error) => {
        console.error('❌ Airtable request error:', error);
        reject(error);
      });
      req.write(airtableData);
      req.end();
    });

    // Configure Zoho SMTP transporter
    console.log('Configuring email transporter...');
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.eu',
      port: 465,
      secure: true,
      auth: {
        user: ZOHO_USER,
        pass: ZOHO_PASS
      }
    });

    // Verify SMTP connection
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified');
    } catch (error) {
      console.error('❌ SMTP verification failed:', error.message);
      // Continue anyway, the sendMail will handle the error
    }

    // Email to Admin
    const adminMailOptions = {
      from: `"Snowdon23 AgroTrade" <${ZOHO_USER}>`,
      to: ADMIN_EMAILS,
      subject: '🌾 New Snowdon23 AgroTrade Form Submission',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #5B2C91 0%, #7B3CB8 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #5B2C91; }
            .value { color: #555; margin-top: 5px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 2px solid #5B2C91; text-align: center; color: #666; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🌾 New Inquiry Received</h2>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">Full Name:</div>
                <div class="value">${formData.fullName}</div>
              </div>
              <div class="field">
                <div class="label">Email:</div>
                <div class="value"><a href="mailto:${formData.email}">${formData.email}</a></div>
              </div>
              <div class="field">
                <div class="label">Phone:</div>
                <div class="value">${formData.phone || 'Not provided'}</div>
              </div>
              <div class="field">
                <div class="label">Company:</div>
                <div class="value">${formData.company || 'Not provided'}</div>
              </div>
              <div class="field">
                <div class="label">Product Interest:</div>
                <div class="value">${interestedProducts.join(', ')}</div>
              </div>
              <div class="field">
                <div class="label">Message:</div>
                <div class="value">${formData.message}</div>
              </div>
            </div>
            <div class="footer">
              <p>This message was automatically sent from the Snowdon23 AgroTrade website.</p>
              <p>Submitted on: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Confirmation email to Customer
    const buyerMailOptions = {
      from: `"Snowdon23 AgroTrade" <${ZOHO_USER}>`,
      to: formData.email,
      subject: '✅ Thank You for Contacting Snowdon23 AgroTrade',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #5B2C91 0%, #7B3CB8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #ddd; border-top: none; }
            .highlight { background: #E6E1F5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #5B2C91; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #ddd; border-top: none; }
            .cta-button { display: inline-block; background: #FFD700; color: #5B2C91; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌾 Thank You!</h1>
            </div>
            <div class="content">
              <h2>Dear ${formData.fullName || 'Valued Partner'},</h2>
              <p>Thank you for your interest in <strong>${interestedProducts.join(', ')}</strong>.</p>
              <p>We've successfully received your inquiry and our team is reviewing your request.</p>
              
              <div class="highlight">
                <strong>⏰ What happens next?</strong><br>
                Our agricultural export specialists will review your requirements and respond within <strong>24 hours</strong> with detailed product information, pricing, and shipping options.
              </div>

              <p><strong>Your inquiry details:</strong></p>
              <p style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
                ${formData.message}
              </p>

              <p style="text-align: center; margin-top: 30px;">
                <a href="https://wa.me/447932727451" class="cta-button">📱 Contact Us on WhatsApp</a>
              </p>
            </div>
            <div class="footer">
              <p><strong>Snowdon23 AgroTrade</strong></p>
              <p>Premium Nigerian Cash Crops | Global Export</p>
              <p>
                🌐 <a href="https://snowdon23-agrotrade.netlify.app">snowdon23-agrotrade.netlify.app</a><br>
                📧 <a href="mailto:info.team@snowdon23resource.com">info.team@snowdon23resource.com</a><br>
                📱 +44 7932 727451 | +234 813 884 1388
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    // Send both emails
    let emailSuccess = true;
    try {
      console.log('Sending admin notification email...');
      const adminInfo = await transporter.sendMail(adminMailOptions);
      console.log('✅ Admin email sent:', adminInfo.messageId);

      console.log('Sending customer confirmation email...');
      const buyerInfo = await transporter.sendMail(buyerMailOptions);
      console.log('✅ Customer confirmation email sent:', buyerInfo.messageId);
    } catch (error) {
      console.error('❌ Email sending error:', error.message);
      emailSuccess = false;
      // Don't fail the entire request if email fails
    }

    // Success response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: true,
        message: emailSuccess 
          ? 'Form submitted and notifications sent successfully' 
          : 'Form submitted successfully, but email notification failed',
        id: airtableResult.id,
        emailSent: emailSuccess
      })
    };

  } catch (error) {
    console.error('❌ Function error:', error.message);
    console.error('Stack:', error.stack);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to submit form',
        details: error.message
      })
    };
  }
};
