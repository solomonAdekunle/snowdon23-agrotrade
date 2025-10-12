const https = require('https');
const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const formData = JSON.parse(event.body);

    // ✅ Environment variables
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = 'apptu7Bf35Da3H3wD';
    const AIRTABLE_TABLE_NAME = 'Request form';
    const ADMIN_EMAILS = process.env.ADMIN_EMAILS; // e.g. info@snowdon23resource.com
    const GMAIL_USER = process.env.GMAIL_USER;
    const GMAIL_PASS = process.env.GMAIL_PASS;

    // ✅ Ensure we send a valid array for Multiple Select fields
    const interestedProducts = Array.isArray(formData.product)
      ? formData.product
      : [formData.product].filter(Boolean);

    // ✅ Prepare Airtable record
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

    // ✅ Send to Airtable
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

    const result = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`Airtable returned status ${res.statusCode}: ${data}`));
          }
        });
      });
      req.on('error', (error) => reject(error));
      req.write(airtableData);
      req.end();
    });

    // ✅ Configure Gmail transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS
      }
    });

    // ✅ Email to Admin (you)
    const adminMailOptions = {
      from: `"Snowdon23 AgroTrade" <${GMAIL_USER}>`,
      to: ADMIN_EMAILS,
      subject: 'New Snowdon23 AgroTrade Form Submission',
      html: `
        <h2>New Inquiry Received</h2>
        <p><strong>Full Name:</strong> ${formData.fullName}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Company:</strong> ${formData.company}</p>
        <p><strong>Product Interest:</strong> ${interestedProducts.join(', ')}</p>
        <p><strong>Message:</strong> ${formData.message}</p>
        <hr>
        <p>This message was automatically sent from the Snowdon23 AgroTrade website.</p>
      `
    };

    // ✅ Confirmation email to Buyer
    const buyerMailOptions = {
      from: `"Snowdon23 AgroTrade" <${GMAIL_USER}>`,
      to: formData.email,
      subject: 'Thank You for Contacting Snowdon23 AgroTrade',
      html: `
        <h2>Thank You, ${formData.fullName || 'Valued Partner'}!</h2>
        <p>We’ve received your inquiry about <strong>${interestedProducts.join(', ')}</strong>.</p>
        <p>Our team will review your request and get back to you within 24 hours.</p>
        <p><strong>Your Message:</strong> ${formData.message}</p>
        <hr>
        <p>Kind regards,<br><strong>Snowdon23 AgroTrade Team</strong><br>
        🌐 <a href="https://snowdon23-agrotrade.netlify.app">snowdon23-agrotrade.netlify.app</a><br>
        📧 info@snowdon23resource.com</p>
      `
    };

    // ✅ Send both emails
    try {
      const adminInfo = await transporter.sendMail(adminMailOptions);
      console.log('✅ Admin email sent:', adminInfo.response);

      const buyerInfo = await transporter.sendMail(buyerMailOptions);
      console.log('✅ Buyer confirmation email sent:', buyerInfo.response);
    } catch (error) {
      console.error('❌ Email sending error:', error);
    }

    // ✅ Response to the front-end
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Form submitted and notifications sent successfully',
        id: result.id
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to submit form',
        details: error.message
      })
    };
  }
};
