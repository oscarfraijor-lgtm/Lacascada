import logging
from typing import Dict, Any, List
import json
from config import Config

logger = logging.getLogger(__name__)

class AIAnalyzer:
    def __init__(self):
        self.model = Config.AI_MODEL
        
        if 'gpt' in self.model.lower():
            try:
                import openai
                self.client = openai.OpenAI(api_key=Config.OPENAI_API_KEY)
                self.provider = 'openai'
            except ImportError:
                logger.error("OpenAI library not installed. Run: pip install openai")
                self.client = None
        elif 'gemini' in self.model.lower():
            try:
                import google.generativeai as genai
                genai.configure(api_key=Config.GOOGLE_AI_API_KEY)
                self.client = genai.GenerativeModel(self.model)
                self.provider = 'google'
            except ImportError:
                logger.error("Google AI library not installed. Run: pip install google-generativeai")
                self.client = None
        else:
            logger.warning(f"Unknown AI model: {self.model}")
            self.client = None
    
    def analyze_message(self, message: str, conversation_history: List[Dict[str, Any]], 
                       contact: Dict[str, Any]) -> Dict[str, Any]:
        if not self.client:
            logger.warning("AI client not configured - returning default analysis")
            return self._default_analysis(message)
        
        try:
            conversation_context = self._format_conversation_history(conversation_history)
            
            analysis_prompt = f"""You are analyzing a WhatsApp conversation with a client.

Client Name: {contact.get('name', 'Unknown')}
Phone: {contact.get('phone_number')}

Conversation History:
{conversation_context}

Latest Message from Client: "{message}"

Analyze this message and provide a JSON response with:
1. sentiment: "positive", "neutral", or "negative"
2. urgency: "high", "medium", or "low"
3. intent: "question", "request", "complaint", "feedback", or "other"
4. action_items: Array of specific tasks or follow-ups mentioned
5. key_topics: Array of main subjects discussed
6. suggested_response: A professional, helpful response (2-3 sentences max)

Respond ONLY with valid JSON, no other text."""

            if self.provider == 'openai':
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant that analyzes business conversations."},
                        {"role": "user", "content": analysis_prompt}
                    ],
                    temperature=0.7,
                    max_tokens=500
                )
                result = response.choices[0].message.content
            
            elif self.provider == 'google':
                response = self.client.generate_content(analysis_prompt)
                result = response.text
            
            try:
                analysis = json.loads(result)
                logger.info(f"AI analysis completed: {analysis.get('sentiment')}/{analysis.get('urgency')}")
                return analysis
            except json.JSONDecodeError:
                logger.error(f"Failed to parse AI response as JSON: {result}")
                return self._default_analysis(message)
        
        except Exception as e:
            logger.error(f"AI analysis error: {e}", exc_info=True)
            return self._default_analysis(message)
    
    def _format_conversation_history(self, history: List[Dict[str, Any]]) -> str:
        if not history:
            return "No previous conversation"
        
        formatted = []
        for msg in history[-5:]:
            direction = "Client" if msg['direction'] == 'inbound' else "You"
            content = msg['content'][:100]
            formatted.append(f"{direction}: {content}")
        
        return "\n".join(formatted)
    
    def _default_analysis(self, message: str) -> Dict[str, Any]:
        return {
            "sentiment": "neutral",
            "urgency": "medium",
            "intent": "question",
            "action_items": [],
            "key_topics": [],
            "suggested_response": "Thank you for your message. I'll review this and get back to you shortly."
        }
