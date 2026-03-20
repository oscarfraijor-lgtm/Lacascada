# WhatsApp IP - Setup Guide

## Quick Start (5 Steps)

### Step 1: Install Dependencies
```bash
cd /Users/apkuzz/CascadeProjects/whatsapp-ip
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2: Set Up WhatsApp Business API

1. **Create Meta Business Manager Account**
   - Go to https://business.facebook.com
   - Create account and verify your business (takes 1-2 weeks)

2. **Create Developer App**
   - Go to https://developers.facebook.com
   - Create new app → Choose "Business" type
   - Add WhatsApp product

3. **Get Your Credentials**
   - Access Token (temporary for testing, permanent for production)
   - Phone Number IDs (US and Mexican numbers)
   - Business Account ID
   - App ID and App Secret

4. **Verify Phone Numbers**
   - Add your US number
   - Add your Mexican number
   - Verify via SMS/voice call
   - **Important**: Remove numbers from regular WhatsApp first!

### Step 3: Set Up Google Workspace APIs

1. **Create Google Cloud Project**
   - Go to https://console.cloud.google.com
   - Create new project

2. **Enable APIs**
   - Google Sheets API
   - Google Docs API
   - Google Calendar API

3. **Create OAuth Credentials**
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: Desktop app
   - Download credentials JSON
   - Save as `credentials.json` in project root

4. **Create Google Sheet for Clients**
   - Create new Google Sheet
   - Name it "WhatsApp Clients"
   - Copy the Sheet ID from URL (between /d/ and /edit)

### Step 4: Configure Environment Variables

```bash
cp .env.example .env
nano .env  # or use your preferred editor
```

Fill in all the values:
```env
# WhatsApp (from Step 2)
WHATSAPP_ACCESS_TOKEN=your_token_here
WHATSAPP_PHONE_NUMBER_ID_US=your_us_number_id
WHATSAPP_PHONE_NUMBER_ID_MX=your_mx_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_account_id
WHATSAPP_APP_ID=your_app_id
WHATSAPP_APP_SECRET=your_app_secret

# Webhook
WEBHOOK_VERIFY_TOKEN=choose_any_random_string_here

# Google (from Step 3)
GOOGLE_SHEET_ID=your_sheet_id_here

# AI (choose one)
OPENAI_API_KEY=your_openai_key  # OR
GOOGLE_AI_API_KEY=your_gemini_key
```

### Step 5: Run the Application

```bash
# Start the Flask server
python run.py

# In a new terminal, start ngrok
ngrok http 8000 --domain your-domain.ngrok-free.app
```

Then configure webhook in Meta Developer Console:
- Callback URL: `https://your-domain.ngrok-free.app/webhook`
- Verify Token: (same as WEBHOOK_VERIFY_TOKEN in .env)
- Subscribe to: messages

---

## Testing

1. **Send a test message** to your WhatsApp Business number
2. **Check logs** - you should see the message received
3. **Classify the contact** (system will prompt you)
4. **View AI suggestion** in the dashboard
5. **Approve and send** the response

---

## Next Steps

### Phase 2: Link (Connectivity)
- ✅ WhatsApp API connected
- ✅ Google Workspace connected
- ✅ Database initialized
- ✅ Webhook configured

### Phase 3: Architect (Build)
- ✅ SOPs written
- ✅ Python tools created
- ⏳ Dashboard UI (optional enhancement)
- ⏳ Advanced features (media handling, etc.)

### Phase 4: Stylize (Refinement)
- Test with real client conversations
- Refine AI prompts based on results
- Improve response quality
- Add custom business rules

### Phase 5: Trigger (Deployment)
- Move to production hosting (Heroku, AWS, etc.)
- Set up PostgreSQL database
- Configure production webhooks
- Enable monitoring and alerts

---

## Troubleshooting

### Webhook not receiving messages
- Check ngrok is running
- Verify webhook URL in Meta console
- Check WEBHOOK_VERIFY_TOKEN matches

### AI not working
- Verify API key is correct
- Check AI_MODEL is set correctly
- Review logs for specific errors

### Google Workspace sync failing
- Run first-time OAuth flow
- Check credentials.json exists
- Verify APIs are enabled in Google Cloud

### Database errors
- Check whatsapp_ip.db file exists
- Verify write permissions
- Review database.py logs

---

## Architecture Overview

```
WhatsApp → Webhook → Flask → Classify Contact →
  ├─ Client: AI Analysis → Google Sync → User Approval → Send
  └─ Personal: Log metadata only (privacy-first)
```

---

## Important Notes

⚠️ **Privacy**: Personal messages are NEVER stored or processed by AI

⚠️ **Approval Required**: System NEVER auto-sends messages without your approval

⚠️ **24-Hour Window**: Respond to client messages within 24 hours for free messaging

⚠️ **Quality Rating**: Monitor your WhatsApp quality score to avoid restrictions

---

## Support

- Review SOPs in `architecture/` folder for detailed workflows
- Check `findings.md` for technical documentation
- See `progress.md` for development log

---

*Last Updated: 2026-03-18*
