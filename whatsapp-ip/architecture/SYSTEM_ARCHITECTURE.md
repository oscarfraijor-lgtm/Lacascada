# WhatsApp IP - System Architecture

## 3-Layer Architecture Overview

This system follows the B.L.A.S.T. protocol's 3-layer architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 1: ARCHITECTURE                     │
│                  (SOPs - Standard Operating Procedures)      │
│  - Define WHAT to do, WHEN to do it, and WHY               │
│  - Business logic and decision rules                        │
│  - No code, only process documentation                      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 2: NAVIGATION                       │
│                  (AI Decision Making & Routing)              │
│  - Read SOPs and route data to appropriate tools            │
│  - Make intelligent decisions based on context              │
│  - Handle edge cases and exceptions                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      LAYER 3: TOOLS                          │
│              (Deterministic Python Scripts)                  │
│  - Execute specific tasks atomically                        │
│  - No business logic, only technical execution              │
│  - Testable, reusable functions                             │
└─────────────────────────────────────────────────────────────┘
```

---

## System Components

### 1. Message Ingestion (Webhook)
**Purpose**: Receive incoming WhatsApp messages in real-time

**Flow**:
```
WhatsApp Cloud API → Webhook Endpoint → Validate Signature → 
Parse Message → Route to Message Processor
```

**Tools Used**:
- `tools/webhook_handler.py` - Flask webhook server
- `tools/whatsapp_validator.py` - Signature validation

---

### 2. Contact Classification
**Purpose**: Determine if contact is client or personal

**Flow**:
```
New Message → Check Database for Contact → 
  ├─ If Known: Use stored classification
  └─ If Unknown: Prompt user for classification → Store in DB
```

**SOPs**:
- `architecture/contact_classification.md`

**Tools Used**:
- `tools/contact_manager.py` - Database operations
- `tools/user_prompt.py` - User interaction for classification

---

### 3. Message Processing Pipeline

#### For CLIENT Messages:
```
Message → AI Analysis → Generate Response Suggestion → 
Store in DB → Sync to Google Workspace → Notify User → 
Wait for Approval → Send Response
```

**SOPs**:
- `architecture/client_message_processing.md`
- `architecture/ai_response_generation.md`

**Tools Used**:
- `tools/ai_analyzer.py` - AI conversation analysis
- `tools/response_generator.py` - Generate suggested responses
- `tools/google_sync.py` - Sync to Google Workspace
- `tools/whatsapp_sender.py` - Send WhatsApp messages

#### For PERSONAL Messages:
```
Message → Mark as Personal → Store Metadata Only → 
No AI Processing → User Handles Directly
```

**SOPs**:
- `architecture/personal_message_handling.md`

**Tools Used**:
- `tools/contact_manager.py` - Mark as personal

---

### 4. Google Workspace Integration
**Purpose**: Centralize client data in Google Workspace

**Components**:

#### Google Sheets - Client Database
- Contact name
- Phone number
- Classification (client/personal)
- Last interaction date
- Conversation count
- Notes

#### Google Docs - Conversation Logs
- One document per client
- Timestamped conversation history
- AI analysis summaries
- Action items

#### Google Calendar - Follow-ups
- Scheduled meetings
- Reminder events
- Action item deadlines

**SOPs**:
- `architecture/google_workspace_sync.md`

**Tools Used**:
- `tools/google_sheets.py` - Sheets operations
- `tools/google_docs.py` - Docs operations
- `tools/google_calendar.py` - Calendar operations

---

### 5. AI Analysis & Response Generation
**Purpose**: Provide intelligent conversation assistance

**Analysis Components**:
1. **Sentiment Analysis** - Positive/Neutral/Negative
2. **Urgency Detection** - High/Medium/Low
3. **Intent Recognition** - Question, Request, Complaint, etc.
4. **Action Items Extraction** - Tasks mentioned in conversation
5. **Response Suggestion** - Context-aware reply

**SOPs**:
- `architecture/ai_response_generation.md`

**Tools Used**:
- `tools/ai_analyzer.py` - Main AI processing
- `tools/prompt_templates.py` - AI prompt management

---

### 6. User Interface / Dashboard
**Purpose**: Allow user to review and approve AI suggestions

**Features**:
- View pending client messages
- See AI-generated response suggestions
- Edit and approve responses
- Classify new contacts
- View conversation history
- Monitor system health

**Implementation Options**:
1. **Web Dashboard** (Flask + HTML/CSS/JS)
2. **CLI Interface** (Python terminal app)
3. **Slack/Teams Integration** (future)

**SOPs**:
- `architecture/user_interaction.md`

**Tools Used**:
- `tools/dashboard.py` - Web interface
- `tools/notification_manager.py` - User notifications

---

## Data Flow Diagram

```
┌──────────────────┐
│  WhatsApp User   │
│  Sends Message   │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│     WhatsApp Cloud API (Meta)            │
└────────┬─────────────────────────────────┘
         │ (Webhook POST)
         ▼
┌──────────────────────────────────────────┐
│   Flask Webhook Handler                  │
│   - Validate signature                   │
│   - Parse message payload                │
└────────┬─────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│   Contact Classification Check           │
│   - Query database for contact           │
└────┬─────────────────────────────┬───────┘
     │                             │
     │ Known Client                │ Unknown/Personal
     ▼                             ▼
┌─────────────────┐      ┌──────────────────────┐
│ AI Analysis     │      │ Mark as Personal     │
│ - Sentiment     │      │ - No processing      │
│ - Urgency       │      │ - User handles       │
│ - Intent        │      └──────────────────────┘
│ - Action items  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   Generate Response Suggestion          │
│   - Context-aware AI response           │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   Store in Database                     │
│   - Message history                     │
│   - AI analysis                         │
│   - Suggested response                  │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   Sync to Google Workspace              │
│   - Update Sheets (contact DB)          │
│   - Append to Docs (conversation log)   │
│   - Create Calendar event (if needed)   │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   Notify User                           │
│   - Show in dashboard                   │
│   - Display AI suggestion               │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   User Reviews & Approves               │
│   - Edit response if needed             │
│   - Click "Send"                        │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│   Send WhatsApp Message                 │
│   - Via Cloud API                       │
│   - Log sent message                    │
└─────────────────────────────────────────┘
```

---

## Database Schema

### Tables

#### contacts
```sql
CREATE TABLE contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT UNIQUE NOT NULL,
    name TEXT,
    classification TEXT CHECK(classification IN ('client', 'personal', 'unknown')),
    confidence_score REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_interaction TIMESTAMP,
    conversation_count INTEGER DEFAULT 0,
    notes TEXT,
    google_sheet_row INTEGER
);
```

#### messages
```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id TEXT UNIQUE NOT NULL,
    contact_id INTEGER NOT NULL,
    direction TEXT CHECK(direction IN ('inbound', 'outbound')),
    message_type TEXT,
    content TEXT,
    media_url TEXT,
    timestamp TIMESTAMP NOT NULL,
    phone_number_id TEXT,
    is_processed BOOLEAN DEFAULT 0,
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);
```

#### ai_analysis
```sql
CREATE TABLE ai_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER NOT NULL,
    sentiment TEXT,
    urgency TEXT,
    intent TEXT,
    action_items TEXT,
    suggested_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id)
);
```

#### pending_responses
```sql
CREATE TABLE pending_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER NOT NULL,
    suggested_response TEXT NOT NULL,
    edited_response TEXT,
    status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'sent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    approved_at TIMESTAMP,
    sent_at TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id)
);
```

#### google_sync_log
```sql
CREATE TABLE google_sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    sync_type TEXT CHECK(sync_type IN ('sheets', 'docs', 'calendar')),
    resource_id TEXT,
    resource_url TEXT,
    status TEXT,
    error_message TEXT,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);
```

---

## File Structure

```
whatsapp-ip/
├── gemini.md                  # Project Constitution
├── task_plan.md               # Phase tracking
├── findings.md                # Research log
├── progress.md                # Execution log
├── README.md                  # Project overview
├── .env.example               # Environment template
├── .env                       # Actual credentials (gitignored)
├── .gitignore                 # Git ignore rules
├── requirements.txt           # Python dependencies
│
├── architecture/              # LAYER 1: SOPs
│   ├── SYSTEM_ARCHITECTURE.md (this file)
│   ├── contact_classification.md
│   ├── client_message_processing.md
│   ├── personal_message_handling.md
│   ├── ai_response_generation.md
│   ├── google_workspace_sync.md
│   └── user_interaction.md
│
├── tools/                     # LAYER 3: Python Scripts
│   ├── __init__.py
│   ├── webhook_handler.py     # Flask webhook server
│   ├── whatsapp_validator.py  # Signature validation
│   ├── whatsapp_sender.py     # Send messages
│   ├── contact_manager.py     # Contact CRUD operations
│   ├── message_processor.py   # Message processing logic
│   ├── ai_analyzer.py         # AI analysis
│   ├── response_generator.py  # Response generation
│   ├── google_sheets.py       # Google Sheets integration
│   ├── google_docs.py         # Google Docs integration
│   ├── google_calendar.py     # Google Calendar integration
│   ├── google_sync.py         # Orchestrate Google syncs
│   ├── database.py            # Database operations
│   ├── notification_manager.py # User notifications
│   ├── dashboard.py           # Web dashboard
│   └── prompt_templates.py    # AI prompt templates
│
├── .tmp/                      # Temporary files
│   └── .gitkeep
│
├── run.py                     # Main application entry point
├── config.py                  # Configuration management
└── whatsapp_ip.db            # SQLite database (gitignored)
```

---

## Security Considerations

### 1. Webhook Security
- Validate Meta's signature on all webhook requests
- Use HTTPS only (ngrok provides this)
- Verify webhook token matches environment variable

### 2. Data Encryption
- Encrypt sensitive client data at rest
- Use environment variables for all API keys
- Never commit credentials to git

### 3. Privacy Compliance
- Personal messages: metadata only, no content storage
- Client messages: encrypted storage
- GDPR compliance: data deletion on request
- Clear opt-in/opt-out mechanisms

### 4. Access Control
- Dashboard requires authentication
- Rate limiting on API endpoints
- Audit log for all user actions

---

## Error Handling & Resilience

### 1. API Failures
- Retry logic with exponential backoff
- Queue failed requests for later processing
- Log all errors with context

### 2. Database Failures
- Transaction rollback on errors
- Regular backups
- Connection pooling

### 3. Webhook Downtime
- WhatsApp will retry failed webhooks
- Log all webhook attempts
- Alert on repeated failures

---

## Monitoring & Logging

### Metrics to Track
- Messages received per day
- Messages sent per day
- AI response acceptance rate
- Average response time
- Quality rating (from WhatsApp)
- API error rates
- Database query performance

### Logging Strategy
- INFO: Normal operations
- WARNING: Recoverable errors
- ERROR: Failures requiring attention
- DEBUG: Detailed troubleshooting info

---

## Deployment Strategy

### Development
- Local Flask server
- ngrok for webhook tunnel
- SQLite database
- Test WhatsApp number

### Production
- Cloud hosting (Heroku, AWS, Google Cloud)
- PostgreSQL database
- Production WhatsApp numbers
- SSL certificate
- Monitoring and alerting

---

*Last Updated: 2026-03-18 - Phase 1 Blueprint*
