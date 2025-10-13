# Email Templates - Usage Guide

This folder contains email templates for Snowdon23 AgroTrade.

## 📁 Templates Available

1. **quote-template.html** - For sending price quotes to potential customers
2. **confirmation-template.html** - For confirming orders after payment

---

## 🚀 How to Use (Simple Method)

### For Quote Emails

1. Open `quote-template.html` in a text editor (Notepad, VS Code, etc.)
2. Use Find & Replace (Ctrl+H) to replace these placeholders:

| Placeholder | Replace With | Example |
|------------|--------------|---------|
| `[CUSTOMER_NAME]` | Customer's name | John Smith |
| `[PRODUCT_NAME]` | Product and grade | Cashew Kernels W320 |
| `[QUANTITY]` | Number of metric tons | 5 |
| `[UNIT_PRICE]` | Price per MT | 4,500 |
| `[TOTAL_PRICE]` | Total order value | 22,500 |
| `[SHIPPING_TERMS]` | FOB/CIF/CFR + Port | FOB Lagos Port |
| `[PAYMENT_TERMS]` | Payment structure | 30% advance, 70% before shipping |
| `[DELIVERY_TIME]` | Estimated delivery | 2-3 weeks after confirmation |
| `[VALID_DATE]` | Quote expiry date | March 15, 2025 |

3. Save the modified file
4. Open in your web browser
5. Press `Ctrl+A` (Select All), then `Ctrl+C` (Copy)
6. Open Gmail, compose new email
7. Paste into email body (`Ctrl+V`)
8. Add recipient, subject line, and send!

**Subject Line Example:**
```
Quote #2025-001 - Premium Cashew Kernels from Snowdon23 AgroTrade
```

---

### For Confirmation Emails

1. Open `confirmation-template.html` in a text editor
2. Use Find & Replace (Ctrl+H) to replace these placeholders:

| Placeholder | Replace With | Example |
|------------|--------------|---------|
| `[CUSTOMER_NAME]` | Customer's name | John Smith |
| `[ORDER_NUMBER]` | Your order tracking # | #SNW2025-001 |
| `[ORDER_DATE]` | Date order was placed | January 15, 2025 |
| `[PRODUCT_NAME]` | Product and grade | Cashew Kernels W320 |
| `[QUANTITY]` | Number of metric tons | 5 |
| `[TOTAL_AMOUNT]` | Total order value | 22,500 |
| `[SHIPPING_TERMS]` | FOB/CIF/CFR + Port | FOB Lagos Port |
| `[DELIVERY_DATE]` | Expected delivery range | March 1-15, 2025 |

3. Follow steps 3-8 from above

**Subject Line Example:**
```
Order Confirmed #SNW2025-001 - Snowdon23 AgroTrade
```

---

## 💡 Pro Tips

### 1. Create Master Template Copies
- Keep the original templates untouched
- Save copies like: `quote-template-COPY.html`
- Work on copies and delete after sending

### 2. Use a Text Editor with Find & Replace
Good options:
- **VS Code** (free, powerful)
- **Notepad++** (Windows)
- **Sublime Text**
- Even MS Word works!

### 3. Quick Replace Shortcut
In most editors:
- Press `Ctrl+H` (Windows) or `Cmd+H` (Mac)
- Type placeholder in "Find"
- Type real value in "Replace"
- Click "Replace All"

### 4. Gmail Tips
If styling looks wrong in Gmail:
- Make sure you paste in the main compose area (not subject line)
- If buttons don't work, the links will still be there
- Test by sending to yourself first

### 5. Keep a Quote Log
Create a simple spreadsheet:
| Date | Customer | Product | Quote # | Amount | Status |
|------|----------|---------|---------|---------|--------|
| 1/15/25 | John Smith | Cashew W320 | Q001 | $22,500 | Sent |

---

## 📧 Email Best Practices

1. **Response Time:** Aim to send quotes within 24 hours
2. **Follow Up:** If no response in 3-5 days, send a friendly follow-up
3. **File Naming:** When saving filled templates, use descriptive names:
   - `quote-2025-001-john-smith-cashew.html`
4. **Archive:** Keep copies of sent quotes for reference

---

## 🔧 Troubleshooting

### Problem: Styling looks broken in Gmail
**Solution:** Some email clients strip styles. The templates are designed to work, but if you see issues:
- Try copying from Chrome browser instead of Firefox
- Make sure you're pasting in the email body, not as plain text

### Problem: Buttons not clickable
**Solution:** The links are there, they just might not look like buttons. Recipients can still click them.

### Problem: Need to add more details
**Solution:** Edit the HTML directly:
- Find the section you want to modify
- Add your content following the same style pattern

---

## 📱 Alternative: Use Email Marketing Service

For more professional and automated emails, consider:

### Brevo (formerly Sendinblue) - **Recommended**
- Free plan: 300 emails/day
- Professional templates
- Easy to use

**Setup:**
1. Sign up at https://www.brevo.com
2. Import these templates
3. Send emails through their dashboard

### Other Options:
- **Mailchimp** (Free for 500 contacts)
- **SendGrid** (Free for 100 emails/day)

---

## 🎯 Quick Start Checklist

- [ ] Save both template files in `email-templates/` folder
- [ ] Test by sending yourself a quote email
- [ ] Verify it looks good in Gmail
- [ ] Create a quote numbering system (e.g., Q2025-001, Q2025-002)
- [ ] Set up a simple tracking spreadsheet
- [ ] Bookmark this README for quick reference

---

## 📞 Need Help?

If you need to customize these templates or have questions:
- Check the HTML comments in the template files
- The structure is standard HTML tables (safe for all email clients)
- Modify colors by changing hex codes (e.g., `#5B2C91` for purple)

---

## 📝 Template Update Log

- **Version 1.0** (January 2025): Initial templates created
- Templates use inline styles for maximum email client compatibility
- Tested in Gmail, Outlook, Apple Mail

---

**Remember:** Keep the original template files safe. Always work on copies!