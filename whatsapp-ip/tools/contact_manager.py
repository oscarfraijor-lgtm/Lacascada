import logging
from typing import Dict, Any, Optional
from tools.database import Database

logger = logging.getLogger(__name__)

class ContactManager:
    def __init__(self, db: Database):
        self.db = db
    
    def get_or_create_contact(self, phone_number: str, name: str = None) -> Dict[str, Any]:
        contact = self.db.get_contact_by_phone(phone_number)
        
        if contact:
            logger.info(f"Found existing contact: {phone_number} ({contact['classification']})")
            return contact
        
        logger.info(f"Creating new contact: {phone_number}")
        contact_id = self.db.create_contact(
            phone_number=phone_number,
            name=name,
            classification='unknown',
            confidence_score=0.0
        )
        
        return self.db.get_contact_by_phone(phone_number)
    
    def classify_contact(self, contact_id: int, classification: str, confidence_score: float = 1.0):
        if classification not in ['client', 'personal', 'unknown']:
            raise ValueError(f"Invalid classification: {classification}")
        
        self.db.update_contact_classification(contact_id, classification, confidence_score)
        logger.info(f"Contact {contact_id} classified as {classification}")
    
    def get_all_clients(self):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM contacts WHERE classification = 'client' ORDER BY last_interaction DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    
    def get_unknown_contacts(self):
        conn = self.db.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM contacts WHERE classification = 'unknown' ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
