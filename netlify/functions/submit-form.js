// Netlify Function to handle Airtable form submissions
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get form data from request body
    const formData = JSON.parse(event.body);

    // Airtable configuration from environment variables
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = 'apptu7Bf35Da3H3wD';
    const AIRTABLE_TABLE_NAME = 'Request form';

    // Prepare data for Airtable
    const airtableData = {
      fields: {
        'Full Name': formData.fullName,
        'Address': formData.email, // Email goes in Address field
        'Company Name': formData.company || '',
        'Interested Products': [formData.product], // Array format
        'Message / Request': formData.message,
        'Lead Source': 'Website Contact Form'
      }
    };

    // Send to Airtable
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(airtableData)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Airtable Error:', errorData);
      throw new Error('Failed to submit to Airtable');
    }

    const result = await response.json();

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
