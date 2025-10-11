# Snowdon23 AgroTrade Website

Official website for Snowdon23 AgroTrade - Connecting African agro products to global markets.

## 🌾 About

Snowdon23 AgroTrade specializes in exporting premium Nigerian cash crops including:
- Cashew Nuts
- Groundnuts
- Sesame Seeds
- Ginger
- Cocoa Beans
- Coffee Beans

## 🚀 Deployment

This site is deployed on Netlify and automatically updates when you push to the main branch.

### Live Site
- Production: [https://snowdon23resource.com](https://snowdon23resource.com)

## 📋 Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/snowdon23-agrotrade.git
cd snowdon23-agrotrade
```

### 2. Configure Airtable Integration (Secure Method)

This project uses **Netlify Functions** to keep your API key secure on the server.

#### Create Netlify Function:
1. In your project root, create folder structure: `netlify/functions/`
2. Create file: `netlify/functions/submit-form.js` (download from artifacts)
3. Your API key will be stored securely in Netlify environment variables

#### Add Environment Variable in Netlify:
1. Go to your Netlify dashboard
2. Select your site: **snowdon23-agrotrade**
3. Go to: **Site configuration** → **Environment variables**
4. Click **"Add a variable"** → **"Add a single variable"**
5. Add:
   - **Key**: `AIRTABLE_API_KEY`
   - **Value**: Your personal access token (starts with `pat...`)
   - **Scopes**: Select "All" or check all deploy contexts
6. Click **"Save"**

#### Get Your Airtable API Token:
1. Go to [https://airtable.com/create/tokens](https://airtable.com/create/tokens)
2. Click "Create new token"
3. Name: "Snowdon23 Website"
4. Add scopes:
   - ✅ `data.records:read`
   - ✅ `data.records:write`
5. Add access to base: Select **"Snowdon23 AgroTrade"**
6. Click "Create token"
7. Copy the token and add it to Netlify (step above)

### 3. Deploy to Netlify

#### Option A: Continuous Deployment (Recommended)
1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub repository
5. Netlify will auto-detect settings from `netlify.toml`
6. Click "Deploy site"

#### Option B: Manual Deployment
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### 4. Custom Domain Setup
1. In Netlify: Site settings → Domain management
2. Add custom domain: `snowdon23resource.com`
3. Update DNS records at your domain registrar
4. Enable HTTPS (automatic with Netlify)

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript
- **Hosting**: Netlify
- **Form Backend**: Airtable API
- **Version Control**: Git/GitHub

## 📁 Project Structure

```
snowdon23-agrotrade/
├── index.html          # Main website file
├── netlify.toml        # Netlify configuration
├── README.md           # This file
└── .gitignore         # Git ignore file
```

## 🔒 Security Notes

- Never commit API keys to the repository
- Use Netlify environment variables for sensitive data
- Keep your Airtable API key private

## 📞 Contact

For website issues or updates, contact the development team.

For business inquiries:
- Email: info@snowdon23resource.com
- Website: [https://snowdon23resource.com](https://snowdon23resource.com)

## 📝 License

© 2025 Snowdon23 AgroTrade. All rights reserved.