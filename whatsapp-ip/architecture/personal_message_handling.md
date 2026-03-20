# SOP: Personal Message Handling

## Goal
Handle personal WhatsApp messages with strict privacy compliance - no AI processing, minimal data storage, user handles directly.

---

## Inputs
- **Message Object**: WhatsApp message payload
- **Contact Record**: Database entry marked as 'personal'

---

## Outputs
- **Metadata Only**: Timestamp, phone number, message type (NO content)
- **User Notification**: Simple alert that personal message received
- **No AI Processing**: Explicitly skip all AI analysis

---

## Process

### Step 1: Validate Personal Classification
**Action**: Confirm contact is marked as 'personal'

**Query**:
```sql
SELECT classification FROM contacts WHERE phone_number = ?;
```

**Validation**:
```
IF classification != 'personal':
    └─> ERROR: Wrong handler, route to correct SOP
    └─> Log error
    └─> STOP
ELSE:
    └─> PROCEED
```

---

### Step 2: Store Metadata Only (NO Content)
**Action**: Log minimal information for audit purposes

**Database Operation**:
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
) VALUES (
    ?,
    ?,
    'inbound',
    ?,
    '[PERSONAL - NOT STORED]',  -- DO NOT store actual content
    ?,
    ?,
    1  -- Mark as processed immediately
);
```

**What We Store**:
- ✅ Message ID (for deduplication)
- ✅ Contact ID (who sent it)
- ✅ Message type (text/image/video/audio)
- ✅ Timestamp (when received)
- ✅ Phone number ID (which of user's numbers received it)

**What We DO NOT Store**:
- ❌ Message content (text)
- ❌ Media URLs
- ❌ Captions
- ❌ Any personally identifiable information

---

### Step 3: Update Contact Metadata
**Action**: Track interaction without storing content

**Database Operation**:
```sql
UPDATE contacts 
SET last_interaction = CURRENT_TIMESTAMP,
    conversation_count = conversation_count + 1
WHERE id = ?;
```

**Why**: Helps user see which personal contacts are active, without compromising privacy

---

### Step 4: Skip All AI Processing
**Action**: Explicitly bypass AI analysis

**Implementation**:
```python
# In message_processor.py
if contact.classification == 'personal':
    # DO NOT call ai_analyzer.py
    # DO NOT call response_generator.py
    # DO NOT send to any AI service
    logger.info(f"Personal message from {contact.phone_number} - skipping AI")
    return  # Exit processing
```

**Why**: Privacy-first approach - personal conversations are private

---

### Step 5: Skip Google Workspace Sync
**Action**: Do not sync personal messages to Google

**Implementation**:
```python
# In google_sync.py
if contact.classification == 'personal':
    # DO NOT update Google Sheets
    # DO NOT create Google Docs
    # DO NOT create Calendar events
    logger.info(f"Personal contact - skipping Google sync")
    return
```

**Why**: Keep personal and business data completely separate

---

### Step 6: Notify User (Optional)
**Action**: Simple notification that personal message received

**Notification Payload**:
```json
{
  "type": "personal_message",
  "priority": "low",
  "contact": {
    "name": "[name]",
    "phone": "[phone]"
  },
  "message": "You have a new personal message",
  "action": "Open WhatsApp to view"
}
```

**Dashboard Display**:
- Show in "Personal Messages" section (separate from clients)
- Display: "[Name] sent you a message"
- NO preview of message content
- Link to open WhatsApp directly

**User Preference**:
Allow user to disable personal message notifications entirely in settings

---

### Step 7: User Handles Directly
**Action**: User responds via WhatsApp app

**System Behavior**:
- Do NOT provide response suggestions
- Do NOT track responses
- Do NOT log conversation content
- User uses regular WhatsApp app for personal chats

---

## Edge Cases

### Edge Case 1: Personal Contact Sends Business Inquiry
**Scenario**: Personal contact asks about user's business/services

**Handling**:
1. System processes as personal (no AI)
2. User sees notification
3. User can manually reclassify contact to 'client' in dashboard
4. Future messages will be processed as client messages
5. Past personal messages remain private (not retroactively processed)

### Edge Case 2: Accidental Personal Classification
**Scenario**: User accidentally marked a client as personal

**Handling**:
1. User reclassifies in dashboard
2. System updates contact record
3. Next message processes as client
4. Previous messages remain unprocessed (privacy preserved)
5. User can manually review history if needed

### Edge Case 3: Personal Message Contains Sensitive Info
**Scenario**: Personal message has private/sensitive content

**Handling**:
1. Content already not stored (by design)
2. No AI processing (by design)
3. No sync to Google (by design)
4. System is already compliant

### Edge Case 4: User Wants to Archive Personal Conversations
**Scenario**: User wants record of personal chats

**Handling**:
1. System does not provide this feature
2. User should use WhatsApp's built-in export feature
3. Recommend: WhatsApp > Chat > Export Chat
4. Keep business and personal data separate

---

## Business Rules

### Rule 1: Privacy Absolute
Personal message content is **NEVER** stored, processed, or analyzed under any circumstances.

### Rule 2: Metadata Minimal
Only store the absolute minimum needed for system operation (message ID, timestamp, type).

### Rule 3: No Retroactive Processing
If contact is reclassified from personal to client, do NOT process old messages.

### Rule 4: User Control
User can reclassify contacts at any time, but past privacy is preserved.

### Rule 5: Audit Compliance
Log that personal message was received, but not what it said.

---

## Privacy Compliance

### GDPR Compliance
- ✅ Minimal data collection
- ✅ No content storage
- ✅ User can delete contact record
- ✅ Clear separation of personal/business data
- ✅ No third-party processing (AI)

### Data Retention
- **Personal message metadata**: 30 days, then auto-delete
- **Contact record**: Kept until user deletes
- **No content**: Nothing to retain

### Right to Deletion
User can delete personal contact records:
```sql
DELETE FROM messages WHERE contact_id = ? AND direction = 'inbound';
DELETE FROM contacts WHERE id = ? AND classification = 'personal';
```

---

## Success Criteria
- ✅ No personal message content stored
- ✅ No AI processing of personal messages
- ✅ No Google Workspace sync for personal contacts
- ✅ User notified (if enabled)
- ✅ Contact metadata updated
- ✅ Processing completes in < 1 second

---

## Comparison: Personal vs. Client Processing

| Feature | Personal Messages | Client Messages |
|---------|------------------|-----------------|
| Store content | ❌ No | ✅ Yes |
| AI analysis | ❌ No | ✅ Yes |
| Response suggestions | ❌ No | ✅ Yes |
| Google Workspace sync | ❌ No | ✅ Yes |
| Conversation history | ❌ No | ✅ Yes |
| User notification | ⚠️ Optional | ✅ Yes |
| Dashboard display | Minimal | Full details |
| Data retention | 30 days metadata | Indefinite |

---

## Related SOPs
- `contact_classification.md` - How contacts are classified
- `client_message_processing.md` - Contrast with client handling
- `user_interaction.md` - Dashboard settings for personal messages

---

*Last Updated: 2026-03-18*
