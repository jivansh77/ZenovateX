from twilio.rest import Client
from datetime import datetime
import os
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

# Additional CORS headers
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Enable debug mode
app.debug = True

# Twilio credentials
account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
twilio_phone_number = os.getenv('TWILIO_PHONE_NUMBER')

print("Server starting with following configuration:")
print(f"TWILIO_PHONE_NUMBER: {twilio_phone_number}")
print(f"TWILIO_ACCOUNT_SID: {account_sid[:6]}..." if account_sid else "TWILIO_ACCOUNT_SID: Not set")
print(f"TWILIO_AUTH_TOKEN: {auth_token[:6]}..." if auth_token else "TWILIO_AUTH_TOKEN: Not set")

class CustomerMessenger:
    def __init__(self):
        self.client = Client(account_sid, auth_token)

    def send_reminder(self, customer_phone, message):
        """
        Send a reminder message to a customer
        
        Args:
            customer_phone (str): Customer's phone number including country code (e.g., '+1234567890')
            message (str): The reminder message to send
            
        Returns:
            dict: Contains status ('success' or 'error') and additional info (message sid or error message)
        """
        try:
            print(f"Attempting to send message to {customer_phone}")
            message_response = self.client.messages.create(
                body=message,
                from_=f"whatsapp:{twilio_phone_number}",
                to=f"whatsapp:{customer_phone}"
            )
            print(f"Message sent successfully with SID: {message_response.sid}")
            return {
                'status': 'success',
                'message_sid': message_response.sid,
                'body': message_response.body
            }
        except Exception as e:
            print(f"Error sending message: {str(e)}")
            return {
                'status': 'error',
                'error': str(e)
            }

# Initialize the messenger
messenger = CustomerMessenger()

@app.route('/')
def home():
    return jsonify({"status": "WhatsApp API is running"})

@app.route('/api/whatsapp/send', methods=['POST', 'OPTIONS'])
def send_whatsapp():
    if request.method == 'OPTIONS':
        # Handle preflight request
        return '', 204
        
    print("Received WhatsApp send request")
    print(f"Request headers: {dict(request.headers)}")
    print(f"Request method: {request.method}")
    
    try:
        data = request.get_json()
        print(f"Request data: {data}")
        
        phone = data.get('phone')
        message = data.get('message')
        
        if not phone or not message:
            print("Missing required fields")
            return jsonify({
                'status': 'error',
                'message': 'Phone number and message are required'
            }), 400
            
        print(f"Sending message to {phone}")
        result = messenger.send_reminder(phone, message)
        print(f"Send result: {result}")
        
        if result['status'] == 'success':
            return jsonify({
                'status': 'success',
                'message': 'Message sent successfully',
                'data': result
            })
        else:
            return jsonify({
                'status': 'error',
                'message': result['error']
            }), 500
            
    except Exception as e:
        print(f"Error in send_whatsapp: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == "__main__":
    print("Starting Flask server...")
    # Run the app on all network interfaces
    app.run(host='0.0.0.0', port=5006, debug=True)