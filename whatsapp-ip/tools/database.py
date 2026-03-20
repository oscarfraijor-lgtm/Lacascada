import sqlite3
from datetime import datetime
from typing import Optional, List, Dict, Any
import json
import logging

logger = logging.getLogger(__name__)

class Database:
    def __init__(self, db_path: str = "whatsapp_ip.db"):
        self.db_path = db_path
        self.init_database()
    
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def init_database(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS contacts (
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
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
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
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ai_analysis (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id INTEGER NOT NULL,
                sentiment TEXT,
                urgency TEXT,
                intent TEXT,
                action_items TEXT,
                key_topics TEXT,
                suggested_response TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (message_id) REFERENCES messages(id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS pending_responses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id INTEGER NOT NULL,
                suggested_response TEXT NOT NULL,
                edited_response TEXT,
                status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'sent')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                approved_at TIMESTAMP,
                sent_at TIMESTAMP,
                FOREIGN KEY (message_id) REFERENCES messages(id)
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS google_sync_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                contact_id INTEGER NOT NULL,
                sync_type TEXT CHECK(sync_type IN ('sheets', 'docs', 'calendar')),
                resource_id TEXT,
                resource_url TEXT,
                status TEXT,
                error_message TEXT,
                synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (contact_id) REFERENCES contacts(id)
            )
        ''')
        
        conn.commit()
        conn.close()
        logger.info("Database initialized successfully")
    
    def get_contact_by_phone(self, phone_number: str) -> Optional[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM contacts WHERE phone_number = ?', (phone_number,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None
    
    def create_contact(self, phone_number: str, name: str = None, 
                      classification: str = 'unknown', confidence_score: float = 0.0) -> int:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO contacts (phone_number, name, classification, confidence_score, 
                                last_interaction, conversation_count)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 1)
        ''', (phone_number, name, classification, confidence_score))
        contact_id = cursor.lastrowid
        conn.commit()
        conn.close()
        logger.info(f"Created contact: {phone_number} (ID: {contact_id})")
        return contact_id
    
    def update_contact_classification(self, contact_id: int, classification: str, 
                                     confidence_score: float = 1.0):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE contacts 
            SET classification = ?, confidence_score = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (classification, confidence_score, contact_id))
        conn.commit()
        conn.close()
        logger.info(f"Updated contact {contact_id} classification to {classification}")
    
    def update_contact_interaction(self, contact_id: int):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE contacts 
            SET last_interaction = CURRENT_TIMESTAMP, 
                conversation_count = conversation_count + 1
            WHERE id = ?
        ''', (contact_id,))
        conn.commit()
        conn.close()
    
    def create_message(self, message_id: str, contact_id: int, direction: str,
                      message_type: str, content: str, timestamp: str,
                      phone_number_id: str = None, media_url: str = None) -> int:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO messages (message_id, contact_id, direction, message_type, 
                                content, media_url, timestamp, phone_number_id, is_processed)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
        ''', (message_id, contact_id, direction, message_type, content, media_url, 
              timestamp, phone_number_id))
        msg_id = cursor.lastrowid
        conn.commit()
        conn.close()
        logger.info(f"Created message: {message_id} (DB ID: {msg_id})")
        return msg_id
    
    def get_conversation_history(self, contact_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM messages 
            WHERE contact_id = ? 
            ORDER BY timestamp DESC 
            LIMIT ?
        ''', (contact_id, limit))
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in reversed(rows)]
    
    def create_ai_analysis(self, message_id: int, sentiment: str, urgency: str,
                          intent: str, action_items: List[str], key_topics: List[str],
                          suggested_response: str) -> int:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO ai_analysis (message_id, sentiment, urgency, intent, 
                                   action_items, key_topics, suggested_response)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (message_id, sentiment, urgency, intent, 
              json.dumps(action_items), json.dumps(key_topics), suggested_response))
        analysis_id = cursor.lastrowid
        conn.commit()
        conn.close()
        logger.info(f"Created AI analysis for message {message_id}")
        return analysis_id
    
    def create_pending_response(self, message_id: int, suggested_response: str) -> int:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO pending_responses (message_id, suggested_response, status)
            VALUES (?, ?, 'pending')
        ''', (message_id, suggested_response))
        response_id = cursor.lastrowid
        conn.commit()
        conn.close()
        logger.info(f"Created pending response for message {message_id}")
        return response_id
    
    def get_pending_responses(self) -> List[Dict[str, Any]]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            SELECT pr.*, m.content as message_content, c.name, c.phone_number,
                   aa.sentiment, aa.urgency, aa.intent
            FROM pending_responses pr
            JOIN messages m ON pr.message_id = m.id
            JOIN contacts c ON m.contact_id = c.id
            LEFT JOIN ai_analysis aa ON aa.message_id = m.id
            WHERE pr.status = 'pending'
            ORDER BY pr.created_at DESC
        ''')
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    
    def approve_response(self, response_id: int, edited_response: str = None):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE pending_responses 
            SET status = 'approved', edited_response = ?, approved_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (edited_response, response_id))
        conn.commit()
        conn.close()
        logger.info(f"Approved response {response_id}")
    
    def mark_response_sent(self, response_id: int):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE pending_responses 
            SET status = 'sent', sent_at = CURRENT_TIMESTAMP
            WHERE id = ?
        ''', (response_id,))
        conn.commit()
        conn.close()
        logger.info(f"Marked response {response_id} as sent")
    
    def log_google_sync(self, contact_id: int, sync_type: str, resource_id: str = None,
                       resource_url: str = None, status: str = 'success', 
                       error_message: str = None):
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO google_sync_log (contact_id, sync_type, resource_id, 
                                        resource_url, status, error_message)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (contact_id, sync_type, resource_id, resource_url, status, error_message))
        conn.commit()
        conn.close()
