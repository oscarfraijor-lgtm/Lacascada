import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class GoogleCalendarManager:
    def __init__(self):
        try:
            from google.oauth2.credentials import Credentials
            from google_auth_oauthlib.flow import InstalledAppFlow
            from google.auth.transport.requests import Request
            from googleapiclient.discovery import build
            import os.path
            import pickle
            from config import Config
            
            self.SCOPES = ['https://www.googleapis.com/auth/calendar']
            self.creds = None
            
            if os.path.exists(Config.GOOGLE_TOKEN_FILE):
                with open(Config.GOOGLE_TOKEN_FILE, 'rb') as token:
                    self.creds = pickle.load(token)
            
            if not self.creds or not self.creds.valid:
                if self.creds and self.creds.expired and self.creds.refresh_token:
                    self.creds.refresh(Request())
                else:
                    flow = InstalledAppFlow.from_client_secrets_file(
                        Config.GOOGLE_CREDENTIALS_FILE, self.SCOPES)
                    self.creds = flow.run_local_server(port=0)
                
                with open(Config.GOOGLE_TOKEN_FILE, 'wb') as token:
                    pickle.dump(self.creds, token)
            
            self.service = build('calendar', 'v3', credentials=self.creds)
            logger.info("Google Calendar initialized successfully")
        
        except Exception as e:
            logger.error(f"Failed to initialize Google Calendar: {e}")
            raise
    
    def create_follow_up(self, contact: Dict[str, Any], action_items: List[str]):
        try:
            tomorrow = datetime.now() + timedelta(days=1)
            start_date = tomorrow.strftime('%Y-%m-%d')
            
            description = "Action items from WhatsApp conversation:\n"
            for item in action_items:
                description += f"- {item}\n"
            
            event = {
                'summary': f"Follow-up: {contact.get('name', contact['phone_number'])}",
                'description': description,
                'start': {
                    'date': start_date,
                },
                'end': {
                    'date': start_date,
                },
                'reminders': {
                    'useDefault': False,
                    'overrides': [
                        {'method': 'popup', 'minutes': 24 * 60},
                    ],
                },
            }
            
            event = self.service.events().insert(calendarId='primary', body=event).execute()
            logger.info(f"Created calendar event: {event.get('htmlLink')}")
            return event.get('id')
        
        except Exception as e:
            logger.error(f"Failed to create calendar event: {e}")
            raise
