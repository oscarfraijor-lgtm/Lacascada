import logging
from typing import Dict, Any
from datetime import datetime
from tools.database import Database
from tools.contact_manager import ContactManager
from tools.ai_analyzer import AIAnalyzer
from tools.google_sync import GoogleWorkspaceSync

logger = logging.getLogger(__name__)

class MessageProcessor:
    def __init__(self):
        self.db = Database()
        self.contact_manager = ContactManager(self.db)
        self.ai_analyzer = AIAnalyzer()
        self.google_sync = GoogleWorkspaceSync()
    
    def process_incoming_message(self, message: Dict[str, Any], value: Dict[str, Any]):
        try:
            message_id = message.get('id')
            from_number = message.get('from')
            timestamp = message.get('timestamp')
            message_type = message.get('type')
            
            phone_number_id = value.get('metadata', {}).get('phone_number_id')
            
            content = self._extract_message_content(message, message_type)
            
            logger.info(f"Processing message {message_id} from {from_number}")
            
            contact = self.contact_manager.get_or_create_contact(
                from_number, 
                value.get('contacts', [{}])[0].get('profile', {}).get('name')
            )
            
            if contact['classification'] == 'unknown':
                logger.info(f"Unknown contact {from_number} - prompting user for classification")
                self._handle_unknown_contact(contact, message, content)
                return
            
            if contact['classification'] == 'personal':
                self._handle_personal_message(contact, message_id, message_type, timestamp, phone_number_id)
                return
            
            if contact['classification'] == 'client':
                self._handle_client_message(contact, message_id, message_type, content, timestamp, phone_number_id)
                return
        
        except Exception as e:
            logger.error(f"Error processing message: {e}", exc_info=True)
    
    def _extract_message_content(self, message: Dict[str, Any], message_type: str) -> str:
        if message_type == 'text':
            return message.get('text', {}).get('body', '')
        elif message_type == 'image':
            return f"[Image] {message.get('image', {}).get('caption', '')}"
        elif message_type == 'video':
            return f"[Video] {message.get('video', {}).get('caption', '')}"
        elif message_type == 'audio':
            return "[Audio message]"
        elif message_type == 'document':
            return f"[Document] {message.get('document', {}).get('filename', '')}"
        else:
            return f"[{message_type}]"
    
    def _handle_unknown_contact(self, contact: Dict[str, Any], message: Dict[str, Any], content: str):
        logger.info(f"Storing message from unknown contact for user classification")
        
        msg_id = self.db.create_message(
            message_id=message.get('id'),
            contact_id=contact['id'],
            direction='inbound',
            message_type=message.get('type'),
            content=content,
            timestamp=datetime.fromtimestamp(int(message.get('timestamp'))),
            phone_number_id=None
        )
        
        logger.info(f"Message stored. Awaiting user classification for contact {contact['phone_number']}")
    
    def _handle_personal_message(self, contact: Dict[str, Any], message_id: str, 
                                 message_type: str, timestamp: str, phone_number_id: str):
        logger.info(f"Processing PERSONAL message from {contact['phone_number']}")
        
        self.db.create_message(
            message_id=message_id,
            contact_id=contact['id'],
            direction='inbound',
            message_type=message_type,
            content='[PERSONAL - NOT STORED]',
            timestamp=datetime.fromtimestamp(int(timestamp)),
            phone_number_id=phone_number_id
        )
        
        self.db.update_contact_interaction(contact['id'])
        
        logger.info(f"Personal message logged (metadata only). No AI processing.")
    
    def _handle_client_message(self, contact: Dict[str, Any], message_id: str,
                               message_type: str, content: str, timestamp: str, 
                               phone_number_id: str):
        logger.info(f"Processing CLIENT message from {contact['phone_number']}")
        
        msg_id = self.db.create_message(
            message_id=message_id,
            contact_id=contact['id'],
            direction='inbound',
            message_type=message_type,
            content=content,
            timestamp=datetime.fromtimestamp(int(timestamp)),
            phone_number_id=phone_number_id
        )
        
        self.db.update_contact_interaction(contact['id'])
        
        conversation_history = self.db.get_conversation_history(contact['id'], limit=10)
        
        try:
            analysis = self.ai_analyzer.analyze_message(content, conversation_history, contact)
            
            self.db.create_ai_analysis(
                message_id=msg_id,
                sentiment=analysis.get('sentiment'),
                urgency=analysis.get('urgency'),
                intent=analysis.get('intent'),
                action_items=analysis.get('action_items', []),
                key_topics=analysis.get('key_topics', []),
                suggested_response=analysis.get('suggested_response', '')
            )
            
            self.db.create_pending_response(
                message_id=msg_id,
                suggested_response=analysis.get('suggested_response', '')
            )
            
            try:
                self.google_sync.sync_client_message(contact, content, analysis)
            except Exception as e:
                logger.error(f"Google Workspace sync failed: {e}")
                self.db.log_google_sync(
                    contact_id=contact['id'],
                    sync_type='sheets',
                    status='failed',
                    error_message=str(e)
                )
            
            logger.info(f"Client message processed successfully. AI suggestion ready for user approval.")
        
        except Exception as e:
            logger.error(f"AI analysis failed: {e}", exc_info=True)
            logger.info("Message stored without AI analysis. User can respond manually.")
