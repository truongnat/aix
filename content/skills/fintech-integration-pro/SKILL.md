---
name: fintech-integration-pro
description: >-
  Use this skill whenever the user wants to integrate with fintech services,
  payment processing, banking APIs, financial data providers, or work with
  financial technology systems. This includes payment gateway integration
  (Stripe, PayPal, Square), banking API integration (Plaid, Yodlee), financial
  data providers (Bloomberg, Alpha Vantage), cryptocurrency APIs, and financial
  platform integrations. If the user mentions payment processing, banking APIs,
  fintech integration, or financial APIs, use this skill.
x-kind: domain
x-version: 0.1.0
x-roles: []
x-tags: []
x-compatible:
  - claude
  - cursor
  - codex
  - gemini
---

## Boundary

This skill handles fintech integration tasks including payment gateway integration, banking API integration, financial data providers, cryptocurrency APIs, and financial platform integrations. It focuses on using REST APIs, webhooks, authentication methods (OAuth, API keys), and secure data handling. It does NOT cover accounting bookkeeping, financial analysis, or investment analysis.

## When to use

Use this skill when:
- Integrating payment gateways (Stripe, PayPal, Square, Adyen)
- Connecting to banking APIs (Plaid, Yodlee, MX)
- Accessing financial data providers (Bloomberg, Alpha Vantage, IEX)
- Building cryptocurrency integrations (Coinbase, Binance)
- Implementing webhook handlers for fintech events
- Working with financial platform APIs
- Handling secure financial data transmission
- Implementing payment flows

DO NOT use this skill for:
- Accounting or bookkeeping (use accounting-pro)
- Financial analysis or modeling (use financial-analysis-pro)
- Investment analysis (use financial-analysis-pro)
- Tax compliance (use tax-specific skills)

## Workflow

1. **Identify the fintech service** (payment gateway, banking API, data provider)
2. **Review API documentation** and authentication requirements
3. **Set up authentication** (API keys, OAuth, client certificates)
4. **Implement API integration** (REST calls, webhooks, SDKs)
5. **Handle errors and edge cases** (timeouts, rate limits, failures)
6. **Implement security measures** (encryption, token management)
7. **Test integration** thoroughly before production
8. **Monitor and maintain** the integration

### Operating principles

- **Follow security best practices** (PCI DSS, encryption, tokenization)
- **Handle sensitive data** securely (never log credentials)
- **Implement proper error handling** (retries, rate limiting)
- **Use webhooks** for real-time updates
- **Validate data** from external APIs
- **Monitor API usage** and costs
- **Keep SDKs updated** to latest versions
- **Document integration** thoroughly

## Suggested response format

```
Fintech Service: [payment gateway / banking API / data provider]
Integration Type: [REST API / SDK / webhook]
Authentication: [API key / OAuth / client certificate]
Status: [integrated / testing / production]
API Endpoints: [key endpoints used]
Webhooks: [webhook handlers implemented]
Security Measures: [encryption, tokenization, etc.]
Next steps: [follow-up integration tasks]
```

## Resources in this skill

- **Payment Gateways**: Stripe, PayPal, Square, Adyen
- **Banking APIs**: Plaid, Yodlee, MX
- **Data Providers**: Bloomberg, Alpha Vantage, IEX
- **Crypto APIs**: Coinbase, Binance, Kraken
- **Reference Documentation**: REFERENCE.md for integration examples

## Quick example

**Integrate Stripe payment gateway:**

```
1. Create Stripe account and get API keys
2. Install Stripe SDK
3. Implement payment intent creation
4. Handle payment confirmation
5. Set up webhook handlers
6. Test with test mode
7. Deploy to production with live keys
```

## Checklist before calling the skill done

- [ ] Fintech service account is created
- [ ] API keys/tokens are available
- [ ] API documentation is reviewed
- [ ] Authentication method is understood
- [ ] Security requirements are identified
- [ ] Rate limits are known
- [ ] Webhook endpoints are configured
- [ ] Test environment is available

---

# Fintech Integration Guide

## Overview

This guide covers essential fintech integration tasks including payment gateway integration, banking API integration, and financial data provider integration. For advanced integration patterns and real-world examples, see REFERENCE.md.

## Quick Start

```python
import stripe

# Initialize Stripe
stripe.api_key = 'sk_test_...'

# Create a payment intent
payment_intent = stripe.PaymentIntent.create(
    amount=••••,
    currency='usd',
    payment_method_types=['card']
)
```

## Payment Gateway Integration

### Stripe Integration
```python
import stripe

def create_payment_intent(amount, currency='usd'):
    """Create a payment intent"""
    payment_intent = stripe.PaymentIntent.create(
        amount=int(amount * 100),  # Convert to cents
        currency=currency,
        payment_method_types=['card'],
        metadata={'order_id': '••••'}
    )
    return payment_intent

def confirm_payment(payment_intent_id, payment_method_id):
    """Confirm a payment"""
    payment_intent = stripe.PaymentIntent.confirm(
        payment_intent_id,
        payment_method=payment_method_id
    )
    return payment_intent
```

### PayPal Integration
```python
import paypalrestsdk
from paypalrestsdk import Payment

def create_paypal_payment(amount, return_url, cancel_url):
    """Create PayPal payment"""
    payment = Payment({
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "transactions": [{
            "amount": {
                "total": str(amount),
                "currency": "USD"
            },
            "description": "Payment description"
        }],
        "redirect_urls": {
            "return_url": return_url,
            "cancel_url": cancel_url
        }
    })
    return payment.create()
```

## Banking API Integration

### Plaid Integration
```python
import plaid
from plaid.api import plaid_api

def create_link_token(client_id, secret, access_token):
    """Create Plaid Link token"""
    configuration = plaid.Configuration(
        host=plaid.Environment.Sandbox,
        api_key={'clientId': client_id, 'secret': secret}
    )
    api_client = plaid.ApiClient(configuration)
    client = plaid_api.PlaidApi(api_client)
    
    request = plaid.LinkTokenCreateRequest({
        'client_id': client_id,
        'secret': secret,
        'user': {'client_user_id': 'user-id'},
        'products': ['auth', 'transactions'],
        'client_name': 'My App',
        'language': 'en',
        'country_codes': ['US']
    })
    
    response = client.link_token_create(request)
    return response['link_token']
```

### Yodlee Integration
```python
def get_fast_link_token(app_id, user_id):
    """Get Yodlee FastLink token"""
    # Implementation depends on Yodlee API version
    # Typically involves calling the authentication endpoint
    pass
```

## Financial Data Providers

### Alpha Vantage Integration
```python
import requests

def get_stock_price(symbol, api_key):
    """Get stock price from Alpha Vantage"""
    url = f"https://www.alphavantage.co/query"
    params = {
        'function': 'GLOBAL_QUOTE',
        'symbol': symbol,
        'apikey': api_key
    }
    response = requests.get(url, params=params)
    return response.json()
```

### Bloomberg API Integration
```python
def get_bloomberg_data(ticker, fields):
    """Get data from Bloomberg API"""
    # Bloomberg API requires enterprise subscription
    # Implementation depends on specific Bloomberg service
    pass
```

## Webhook Handling

### Stripe Webhooks
```python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/webhook/stripe', methods=['POST'])
def stripe_webhook():
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        return jsonify({'error': 'Invalid payload'}), 400
    
    # Handle event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        handle_payment_success(payment_intent)
    
    return jsonify({'status': 'success'})
```

## Cryptocurrency APIs

### Coinbase API Integration
```python
import requests

def get_coinbase_price(base_currency, quote_currency):
    """Get cryptocurrency price from Coinbase"""
    url = f"https://api.coinbase.com/v2/exchange-rates"
    response = requests.get(url)
    data = response.json()
    return data['data']['rates'][quote_currency]
```

### Binance API Integration
```python
def get_binance_price(symbol):
    """Get cryptocurrency price from Binance"""
    url = f"https://api.binance.com/api/v3/ticker/price"
    params = {'symbol': symbol}
    response = requests.get(url, params=params)
    return response.json()
```

## Security Best Practices

### API Key Management
```python
import os
from dotenv import load_dotenv

load_dotenv()

# Never hardcode API keys
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY')
PLAID_CLIENT_ID = os.getenv('PLAID_CLIENT_ID')
PLAID_SECRET = os.getenv('PLAID_SECRET')
```

### Data Encryption
```python
from cryptography.fernet import Fernet

def encrypt_sensitive_data(data, key):
    """Encrypt sensitive data"""
    f = Fernet(key)
    encrypted_data = f.encrypt(data.encode())
    return encrypted_data

def decrypt_sensitive_data(encrypted_data, key):
    """Decrypt sensitive data"""
    f = Fernet(key)
    decrypted_data = f.decrypt(encrypted_data)
    return decrypted_data.decode()
```

## Error Handling

```python
import time
from functools import wraps

def retry_on_failure(max_retries=3, delay=1):
    """Retry decorator for API calls"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_retries - 1:
                        raise
                    time.sleep(delay * (attempt + 1))
        return wrapper
    return decorator

@retry_on_failure(max_retries=3, delay=1)
def call_api_with_retry(url, params):
    """Call API with retry logic"""
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()
```

## Quick Reference

| Service | Type | Authentication |
|---------|------|----------------|
| Stripe | Payment Gateway | API Key |
| PayPal | Payment Gateway | OAuth/Client ID |
| Plaid | Banking API | Secret Key |
| Alpha Vantage | Data Provider | API Key |
| Coinbase | Crypto API | API Key |

## Next Steps

- For advanced integration patterns, see REFERENCE.md
- For security compliance, review PCI DSS requirements
- For production deployment, consult service-specific documentation
