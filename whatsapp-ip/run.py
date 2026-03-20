from flask import Flask
import logging
from config import Config
from tools.webhook_handler import WebhookHandler

logging.basicConfig(
    level=getattr(logging, Config.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

app = Flask(__name__)
app.config['SECRET_KEY'] = Config.SECRET_KEY

try:
    Config.validate()
    logger.info("Configuration validated successfully")
except ValueError as e:
    logger.error(f"Configuration error: {e}")
    logger.warning("Some features may not work without proper configuration")

webhook_handler = WebhookHandler(app)

@app.route('/')
def index():
    return '''
    <h1>WhatsApp IP - Intelligent Client Conversation Manager</h1>
    <p>Status: Running</p>
    <ul>
        <li><a href="/health">Health Check</a></li>
        <li><a href="/dashboard">Dashboard</a> (Coming soon)</li>
    </ul>
    '''

if __name__ == '__main__':
    logger.info(f"Starting WhatsApp IP server on {Config.HOST}:{Config.PORT}")
    logger.info(f"Environment: {Config.ENVIRONMENT}")
    
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=(Config.ENVIRONMENT == 'development')
    )
