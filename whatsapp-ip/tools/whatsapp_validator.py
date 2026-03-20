import hmac
import hashlib
import logging
from config import Config

logger = logging.getLogger(__name__)

class WhatsAppValidator:
    def validate_signature(self, payload: bytes, signature: str) -> bool:
        if not Config.WHATSAPP_APP_SECRET:
            logger.warning("WHATSAPP_APP_SECRET not configured - skipping signature validation")
            return True
        
        try:
            expected_signature = 'sha256=' + hmac.new(
                Config.WHATSAPP_APP_SECRET.encode('utf-8'),
                payload,
                hashlib.sha256
            ).hexdigest()
            
            is_valid = hmac.compare_digest(expected_signature, signature)
            
            if not is_valid:
                logger.warning(f"Signature mismatch. Expected: {expected_signature[:20]}..., Got: {signature[:20]}...")
            
            return is_valid
        
        except Exception as e:
            logger.error(f"Error validating signature: {e}")
            return False
