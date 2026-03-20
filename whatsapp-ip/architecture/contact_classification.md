# SOP: Contact Classification

## Goal
Determine whether an incoming WhatsApp contact should be classified as "client" or "personal" to ensure proper message handling and privacy compliance.

---

## Inputs
- **Phone Number**: The sender's WhatsApp phone number
- **Contact Name**: Name from WhatsApp profile (if available)
- **Message Content**: The text of the message (for context)
- **Historical Data**: Previous interactions with this contact (if any)

---

## Outputs
- **Classification**: One of:
  - `client` - Business contact requiring AI assistance
  - `personal` - Personal contact, no AI processing
  - `unknown` - Needs user input for classification
- **Confidence Score**: 0.0 to 1.0 (how certain the system is)
- **Database Record**: Updated contact entry

---

## Process

### Step 1: Check Database
**Action**: Query the `contacts` table for this phone number

**Decision Tree**:
```
IF contact exists in database:
    └─> Use stored classification
    └─> Update last_interaction timestamp
    └─> Increment conversation_count
    └─> PROCEED to message processing
ELSE:
    └─> PROCEED to Step 2
```

---

### Step 2: Analyze Context (for Unknown Contacts)
**Action**: Gather available information

**Information to Collect**:
1. Phone number country code (US or Mexico in this case)
2. Contact name from WhatsApp
3. Message content and tone
4. Time of message (business hours vs. personal time)
5. Message type (text, media, etc.)

**Pattern Recognition** (Optional AI assistance):
- Business-like language → Likely client
- Casual/personal language → Likely personal
- First message is a question about services → Likely client
- First message is casual greeting → Likely personal

**Confidence Score Assignment**:
- High confidence (0.8-1.0): Clear business or personal indicators
- Medium confidence (0.5-0.79): Some indicators present
- Low confidence (0.0-0.49): Ambiguous, requires user input

---

### Step 3: User Classification (if confidence < 0.8)
**Action**: Prompt user to classify the contact

**User Prompt Format**:
```
New contact: [Contact Name or Phone Number]
Message: "[First 100 characters of message]"

Is this a CLIENT or PERSONAL contact?

[Client] [Personal] [Skip for now]
```

**User Response Handling**:
- **Client**: Set classification = 'client', confidence = 1.0
- **Personal**: Set classification = 'personal', confidence = 1.0
- **Skip**: Set classification = 'unknown', confidence = 0.0, ask again next time

---

### Step 4: Store Classification
**Action**: Save to database

**Database Operations**:
```sql
INSERT INTO contacts (
    phone_number,
    name,
    classification,
    confidence_score,
    created_at,
    last_interaction,
    conversation_count
) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
ON CONFLICT(phone_number) DO UPDATE SET
    classification = excluded.classification,
    confidence_score = excluded.confidence_score,
    updated_at = CURRENT_TIMESTAMP,
    last_interaction = CURRENT_TIMESTAMP,
    conversation_count = conversation_count + 1;
```

---

### Step 5: Route to Appropriate Handler
**Action**: Direct message to correct processing pipeline

**Routing Logic**:
```
IF classification == 'client':
    └─> Route to CLIENT_MESSAGE_PROCESSING.md
ELSE IF classification == 'personal':
    └─> Route to PERSONAL_MESSAGE_HANDLING.md
ELSE IF classification == 'unknown':
    └─> Hold in queue until user classifies
    └─> Send notification to user
```

---

## Edge Cases

### Edge Case 1: Contact Changes Classification
**Scenario**: A personal contact becomes a client (or vice versa)

**Handling**:
- Allow user to manually reclassify contacts in dashboard
- Update database record
- Apply new classification to future messages
- Do NOT retroactively process old messages

### Edge Case 2: Multiple Numbers for Same Person
**Scenario**: Client has both US and Mexican numbers

**Handling**:
- Treat as separate contacts initially
- Allow user to merge contacts in dashboard
- Link records in database with a `linked_contact_id` field

### Edge Case 3: Group Messages
**Scenario**: Message comes from a WhatsApp group

**Handling**:
- WhatsApp Business API doesn't support groups by default
- If encountered, log as error
- Notify user of limitation

### Edge Case 4: Spam/Unknown Numbers
**Scenario**: Unsolicited message from unknown number

**Handling**:
- Default to 'unknown' classification
- Prompt user for classification
- Allow user to block/ignore
- Do NOT auto-classify as client

---

## Business Rules

### Rule 1: Privacy First
**Never** process personal messages with AI, regardless of confidence score.

### Rule 2: User Override
User classification **always** overrides AI suggestions.

### Rule 3: Explicit Consent
Only classify as 'client' if:
- User manually confirms, OR
- Contact has previously been classified as client

### Rule 4: Re-classification
Allow contacts to be reclassified at any time through dashboard.

### Rule 5: Audit Trail
Log all classification changes with timestamp and reason.

---

## Success Criteria
- ✅ Contact is classified within 30 seconds of first message
- ✅ User is prompted for unknown contacts
- ✅ Classification is stored persistently
- ✅ No personal messages are sent to AI processing
- ✅ Audit trail exists for all classifications

---

## Failure Scenarios

### Failure 1: Database Unavailable
**Symptom**: Cannot query or store contact data

**Action**:
1. Log error with full context
2. Default to 'unknown' classification
3. Queue message for processing when DB recovers
4. Alert user to system issue

### Failure 2: User Doesn't Respond to Prompt
**Symptom**: Contact remains 'unknown' for extended period

**Action**:
1. Hold messages in queue for 24 hours
2. Send reminder notification to user
3. After 24 hours, default to 'personal' (safer for privacy)
4. Allow user to reclassify later

### Failure 3: Conflicting Classifications
**Symptom**: AI suggests 'client' but user selects 'personal'

**Action**:
1. Always use user's classification
2. Log the discrepancy for AI model improvement
3. Update confidence scoring algorithm

---

## Related SOPs
- `client_message_processing.md` - What happens after 'client' classification
- `personal_message_handling.md` - What happens after 'personal' classification
- `user_interaction.md` - How to prompt user for input

---

*Last Updated: 2026-03-18*
