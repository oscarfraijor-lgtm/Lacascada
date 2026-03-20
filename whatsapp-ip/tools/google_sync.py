import logging
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class GoogleWorkspaceSync:
    def __init__(self):
        self.sheets_enabled = False
        self.docs_enabled = False
        self.calendar_enabled = False
        
        try:
            from tools.google_sheets import GoogleSheetsManager
            self.sheets = GoogleSheetsManager()
            self.sheets_enabled = True
        except Exception as e:
            logger.warning(f"Google Sheets not configured: {e}")
        
        try:
            from tools.google_docs import GoogleDocsManager
            self.docs = GoogleDocsManager()
            self.docs_enabled = True
        except Exception as e:
            logger.warning(f"Google Docs not configured: {e}")
        
        try:
            from tools.google_calendar import GoogleCalendarManager
            self.calendar = GoogleCalendarManager()
            self.calendar_enabled = True
        except Exception as e:
            logger.warning(f"Google Calendar not configured: {e}")
    
    def sync_client_message(self, contact: Dict[str, Any], message: str, 
                           analysis: Dict[str, Any]):
        if self.sheets_enabled:
            try:
                self.sheets.update_client_row(contact, analysis)
                logger.info(f"Synced to Google Sheets for {contact['phone_number']}")
            except Exception as e:
                logger.error(f"Google Sheets sync failed: {e}")
        
        if self.docs_enabled:
            try:
                self.docs.append_conversation(contact, message, analysis)
                logger.info(f"Appended to Google Docs for {contact['phone_number']}")
            except Exception as e:
                logger.error(f"Google Docs sync failed: {e}")
        
        if self.calendar_enabled and 'schedule' in message.lower():
            try:
                self.calendar.create_follow_up(contact, analysis.get('action_items', []))
                logger.info(f"Created calendar event for {contact['phone_number']}")
            except Exception as e:
                logger.error(f"Google Calendar sync failed: {e}")
