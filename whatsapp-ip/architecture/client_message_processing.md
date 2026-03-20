# SOP: Client Message Processing

## Goal
Process incoming messages from classified clients with AI assistance, generate response suggestions, sync to Google Workspace, and present to user for approval.

---

## Inputs
- **Message Object**: Complete WhatsApp message payload
- **Contact Record**: Database entry for the client
- **Conversation History**: Previous messages with this client

---

## Outputs
- **AI Analysis**: Sentiment, urgency, intent, action items
- **Suggested Response**: AI-generated reply
- **Database Records**: Stored message and analysis
- **Google Workspace Updates**: Synced data
- **User Notification**: Dashboard alert with suggestion

---

## Process

### Step 1: Store Incoming Message
**Action**: Save message to database immediately

**Database Operation**:
```sql
INSERT INTO messages (
    message_id,
    contact_id,
    direction,
    message_type,
    content,
    media_url,
    timestamp,
    phone_number_id,
    is_processed
) VALUES (?, ?, 'inbound', ?, ?, ?, ?, ?, 0);
```

**Why**: Ensures no message is lost, even if processing fails

---

### Step 2: Retrieve Conversation Context
**Action**: Fetch recent conversation history

**Query**:
```sql
SELECT * FROM messages 
WHERE contact_id = ? 
ORDER BY timestamp DESC 
LIMIT 10;
```

**Context Building**:
- Last 10 messages (5 inbound, 5 outbound)
- Format as conversation thread
- Include timestamps
- Prepare for AI analysis

---

### Step 3: AI Analysis
**Action**: Send to AI for comprehensive analysis

**AI Prompt Structure**:
```
You are analyzing a WhatsApp conversation with a client.

Client Name: [name]
Conversation History:
[formatted conversation thread]

Latest Message: "[message content]"

Analyze this message and provide:
1. Sentiment: positive/neutral/negative
2. Urgency: high/medium/low
3. Intent: question/request/complaint/feedback/other
4. Action Items: List any tasks or follow-ups mentioned
5. Key Topics: Main subjects discussed

Format as JSON.
```

**Expected AI Response**:
```json
{
  "sentiment": "positive",
  "urgency": "medium",
  "intent": "question",
  "action_items": [
    "Provide pricing quote",
    "Schedule demo call"
  ],
  "key_topics": ["pricing", "product demo"]
}
```

**Store Analysis**:
```sql
INSERT INTO ai_analysis (
    message_id,
    sentiment,
    urgency,
    intent,
    action_items,
    created_at
) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP);
```

---

### Step 4: Generate Response Suggestion
**Action**: Use AI to create contextual response

**AI Prompt Structure**:
```
You are a professional assistant helping respond to a client message.

Client Name: [name]
Business Context: [user's business description]
Conversation History:
[formatted conversation thread]

Client's Latest Message: "[message content]"

Analysis:
- Sentiment: [sentiment]
- Urgency: [urgency]
- Intent: [intent]
- Action Items: [action items]

Generate a professional, helpful response that:
1. Addresses the client's question/request
2. Maintains a [tone: professional/friendly/formal] tone
3. Includes next steps if applicable
4. Is concise (2-3 sentences max)

Response:
```

**Store Suggested Response**:
```sql
INSERT INTO pending_responses (
    message_id,
    suggested_response,
    status,
    created_at
) VALUES (?, ?, 'pending', CURRENT_TIMESTAMP);
```

---

### Step 5: Sync to Google Workspace
**Action**: Update Google Sheets, Docs, and Calendar

#### 5a. Update Google Sheets (Client Database)
**Sheet Structure**:
| Phone | Name | Last Contact | Total Messages | Last Message | Sentiment | Urgency |
|-------|------|--------------|----------------|--------------|-----------|---------|

**Operation**: Update or append row for this client

#### 5b. Append to Google Docs (Conversation Log)
**Document Structure**:
```
# Conversation Log: [Client Name]

## [Date] - [Time]
**From Client**: [message content]
**Sentiment**: [sentiment] | **Urgency**: [urgency]
**Action Items**: 
- [action item 1]
- [action item 2]

**AI Suggested Response**: [suggested response]
**Actual Response**: [to be filled after user sends]

---
```

**Operation**: Append to existing doc or create new if first conversation

#### 5c. Create Calendar Event (if action items require scheduling)
**Condition**: If action items include "schedule", "meeting", "call", etc.

**Event Details**:
- Title: "Follow-up: [Client Name]"
- Description: Action items from conversation
- Date: User will set (create as all-day event for tomorrow)
- Reminder: 1 day before

**Log Sync**:
```sql
INSERT INTO google_sync_log (
    contact_id,
    sync_type,
    resource_id,
    resource_url,
    status,
    synced_at
) VALUES (?, ?, ?, ?, 'success', CURRENT_TIMESTAMP);
```

---

### Step 6: Notify User
**Action**: Display in dashboard with all context

**Notification Payload**:
```json
{
  "type": "new_client_message",
  "priority": "[based on urgency]",
  "contact": {
    "name": "[name]",
    "phone": "[phone]"
  },
  "message": "[content]",
  "analysis": {
    "sentiment": "[sentiment]",
    "urgency": "[urgency]",
    "intent": "[intent]",
    "action_items": []
  },
  "suggested_response": "[AI response]",
  "pending_response_id": "[id]"
}
```

**Dashboard Display**:
- Show in "Pending Responses" section
- Highlight high urgency messages
- Allow inline editing of suggested response
- Provide "Send", "Edit", "Dismiss" buttons

---

### Step 7: Wait for User Approval
**Action**: Hold until user takes action

**User Options**:
1. **Send as-is**: Use AI suggestion without changes
2. **Edit & Send**: Modify suggestion, then send
3. **Dismiss**: Don't respond (mark as handled manually)
4. **Snooze**: Remind me later

**Status Updates**:
```sql
UPDATE pending_responses 
SET status = 'approved', 
    edited_response = ?,
    approved_at = CURRENT_TIMESTAMP
WHERE id = ?;
```

---

### Step 8: Send Response (after approval)
**Action**: Send via WhatsApp Cloud API

**API Call**:
```
POST https://graph.facebook.com/v18.0/{phone_number_id}/messages
Headers:
  Authorization: Bearer {access_token}
  Content-Type: application/json

Body:
{
  "messaging_product": "whatsapp",
  "to": "{client_phone}",
  "type": "text",
  "text": {
    "body": "{approved_response}"
  }
}
```

**Store Sent Message**:
```sql
INSERT INTO messages (
    message_id,
    contact_id,
    direction,
    message_type,
    content,
    timestamp,
    phone_number_id,
    is_processed
) VALUES (?, ?, 'outbound', 'text', ?, CURRENT_TIMESTAMP, ?, 1);

UPDATE pending_responses 
SET status = 'sent', 
    sent_at = CURRENT_TIMESTAMP
WHERE id = ?;
```

**Update Google Docs**:
Append actual response to conversation log

---

## Edge Cases

### Edge Case 1: AI Service Unavailable
**Symptom**: AI API returns error or times out

**Handling**:
1. Log error with full context
2. Store message without AI analysis
3. Notify user: "AI unavailable - manual response needed"
4. Allow user to respond without AI suggestion
5. Retry AI analysis in background

### Edge Case 2: Google Workspace Sync Fails
**Symptom**: Google API returns error

**Handling**:
1. Log error in `google_sync_log` table
2. Continue with message processing (don't block)
3. Queue for retry (exponential backoff)
4. Notify user if sync fails 3+ times

### Edge Case 3: Media Messages (Images, Videos, Audio)
**Symptom**: Message contains media instead of/in addition to text

**Handling**:
1. Download media file (if needed for analysis)
2. Store media_url in database
3. AI analysis: Include "[Image]", "[Video]", or "[Audio]" in context
4. Suggested response: Acknowledge media ("Thanks for the image...")
5. Display media in dashboard for user context

### Edge Case 4: Very Long Messages
**Symptom**: Message exceeds AI token limits

**Handling**:
1. Truncate conversation history (keep most recent)
2. Summarize older messages
3. Process current message in full
4. Note truncation in analysis

### Edge Case 5: Rapid-Fire Messages
**Symptom**: Client sends multiple messages in quick succession

**Handling**:
1. Process each message individually
2. Wait 30 seconds before generating response
3. If more messages arrive, combine into single context
4. Generate one comprehensive response suggestion

---

## Business Rules

### Rule 1: 24-Hour Window
WhatsApp allows free responses within 24 hours of user message. Prioritize responses within this window.

### Rule 2: No Auto-Send
**Never** send messages without explicit user approval, regardless of confidence.

### Rule 3: Context Preservation
Always include conversation history in AI prompts for coherent responses.

### Rule 4: Privacy in Logs
When syncing to Google Workspace, redact sensitive information (credit cards, SSNs, etc.) if detected.

### Rule 5: Urgency Escalation
High urgency messages should trigger push notification to user, not just dashboard update.

---

## Success Criteria
- ✅ Message processed within 5 seconds
- ✅ AI analysis completed within 10 seconds
- ✅ Response suggestion generated within 15 seconds
- ✅ Google Workspace synced within 30 seconds
- ✅ User notified within 30 seconds
- ✅ No data loss even if processing fails

---

## Related SOPs
- `ai_response_generation.md` - Detailed AI prompt engineering
- `google_workspace_sync.md` - Google API integration details
- `user_interaction.md` - Dashboard and notification handling

---

*Last Updated: 2026-03-18*
