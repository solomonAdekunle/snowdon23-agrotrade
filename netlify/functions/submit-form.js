const https = require('https');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const formData = JSON.parse(event.body);

    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = 'apptu7Bf35Da3H3wD';
    const AIRTABLE_TABLE_NAME = 'Request form';

    // ✅ Ensure we send a valid array for Multiple Select fields
    const interestedProducts = Array.isArray(formData.product)
      ? formData.product
      : [formData.product].filter(Boolean);

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
      }
    });

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

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Form submitted successfully',
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
