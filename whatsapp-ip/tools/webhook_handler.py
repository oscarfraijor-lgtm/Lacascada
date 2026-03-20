from flask import Flask, request, jsonify
import logging
from typing import Dict, Any
from config import Config
from tools.whatsapp_validator import WhatsAppValidator
from tools.message_processor import MessageProcessor

logger = logging.getLogger(__name__)

class WebhookHandler:
    def __init__(self, app: Flask):
        self.app = app
        self.validator = WhatsAppValidator()
        self.processor = MessageProcessor()
        self.setup_routes()
    
    def setup_routes(self):
        @self.app.route('/webhook', methods=['GET'])
        def verify_webhook():
            return self.verify_webhook_handler()
        
        @self.app.route('/webhook', methods=['POST'])
        def receive_message():
            return self.receive_message_handler()
        
        @self.app.route('/health', methods=['GET'])
        def health_check():
            return jsonify({"status": "healthy"}), 200
    
    def verify_webhook_handler(self):
        mode = request.args.get('hub.mode')
        token = request.args.get('hub.verify_token')
        challenge = request.args.get('hub.challenge')
        
        if mode == 'subscribe' and token == Config.WEBHOOK_VERIFY_TOKEN:
            logger.info("WEBHOOK_VERIFIED")
            return challenge, 200
        else:
            logger.warning("Webhook verification failed")
            return 'Forbidden', 403
    
    def receive_message_handler(self):
        try:
            body = request.get_json()
            
            if not self.validator.validate_signature(
                request.data, 
                request.headers.get('X-Hub-Signature-256', '')
            ):
                logger.warning("Invalid webhook signature")
                return 'Unauthorized', 401
            
            if body.get('object') == 'whatsapp_business_account':
                for entry in body.get('entry', []):
                    for change in entry.get('changes', []):
                        if change.get('field') == 'messages':
                            value = change.get('value', {})
                            
                            if 'messages' in value:
                                for message in value['messages']:
                                    self.processor.process_incoming_message(message, value)
                            
                            if 'statuses' in value:
                                for status in value['statuses']:
                                    logger.info(f"Message status update: {status}")
            
            return jsonify({"status": "ok"}), 200
        
        except Exception as e:
            logger.error(f"Error processing webhook: {e}", exc_info=True)
            return jsonify({"error": "Internal server error"}), 500
