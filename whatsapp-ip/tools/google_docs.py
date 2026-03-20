import logging
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

class GoogleDocsManager:
    def __init__(self):
        try:
            from google.oauth2.credentials import Credentials
            from google_auth_oauthlib.flow import InstalledAppFlow
            from google.auth.transport.requests import Request
            from googleapiclient.discovery import build
            import os.path
            import pickle
            from config import Config
            
            self.SCOPES = ['https://www.googleapis.com/auth/documents']
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
            
            self.service = build('docs', 'v1', credentials=self.creds)
            logger.info("Google Docs initialized successfully")
        
        except Exception as e:
            logger.error(f"Failed to initialize Google Docs: {e}")
            raise
    
    def append_conversation(self, contact: Dict[str, Any], message: str, 
                           analysis: Dict[str, Any]):
        try:
            doc_id = contact.get('google_doc_id')
            
            if not doc_id:
                doc_id = self._create_conversation_doc(contact)
            
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            
            content = f"\n\n## {timestamp}\n"
            content += f"**From Client**: {message}\n"
            content += f"**Sentiment**: {analysis.get('sentiment')} | **Urgency**: {analysis.get('urgency')}\n"
            
            if analysis.get('action_items'):
                content += "**Action Items**:\n"
                for item in analysis.get('action_items', []):
                    content += f"- {item}\n"
            
            content += f"\n**AI Suggested Response**: {analysis.get('suggested_response', '')}\n"
            content += "**Actual Response**: [To be filled after sending]\n"
            content += "\n---\n"
            
            requests = [{
                'insertText': {
                    'location': {
                        'index': 1
                    },
                    'text': content
                }
            }]
            
            self.service.documents().batchUpdate(
                documentId=doc_id,
                body={'requests': requests}
            ).execute()
            
            logger.info(f"Appended conversation to doc {doc_id}")
        
        except Exception as e:
            logger.error(f"Failed to append to Google Docs: {e}")
            raise
    
    def _create_conversation_doc(self, contact: Dict[str, Any]) -> str:
        title = f"Conversation Log: {contact.get('name', contact['phone_number'])}"
        
        body = {
            'title': title
        }
        
        doc = self.service.documents().create(body=body).execute()
        doc_id = doc.get('documentId')
        
        logger.info(f"Created new conversation doc: {doc_id}")
        return doc_id
