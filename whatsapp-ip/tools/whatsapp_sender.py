import requests
import logging
from typing import Dict, Any
from config import Config

logger = logging.getLogger(__name__)

class WhatsAppSender:
    def __init__(self):
        self.access_token = Config.WHATSAPP_ACCESS_TOKEN
        self.api_version = 'v18.0'
        self.base_url = f'https://graph.facebook.com/{self.api_version}'
    
    def send_text_message(self, to: str, message: str, phone_number_id: str = None) -> Dict[str, Any]:
        if not phone_number_id:
            phone_number_id = Config.WHATSAPP_PHONE_NUMBER_ID_US
        
        url = f'{self.base_url}/{phone_number_id}/messages'
        
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'messaging_product': 'whatsapp',
            'to': to,
            'type': 'text',
            'text': {
                'body': message
            }
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"Message sent successfully to {to}: {result.get('messages', [{}])[0].get('id')}")
            return result
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send message: {e}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response: {e.response.text}")
            raise
    
    def send_template_message(self, to: str, template_name: str, language_code: str = 'en_US',
                             phone_number_id: str = None) -> Dict[str, Any]:
        if not phone_number_id:
            phone_number_id = Config.WHATSAPP_PHONE_NUMBER_ID_US
        
        url = f'{self.base_url}/{phone_number_id}/messages'
        
        headers = {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'messaging_product': 'whatsapp',
            'to': to,
            'type': 'template',
            'template': {
                'name': template_name,
                'language': {
                    'code': language_code
                }
            }
        }
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"Template message sent to {to}")
            return result
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to send template message: {e}")
            raise
