# M-Pesa STK Push Implementation Guide

> Complete backend implementation reference for M-Pesa Express (STK Push) payments in Django/Python systems.

---

## Overview

M-Pesa STK Push is Safaricom's payment request mechanism that sends a payment prompt to the customer's phone. This guide covers the complete implementation:

1. **Initiation** — Requesting payment from the customer
2. **Callback** — Receiving payment result from Safaricom
3. **Verification** — Securing webhook communications

---

## 1. Required Configuration

### Environment Variables (.env)

```bash
# Daraja API Credentials
DARAJA_CONSUMER_KEY=your_consumer_key
DARAJA_CONSUMER_SECRET=your_consumer_secret
DARAJA_SHORTCODE=123456
DARAJA_PASSKEY=your_passkey
DARAJA_CALLBACK_URL=https://yourdomain.com/api/mpesa-callback/
DARAJA_ENVIRONMENT=sandbox  # or 'production'
```

### Django Settings

```python
# settings.py
DARAJA_CONSUMER_KEY = os.environ.get('DARAJA_CONSUMER_KEY')
DARAJA_CONSUMER_SECRET = os.environ.get('DARAJA_CONSUMER_SECRET')
DARAJA_SHORTCODE = os.environ.get('DARAJA_SHORTCODE')
DARAJA_PASSKEY = os.environ.get('DARAJA_PASSKEY')
DARAJA_CALLBACK_URL = os.environ.get('DARAJA_CALLBACK_URL')
DARAJA_ENVIRONMENT = os.environ.get('DARAJA_ENVIRONMENT', 'sandbox')
```

---

## 2. Daraja Service

> Direct communication with Safaricom Daraja API.

```python
# donations/daraja_service.py
import requests
import base64
import logging
from datetime import datetime
from django.conf import settings

logger = logging.getLogger(__name__)

class DarajaService:
    """Handle Safaricom Daraja API (M-Pesa Express/STK Push)"""

    @classmethod
    def get_access_token(cls):
        """
        Authenticate with Daraja and get OAuth token.
        
        Returns:
            str: Access token for API requests
            
        Raises:
            Exception: If authentication fails
        """
        if settings.DARAJA_ENVIRONMENT == 'production':
            auth_url = 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
        else:
            auth_url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

        # Create Basic Auth header
        auth_string = f"{settings.DARAJA_CONSUMER_KEY}:{settings.DARAJA_CONSUMER_SECRET}"
        encoded_auth = base64.b64encode(auth_string.encode()).decode()

        headers = {'Authorization': f'Basic {encoded_auth}'}
        response = requests.get(auth_url, headers=headers)

        if response.status_code == 200:
            return response.json().get('access_token')
        else:
            logger.error(f"Token fetch failed: {response.status_code} - {response.text}")
            raise Exception(f"Failed to get access token: {response.text}")

    @classmethod
    def initiate_stk_push(cls, phone_number, amount, account_reference, transaction_desc, callback_url=None):
        """
        Initiate STK Push request.
        
        Args:
            phone_number (str): Customer phone (2547XXXXXXXX or 07XXXXXXXX)
            amount (int): Amount in KES
            account_reference (str): Up to 12 chars - your internal reference
            transaction_desc (str): Up to 13 chars - description
            callback_url (str, optional): Custom callback URL
        
        Returns:
            str: CheckoutRequestID on success
            
        Raises:
            ValueError: On API failure
        """
        # Normalize phone number
        phone_number = str(phone_number).strip()
        if phone_number.startswith('0'):
            phone_number = '254' + phone_number[1:]
        elif phone_number.startswith('+'):
            phone_number = phone_number[1:]

        # Get access token
        access_token = cls.get_access_token()

        # Determine API URL
        if settings.DARAJA_ENVIRONMENT == 'production':
            api_url = 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
        else:
            api_url = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'

        # Build password: base64(shortcode + passkey + timestamp)
        shortcode = settings.DARAJA_SHORTCODE
        passkey = settings.DARAJA_PASSKEY
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode(f"{shortcode}{passkey}{timestamp}".encode()).decode()

        # Use default callback if not provided
        if not callback_url:
            callback_url = settings.DARAJA_CALLBACK_URL

        payload = {
            "BusinessShortCode": shortcode,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone_number,           # Customer phone
            "PartyB": shortcode,               # Business shortcode
            "PhoneNumber": phone_number,
            "CallBackURL": callback_url,
            "AccountReference": account_reference[:12],
            "TransactionDesc": transaction_desc[:13]
        }

        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        logger.info(f"Initiating STK Push: {phone_number} -> KES {amount}")

        response = requests.post(api_url, headers=headers, json=payload)

        if response.status_code == 200:
            res_data = response.json()
            if res_data.get('ResponseCode') == '0':
                checkout_id = res_data.get('CheckoutRequestID')
                logger.info(f"STK Push initiated: {checkout_id}")
                return checkout_id
            else:
                logger.error(f"STK Push failed: {res_data}")
                raise ValueError(res_data.get('CustomerMessage', 'Payment initiation failed'))
        else:
            logger.error(f"HTTP Error {response.status_code}: {response.text}")
            raise ValueError(f"HTTP {response.status_code}: {response.text}")
```

---

## 3. Payment Service

> Business logic for payment processing.

```python
# donations/services.py
import logging
import uuid
from django.utils import timezone
from django.conf import settings

logger = logging.getLogger(__name__)

class PaymentService:

    @staticmethod
    def initiate_mpesa_payment(phone_number, amount, donor_info=None):
        """
        Create pending donation and initiate STK Push.
        
        Args:
            phone_number (str): Customer phone number
            amount (int): Donation amount in KES
            donor_info (dict, optional): {'donor_name', 'donor_email', 'campaign', etc.}
        
        Returns:
            tuple: (donation_object, checkout_request_id)
        """
        donor_info = donor_info or {}
        
        # 1. Generate temporary transaction ID
        temp_tx_id = f"TEMP-{timezone.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"

        # 2. Create pending donation record
        donation = Donation.objects.create(
            amount=amount,
            phone_number=phone_number,
            donor_name=donor_info.get('donor_name', ''),
            donor_email=donor_info.get('donor_email', ''),
            campaign=donor_info.get('campaign'),
            status=Donation.Status.PENDING,
            payment_method=Donation.PaymentMethod.MPESA,
            transaction_id=temp_tx_id
        )

        # 3. Generate security token for callback verification
        callback_token = uuid.uuid4().hex

        # 4. Build callback URL with token
        base_callback = settings.DARAJA_CALLBACK_URL
        separator = '&' if '?' in base_callback else '?'
        callback_url = f"{base_callback}{separator}token={callback_token}"

        # 5. Initiate STK Push via Daraja
        account_ref = f"PAY-{donation.id.hex[:8]}"
        transaction_desc = donor_info.get('description', 'Payment')

        checkout_request_id = DarajaService.initiate_stk_push(
            phone_number=phone_number,
            amount=amount,
            account_reference=account_ref,
            transaction_desc=transaction_desc,
            callback_url=callback_url
        )

        # 6. Save payment reference and token
        donation.payment_reference = checkout_request_id
        donation.callback_token = callback_token
        donation.save()

        logger.info(f"STK Push initiated for donation {donation.id}: {checkout_request_id}")

        return donation, checkout_request_id

    @staticmethod
    def handle_mpesa_callback(data, request_token=None):
        """
        Handle webhook callback from Safaricom.
        
        Args:
            data (dict): The JSON payload from Safaricom
            request_token (str): Token from URL query string (security verification)
        
        Returns:
            bool: True if processed successfully
        """
        try:
            # Parse STK callback
            stk_callback = data.get('Body', {}).get('stkCallback', {})
            result_code = stk_callback.get('ResultCode')
            result_desc = stk_callback.get('ResultDesc')
            checkout_request_id = stk_callback.get('CheckoutRequestID')

            if not checkout_request_id:
                logger.error("Callback missing CheckoutRequestID")
                return False

            # Find donation by payment reference
            try:
                donation = Donation.objects.get(payment_reference=checkout_request_id)
            except Donation.DoesNotExist:
                logger.error(f"Donation not found for CheckoutRequestID: {checkout_request_id}")
                return False

            # Security check - verify token
            if donation.callback_token and donation.callback_token != request_token:
                logger.warning(f"Security alert: Invalid token for donation {donation.id}")
                return False

            # Check if already processed
            if donation.status != Donation.Status.PENDING:
                logger.info(f"Donation {donation.id} already processed: {donation.status}")
                return True

            # Store raw result code for auditing
            donation.last_mpesa_result_code = str(result_code)

            if result_code == 0:
                # SUCCESS - Extract payment details from metadata
                metadata = stk_callback.get('CallbackMetadata', {}).get('Item', [])
                
                mpesa_receipt = None
                customer_name = None
                
                for item in metadata:
                    name = item.get('Name')
                    value = item.get('Value')
                    
                    if name == 'MpesaReceiptNumber':
                        mpesa_receipt = value
                    elif name in ['CustomerName', 'Name']:
                        customer_name = value

                # Update donation with real transaction ID
                if mpesa_receipt:
                    donation.transaction_id = mpesa_receipt
                if customer_name:
                    donation.mpesa_name = customer_name
                    
                donation.status = Donation.Status.COMPLETED
                donation.save()

                logger.info(f"Payment SUCCESS: donation {donation.id} -> M-Pesa {mpesa_receipt}")
                
                # Trigger post-payment actions (receipt generation, notifications, etc.)
                # PaymentService.finalize_donation(donation)
                
            else:
                # FAILED - Map error code to friendly message
                error_messages = {
                    '1': 'The request was rejected by M-Pesa.',
                    '17': 'Too many requests. Please try again later.',
                    '2001': 'Insufficient funds.',
                    '2002': 'Invalid MPesa recipient.',
                    '2010': 'The caller is not allowed to access this resource.',
                    '2011': 'Expired QR code.',
                    '2012': 'Invalid transaction.',
                    '2023': 'Security risk flagged.',
                }
                friendly_message = error_messages.get(str(result_code), result_desc)

                donation.status = Donation.Status.FAILED
                donation.message = friendly_message[:200]
                donation.save()

                logger.warning(f"Payment FAILED: donation {donation.id} -> Code {result_code}: {result_desc}")

            return True

        except Exception as e:
            logger.error(f"Callback error: {str(e)}", exc_info=True)
            return False
```

---

## 4. API Views

> REST API endpoints using Django REST Framework.

```python
# donations/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .services import PaymentService
from .models import Donation
import logging

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def initiate_mpesa_payment(request):
    """
    Initiate M-Pesa STK Push payment.
    
    POST /api/mpesa/initiate/
    
    Request Body:
    {
        "phone_number": "254712345678",
        "amount": 1000,
        "donor_name": "John Doe",
        "donor_email": "john@example.com",
        "campaign": "education-fund"
    }
    
    Response (202 Accepted):
    {
        "status": "success",
        "message": "STK Push sent. Check your phone.",
        "checkout_request_id": "ws_CO_270720211413409242",
        "transaction_id": "TEMP-20260727-abc123"
    }
    """
    phone = request.data.get('phone_number')
    amount = request.data.get('amount')

    # Validation
    if not phone:
        return Response({'error': 'phone_number is required'}, status=status.HTTP_400_BAD_REQUEST)
    if not amount or int(amount) < 1:
        return Response({'error': 'Valid amount is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        donation, checkout_id = PaymentService.initiate_mpesa_payment(
            phone_number=phone,
            amount=int(amount),
            donor_info={
                'donor_name': request.data.get('donor_name', ''),
                'donor_email': request.data.get('donor_email', ''),
                'campaign': request.data.get('campaign'),
                'description': request.data.get('description', 'Payment')
            }
        )
        
        return Response({
            'status': 'success',
            'message': 'M-Pesa STK Push initiated. Please check your phone to complete the payment.',
            'checkout_request_id': checkout_id,
            'transaction_id': donation.transaction_id
        }, status=status.HTTP_202_ACCEPTED)
        
    except ValueError as e:
        logger.warning(f"Payment initiation failed: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return Response({'error': 'Internal server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def mpesa_callback(request):
    """
    Webhook endpoint - called by Safaricom Daraja.
    
    POST /api/mpesa/callback/?token=abc123
    
    Safaricom sends payment confirmation/failure here.
    """
    token = request.query_params.get('token')
    
    try:
        success = PaymentService.handle_mpesa_callback(request.data, request_token=token)
        
        # Always return success to Safaricom (they don't retry on failure response)
        if success:
            return Response({"ResultCode": 0, "ResultDesc": "Success"})
        else:
            return Response({"ResultCode": 1, "ResultDesc": "Failed to process"})
            
    except Exception as e:
        logger.error(f"Unhandled callback error: {str(e)}", exc_info=True)
        return Response({"ResultCode": 1, "ResultDesc": "Server Error"})


@api_view(['GET'])
@permission_classes([AllowAny])
def check_payment_status(request):
    """
    Check payment status by CheckoutRequestID.
    
    GET /api/mpesa/status/?checkout_request_id=ws_CO_...
    
    Response:
    {
        "status": "COMPLETED|PENDING|FAILED",
        "transaction_id": "RGH123456ABC",
        "message": "Payment successful"
    }
    """
    checkout_id = request.query_params.get('checkout_request_id')
    
    if not checkout_id:
        return Response({'error': 'checkout_request_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        donation = Donation.objects.get(payment_reference=checkout_id)
        return Response({
            'status': donation.status,
            'transaction_id': donation.transaction_id,
            'message': donation.message or ''
        })
    except Donation.DoesNotExist:
        return Response({'error': 'Transaction not found'}, status=status.HTTP_404_NOT_FOUND)
```

---

## 5. URL Routing

```python
# donations/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('mpesa/initiate/', views.initiate_mpesa_payment, name='initiate_mpesa'),
    path('mpesa/callback/', views.mpesa_callback, name='mpesa_callback'),
    path('mpesa/status/', views.check_payment_status, name='check_status'),
]
```

```python
# project urls.py
from django.urls import path, include

urlpatterns = [
    # ... other urls
    path('api/', include('donations.urls')),
]
```

---

## 6. Data Model

```python
# donations/models.py
from django.db import models

class Donation(models.Model):
    """Donation/Payment model"""
    
    class PaymentMethod(models.TextChoices):
        MPESA = 'MPESA', 'M-Pesa'
        PAYPAL = 'PAYPAL', 'PayPal'
        STRIPE = 'STRIPE', 'Stripe'
        BANK = 'BANK', 'Bank Transfer'
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        COMPLETED = 'COMPLETED', 'Completed'
        FAILED = 'FAILED', 'Failed'
        CANCELLED = 'CANCELLED', 'Cancelled'
    
    # Core fields
    amount = models.IntegerField()
    transaction_id = models.CharField(max_length=100, unique=True)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    
    # Donor info
    donor_name = models.CharField(max_length=200, blank=True)
    donor_email = models.EmailField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    
    # M-Pesa specific
    payment_reference = models.CharField(max_length=100, blank=True)  # CheckoutRequestID
    callback_token = models.CharField(max_length=64, blank=True)      # Security token
    mpesa_name = models.CharField(max_length=200, blank=True)         # Customer name from M-Pesa
    last_mpesa_result_code = models.CharField(max_length=10, blank=True)
    
    # Additional
    campaign = models.ForeignKey('Campaign', on_delete=models.SET_NULL, null=True, blank=True)
    message = models.TextField(blank=True)
    is_anonymous = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Donation {self.transaction_id} - KES {self.amount}"
```

---

## 7. Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STK PUSH PAYMENT FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

    FRONTEND                      BACKEND                          DARAJA API
    ────────                      ────────                          ──────────
       
       │                                                                    │
       │  1. POST /api/mpesa/initiate/                                      │
       │     {phone: "2547...", amount: 1000}                              │
       │────────────────────────────────────────────▶                        │
       │                                                                    │
       │                                             ┌────────────────────┐ │
       │                                             │ Create PENDING     │ │
       │                                             │ donation record    │ │
       │                                             └─────────┬──────────┘ │
       │                                                       │            │
       │                                             ┌─────────▼──────────┐ │
       │                                             │ Generate callback │ │
       │                                             │ token & URL       │ │
       │                                             └─────────┬──────────┘ │
       │                                                       │            │
       │                                             ┌─────────▼──────────┐ │
       │                                             │ GET /oauth/v1/    │ │
       │                                             │ generate           │ │
       │                                             │ (get access token)│ │
       │                                             └─────────┬──────────┘ │
       │                                                       │            │
       │                                             ┌─────────▼──────────┐ │
       │                                             │ POST /mpesa/stkpush│ │
       │                                             │ /v1/processrequest │ │
       │                                             └─────────┬──────────┘ │
       │                                                       │            │
       │◀───────────────────────────────────────────── │ CheckoutRequestID│
       │     202 Accepted                               │ (e.g. ws_CO_...)  │
       │     {checkout_request_id: "ws_CO_..."}         │                   │
       │                                                                    │
       │                                                                    │
       │                                         (User enters PIN on phone) │
       │                                                                    │
       │                                                                    │
       │                              ┌────────────────────────────────────┤
       │◀─────────────────────────────│ 2. POST /api/mpesa/callback/      │
       │     Webhook from Safaricom  │     ?token=abc123                  │
       │     {Body: {stkCallback: {  │     {Body: {stkCallback: {...}}}   │
       │       ResultCode: 0,        │                                    │
       │       CheckoutRequestID: .. │                                    │
       │       CallbackMetadata: []  │                                    │
       │     }}}                     │                                    │
       │                              │                                    │
       │                              ├────────────────────────────────────┤
       │                              │ Verify callback token             │
       │                              │ Find donation by payment_reference │
       │                              │ Update status (COMPLETED/FAILED)   │
       │                              │ Store M-Pesa receipt number        │
       │                              └────────────────────────────────────┤
       │                                                                    │
       │  3. GET /api/mpesa/status/                                        │
       │     ?checkout_request_id=ws_CO_...                                │
       │─────────────────────────────────────────▶                          │
       │                                                                    │
       │◀────────────────────────────────────────── {status: "COMPLETED"}   │
       │                                                                    │
       
```

---

## 8. Error Codes Reference

| Result Code | Meaning | Action |
|-------------|---------|--------|
| `0` | Success | Complete the transaction |
| `1` | Insufficient Funds | Notify user to add funds |
| `17` | Too Many Requests | Rate limit - retry later |
| `2001` | Insufficient Funds | User needs more M-Pesa balance |
| `2002` | Invalid Recipient | Check phone number format |
| `2010` | Not Authorized | Check API credentials |
| `2011` | Expired QR | Request new payment |
| `2012` | Invalid Transaction | Contact support |
| `2023` | Security Risk Flagged | Flag for review |

---

## 9. Security Checklist

- [ ] **HTTPS Only** — Callback URL must be publicly accessible via HTTPS
- [ ] **Token Verification** — Always verify the callback token matches
- [ ] **Idempotency** — Check donation status before processing (prevent double-processing)
- [ ] **Logging** — Log all payment events for auditing
- [ ] **Environment Separation** — Use sandbox for testing, production for live

---

## 10. Testing

### Sandbox Testing

1. Get credentials from [Safaricom Developer Portal](https://developer.safaricom.co.ke)
2. Use test phone numbers: `254708000000` - `254708999999`
3. Use any amount (KES 1 - 100,000)

### Test Sequence

```bash
# 1. Initiate payment
curl -X POST https://sandbox.yourdomain.com/api/mpesa/initiate/ \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "254708000001", "amount": 100}'

# Response:
# {"status": "success", "checkout_request_id": "ws_CO_...", ...}

# 2. Check status
curl "https://sandbox.yourdomain.com/api/mpesa/status/?checkout_request_id=ws_CO_..."

# 3. Simulate callback (in sandbox, Daraja provides test UI)
```

---

## 11. Required Credentials

| Credential | Source | Purpose |
|------------|--------|---------|
| Consumer Key | Daraja Developer Portal | API authentication |
| Consumer Secret | Daraja Developer Portal | API authentication |
| Shortcode | M-Pesa Portal | Business identifier |
| Passkey | M-Pesa Portal | Password encryption |
| Callback URL | You configure | Webhook endpoint |

---

## 12. Quick Reference

```python
# Minimum implementation checklist
□ Add credentials to .env
□ Implement DarajaService.get_access_token()
□ Implement DarajaService.initiate_stk_push()
□ Implement PaymentService.handle_mpesa_callback()
□ Create API endpoints (initiate, callback, status)
□ Configure public HTTPS callback URL
□ Test with sandbox credentials
```

---

> Generated from Kindra CBO donation system — April 2026