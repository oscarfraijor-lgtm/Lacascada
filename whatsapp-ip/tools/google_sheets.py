import logging
from typing import Dict, Any, List
from datetime import datetime

logger = logging.getLogger(__name__)

class GoogleSheetsManager:
    def __init__(self):
        try:
            from google.oauth2.credentials import Credentials
            from google_auth_oauthlib.flow import InstalledAppFlow
            from google.auth.transport.requests import Request
            from googleapiclient.discovery import build
            import os.path
            import pickle
            from config import Config
            
            self.SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
            self.SHEET_ID = Config.GOOGLE_SHEET_ID
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
            
            self.service = build('sheets', 'v4', credentials=self.creds)
            logger.info("Google Sheets initialized successfully")
        
        except Exception as e:
            logger.error(f"Failed to initialize Google Sheets: {e}")
            raise
    
    def update_client_row(self, contact: Dict[str, Any], analysis: Dict[str, Any]):
        try:
            sheet_range = 'Clients!A:H'
            result = self.service.spreadsheets().values().get(
                spreadsheetId=self.SHEET_ID,
                range=sheet_range
            ).execute()
            
            values = result.get('values', [])
            
            phone = contact['phone_number']
            row_index = None
            
            for i, row in enumerate(values):
                if len(row) > 0 and row[0] == phone:
                    row_index = i + 1
                    break
            
            row_data = [
                contact['phone_number'],
                contact.get('name', ''),
                datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                str(contact.get('conversation_count', 0)),
                analysis.get('sentiment', ''),
                analysis.get('urgency', ''),
                ', '.join(analysis.get('action_items', [])),
                contact.get('notes', '')
            ]
            
            if row_index:
                update_range = f'Clients!A{row_index}:H{row_index}'
                body = {'values': [row_data]}
                self.service.spreadsheets().values().update(
                    spreadsheetId=self.SHEET_ID,
                    range=update_range,
                    valueInputOption='RAW',
                    body=body
                ).execute()
                logger.info(f"Updated row {row_index} for {phone}")
            else:
                append_range = 'Clients!A:H'
                body = {'values': [row_data]}
                self.service.spreadsheets().values().append(
                    spreadsheetId=self.SHEET_ID,
                    range=append_range,
                    valueInputOption='RAW',
                    body=body
                ).execute()
                logger.info(f"Appended new row for {phone}")
        
        except Exception as e:
            logger.error(f"Failed to update Google Sheets: {e}")
            raise
    
    def initialize_sheet_headers(self):
        headers = [
            ['Phone', 'Name', 'Last Contact', 'Total Messages', 'Sentiment', 'Urgency', 'Action Items', 'Notes']
        ]
        
        body = {'values': headers}
        self.service.spreadsheets().values().update(
            spreadsheetId=self.SHEET_ID,
            range='Clients!A1:H1',
            valueInputOption='RAW',
            body=body
        ).execute()
        logger.info("Sheet headers initialized")
