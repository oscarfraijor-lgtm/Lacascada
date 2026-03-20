import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    WHATSAPP_ACCESS_TOKEN = os.getenv('WHATSAPP_ACCESS_TOKEN')
    WHATSAPP_PHONE_NUMBER_ID_US = os.getenv('WHATSAPP_PHONE_NUMBER_ID_US')
    WHATSAPP_PHONE_NUMBER_ID_MX = os.getenv('WHATSAPP_PHONE_NUMBER_ID_MX')
    WHATSAPP_BUSINESS_ACCOUNT_ID = os.getenv('WHATSAPP_BUSINESS_ACCOUNT_ID')
    WHATSAPP_APP_ID = os.getenv('WHATSAPP_APP_ID')
    WHATSAPP_APP_SECRET = os.getenv('WHATSAPP_APP_SECRET')
    
    WEBHOOK_VERIFY_TOKEN = os.getenv('WEBHOOK_VERIFY_TOKEN')
    
    GOOGLE_CREDENTIALS_FILE = os.getenv('GOOGLE_CREDENTIALS_FILE', 'credentials.json')
    GOOGLE_TOKEN_FILE = os.getenv('GOOGLE_TOKEN_FILE', 'token.json')
    GOOGLE_SHEET_ID = os.getenv('GOOGLE_SHEET_ID')
    GOOGLE_DOCS_FOLDER_ID = os.getenv('GOOGLE_DOCS_FOLDER_ID')
    
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    GOOGLE_AI_API_KEY = os.getenv('GOOGLE_AI_API_KEY')
    AI_MODEL = os.getenv('AI_MODEL', 'gpt-4')
    
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///whatsapp_ip.db')
    
    ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY')
    
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 8000))
    
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    
    @staticmethod
    def validate():
        required = [
            'WHATSAPP_ACCESS_TOKEN',
            'WEBHOOK_VERIFY_TOKEN'
        ]
        missing = [key for key in required if not getattr(Config, key)]
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
