// Netlify Function to handle Airtable form submissions + SendGrid emails
const https = require('https');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const formData = JSON.parse(event.body);

    // 🧩 Honeypot (optional): if you added <input name="website" style="display:none">
    if (formData.website) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Spam detected' }) };
    }

    // ----- Airtable -----
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = 'apptu7Bf35Da3H3wD';
    const AIRTABLE_TABLE_NAME = 'Request form';

    const airtablePayload = JSON.stringify({
      fields: {
        'Full Name': formData.fullName,
        'Email Address': formData.email,
        'Phone Number': formData.phone || '',
        'Company Name': formData.company || '',
        'Interested Products': [formData.product], // multi-select
        'Message / Request': formData.message,
        'Lead Source': 'Website Contact Form',
        'Date Submitted': new Date().toISOString()
      }
    });

    const airtableOptions = {
      hostname: 'api.airtable.com',
      path: `/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(airtablePayload)
      }
    };

    const airtableResult = await httpRequest(airtableOptions, airtablePayload);
    const recordId = airtableResult.id;

    // ----- SendGrid email (optional, if SENDGRID_API_KEY present) -----
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@snowdon23resources.com';
    const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'info@snowdon23resources.com').split(',').map(s => s.trim());

    if (SENDGRID_API_KEY) {
      // Email to buyer (confirmation)
      const buyerSubject = 'We received your request – Snowdon23 AgroTrade';
      const buyerHtml = `
        <div style="font-family:Arial,Helvetica,sans-serif">
          <h2>Thank you, ${escapeHtml(formData.fullName || '')}!</h2>
          <p>We have received your request and will respond within <strong>24 hours</strong>.</p>
          <p><strong>Details you submitted:</strong></p>
          <ul>
            <li><strong>Company:</strong> ${escapeHtml(formData.company || '')}</li>
            <li><strong>Product interest:</strong> ${escapeHtml(formData.product || '')}</li>
            <li><strong>Message:</strong> ${escapeHtml(formData.message || '')}</li>
          </ul>
          <hr>
          <p><strong>Snowdon23 Resource Ltd</strong><br>
          +44 7932 727 451 | +234 813 884 1388<br>
          info@snowdon23resources.com<br>
          “Transparency. Trust. Trade. | Connecting Africa’s Harvest to the World.”</p>
        </div>
      `;

      await sendWithSendGrid({
        apiKey: SENDGRID_API_KEY,
        from: { email: FROM_EMAIL, name: 'Snowdon23 AgroTrade' },
        to: [{ email: formData.email }],
        subject: buyerSubject,
        html: buyerHtml
      });

      // Email to admin (lead notification)
      const adminSubject = `New website inquiry from ${formData.fullName || 'Unknown'}`;
      const adminHtml = `
        <div style="font-family:Arial,Helvetica,sans-serif">
          <h3>New AgroTrade Form Submission</h3>
          <p><strong>Full Name:</strong> ${escapeHtml(formData.fullName || '')}</p>
          <p><strong>Email:</strong> ${escapeHtml(formData.email || '')}</p>
          <p><strong>Phone:</strong> ${escapeHtml(formData.phone || '')}</p>
          <p><strong>Company:</strong> ${escapeHtml(formData.company || '')}</p>
          <p><strong>Product:</strong> ${escapeHtml(formData.product || '')}</p>
          <p><strong>Message:</strong><br>${escapeHtml(formData.message || '')}</p>
          <hr>
          <p>Airtable Record ID: ${recordId}</p>
        </div>
      `;

      for (const adminEmail of ADMIN_EMAILS) {
        await sendWithSendGrid({
          apiKey: SENDGRID_API_KEY,
          from: { email: FROM_EMAIL, name: 'Snowdon23 AgroTrade' },
          to: [{ email: adminEmail }],
          subject: adminSubject,
          html: adminHtml
        });
      }
    } else {
      console.warn('SENDGRID_API_KEY not set; skipping email sends.');
    }

    // Response to frontend
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Form submitted successfully',
        id: recordId
      })
    };

  } catch (error) {
    console.error('Server error:', error.message, error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to submit form', details: error.message })
    };
  }
};

// ---- helpers ----
function httpRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data || '{}'));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

function sendWithSendGrid({ apiKey, from, to, subject, html }) {
  const payload = JSON.stringify({
    personalizations: [{ to }],
    from,
    reply_to: { email: 'info@snowdon23resources.com', name: 'Snowdon23 Resource Ltd' },
    subject,
    content: [{ type: 'text/html', value: html }]
  });

  const options = {
    hostname: 'api.sendgrid.com',
    path: '/v3/mail/send',
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  return httpRequest(options, payload);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
