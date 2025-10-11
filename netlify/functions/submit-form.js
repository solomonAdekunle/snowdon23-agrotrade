/**
 * Snowdon23 AgroTrade – Form Handler
 * Saves leads to Airtable and sends branded Gmail confirmation + admin notifications
 * Requires environment variables:
 *  AIRTABLE_API_KEY
 *  GMAIL_USER
 *  GMAIL_PASS
 *  ADMIN_EMAILS
 */

const https = require("https");
const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const formData = JSON.parse(event.body);
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = "apptu7Bf35Da3H3wD";
    const AIRTABLE_TABLE_NAME = "Request form";

    // ---- Save to Airtable ----
    const airtablePayload = JSON.stringify({
      fields: {
        "Full Name": formData.fullName,
        "Email Address": formData.email,
        "Phone Number": formData.phone || "",
        "Company Name": formData.company || "",
        "Interested Products": [formData.product],
        "Message / Request": formData.message,
        "Lead Source": "Website Contact Form",
        "Date Submitted": new Date().toISOString(),
      },
    });

    const options = {
      hostname: "api.airtable.com",
      path: `/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
        AIRTABLE_TABLE_NAME
      )}`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(airtablePayload),
      },
    };

    await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Airtable returned status ${res.statusCode}: ${data}`));
          }
        });
      });
      req.on("error", reject);
      req.write(airtablePayload);
      req.end();
    });

    // ---- Send Gmail notifications ----
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Branded buyer email (purple + gold)
    const buyerMail = {
      from: `"Snowdon23 AgroTrade" <${process.env.GMAIL_USER}>`,
      to: formData.email,
      subject: "We received your request – Snowdon23 AgroTrade",
      html: `
      <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;
                  color:#333;max-width:650px;margin:auto;
                  border-radius:12px;overflow:hidden;
                  border:1px solid #e0e0e0;">
        <div style="background:linear-gradient(135deg,#5B2C91,#7B3CB8);
                    color:#fff;padding:25px 20px;text-align:center;">
          <h1 style="margin:0;font-size:24px;">Snowdon23 AgroTrade</h1>
          <p style="margin-top:6px;font-size:15px;color:#FFD700;">
            Connecting African Agro-Products to the Global World
          </p>
        </div>
        <div style="padding:25px 20px;background:#fafafa;">
          <h2 style="color:#5B2C91;">Thank you, ${formData.fullName}!</h2>
          <p style="font-size:15px;line-height:1.6;">
            We’ve received your inquiry and our export team will respond within <strong>24 hours</strong>.
          </p>
          <div style="background:#fff;border-radius:10px;padding:15px 20px;
                      box-shadow:0 2px 6px rgba(0,0,0,0.08);margin-top:15px;">
            <p><strong>Company:</strong> ${formData.company || "—"}</p>
            <p><strong>Product Interest:</strong> ${formData.product}</p>
            <p><strong>Message:</strong><br>${formData.message}</p>
          </div>
          <p style="margin-top:25px;font-size:15px;">
            You can reply directly to this email or reach us at 
            <a href="mailto:info@snowdon23resources.com"
               style="color:#5B2C91;text-decoration:none;font-weight:600;">
               info@snowdon23resources.com</a>.
          </p>
        </div>
        <div style="background:#2A1448;color:#fff;padding:15px;text-align:center;
                    font-size:13px;">
          <p style="margin:0;">
            © 2025 Snowdon23 Resource Ltd | 5 Gloryland Estate CDA, Ogbogbo Ijebu, Ogun State Nigeria
          </p>
          <p style="margin-top:4px;color:#FFD700;">Transparency • Trust • Trade</p>
        </div>
      </div>`,
    };

    // Admin notification email
    const adminMail = {
      from: `"Snowdon23 AgroTrade" <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAILS,
      subject: `New form submission from ${formData.fullName}`,
      html: `
      <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;
                  color:#333;max-width:650px;margin:auto;
                  border:1px solid #e0e0e0;border-radius:10px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#5B2C91,#7B3CB8);
                    color:#fff;padding:18px 20px;">
          <h2 style="margin:0;font-size:20px;">New Website Inquiry</h2>
          <p style="margin-top:4px;font-size:14px;color:#FFD700;">
            From Snowdon23 AgroTrade Form
          </p>
        </div>
        <div style="padding:20px;background:#fafafa;">
          <p><strong>Full Name:</strong> ${formData.fullName}</p>
          <p><strong>Email Address:</strong> ${formData.email}</p>
          <p><strong>Phone Number:</strong> ${formData.phone || "—"}</p>
          <p><strong>Company Name:</strong> ${formData.company || "—"}</p>
          <p><strong>Interested Product:</strong> ${formData.product}</p>
          <p><strong>Message / Request:</strong><br>${formData.message}</p>
        </div>
        <div style="background:#2A1448;color:#FFD700;padding:12px;text-align:center;
                    font-size:13px;">
          <p style="margin:0;">Lead Source: Website Contact Form</p>
        </div>
      </div>`,
    };

    await transporter.sendMail(buyerMail);
    await transporter.sendMail(adminMail);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Form submitted successfully",
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to submit form",
        details: error.message,
      }),
    };
  }
};
