import requests
import base64
import logging
from datetime import datetime
from django.conf import settings

logger = logging.getLogger('kindra_cbo')

class DarajaService:
    """
    Service class to handle Safaricom Daraja API logic (M-Pesa Express/STK Push)
    """

    @classmethod
    def get_access_token(cls):
        """
        Authenticate with Daraja API and get the OAuth Access Token
        """
        if settings.DARAJA_ENVIRONMENT == 'production':
            auth_url = 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
        else:
            auth_url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

        consumer_key = settings.DARAJA_CONSUMER_KEY
        consumer_secret = settings.DARAJA_CONSUMER_SECRET

        if not consumer_key or not consumer_secret:
            raise ValueError("Daraja Consumer Key or Secret is not configured.")

        # Create basic auth string
        auth_string = f"{consumer_key}:{consumer_secret}"
        encoded_auth = base64.b64encode(auth_string.encode('utf-8')).decode('utf-8')

        headers = {
            'Authorization': f'Basic {encoded_auth}'
        }

        response = requests.get(auth_url, headers=headers)

        if response.status_code == 200:
            return response.json().get('access_token')
        else:
            logger.error(f"Failed to get Daraja access token. Status: {response.status_code} | Body: {response.text} | Consumer Key used: {consumer_key[:6]}...{consumer_key[-4:]}")
            raise Exception(f"Could not authenticate with M-Pesa API (HTTP {response.status_code}): {response.text}")

    @classmethod
    def initiate_stk_push(cls, phone_number, amount, account_reference, transaction_desc, callback_token=None):
        """
        Initiates an M-Pesa Express (STK Push) request
        Returns: CheckoutRequestID if successful
        """
        # Ensure correct phone number format e.g. 2547XXXXXXXX
        phone_number = str(phone_number).strip()
        if phone_number.startswith('0'):
            phone_number = '254' + phone_number[1:]
        elif phone_number.startswith('+'):
            phone_number = phone_number[1:]
        
        access_token = cls.get_access_token()
        
        if settings.DARAJA_ENVIRONMENT == 'production':
            api_url = 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
        else:
            api_url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'

        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        shortcode = settings.DARAJA_SHORTCODE
        passkey = settings.DARAJA_PASSKEY
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        
        # password = base64.encode(shortcode + passkey + timestamp)
        password_str = f"{shortcode}{passkey}{timestamp}"
        password = base64.b64encode(password_str.encode('utf-8')).decode('utf-8')

        # Limit account ref and desc lengths per Safaricom docs
        account_reference = account_reference[:12]
        transaction_desc = transaction_desc[:13]

        callback_url = settings.DARAJA_CALLBACK_URL
        if callback_token:
            separator = '&' if '?' in callback_url else '?'
            callback_url = f"{callback_url}{separator}token={callback_token}"

        payload = {
            "BusinessShortCode": shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline", 
            "Amount": int(amount),
            "PartyA": phone_number,
            "PartyB": shortcode, # Use same shortcode in sandbox unless specified
            "PhoneNumber": phone_number,
            "CallBackURL": callback_url,
            "AccountReference": account_reference,
            "TransactionDesc": transaction_desc
        }

        logger.info(f"Initiating STK Push for {phone_number} amount {amount}")

        response = requests.post(api_url, headers=headers, json=payload)
        
        if response.status_code == 200:
            res_data = response.json()
            response_code = res_data.get('ResponseCode')
            if response_code == '0':
                # Success initiation
                return res_data.get('CheckoutRequestID')
            else:
                logger.error(f"STK Push initiation failed (Daraja Code {response_code}): {res_data}")
                raise ValueError(res_data.get('CustomerMessage', 'Payment initiation failed'))
        else:
            logger.error(f"STK Push HTTP Error {response.status_code}: {response.text}")
            err_data = response.json() if response.content else {}
            raise ValueError(err_data.get('errorMessage', 'Failed to communicate with M-Pesa API'))
