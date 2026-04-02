# Arkesel SMS API Debugging Guide

## Common Issues and Solutions

### 1. "Unprocessable Content" Error

This error typically occurs when the API request format doesn't match Arkesel's expected format.

#### **Check Your Environment Variables**
```env
ARKESEL_API_KEY=your_actual_api_key_here
ARKESEL_SENDER_ID=YourChurchName
```

#### **Verify API Key Format**
- Arkesel API keys are typically 32+ characters long
- Make sure there are no spaces or special characters
- Get your API key from: Arkesel Dashboard → Settings → API Keys

#### **Check Sender ID**
- Sender ID must be pre-approved by Arkesel
- Usually 6-11 characters, alphanumeric only
- No special characters allowed

### 2. Phone Number Format

Arkesel expects phone numbers in this format:
- **Ghana**: `233241234567` (country code + number, no + sign)
- **Nigeria**: `2348012345678`
- **General**: Country code + number without + or spaces

#### **Common Format Issues**
❌ Wrong formats:
- `+233241234567` (has + sign)
- `233 24 123 4567` (has spaces)
- `0541234567` (missing country code)

✅ Correct format:
- `233241234567`

### 3. API Endpoint Issues

The correct Arkesel API endpoint is:
```
https://sms.arkesel.com/api/v2/sms/send
```

### 4. Request Body Format

Arkesel expects this JSON format:
```json
{
  "sender": "YourChurchName",
  "message": "Your message here",
  "recipients": ["233241234567", "233242345678"]
}
```

## Debugging Steps

### Step 1: Test API Key Manually

```bash
curl -X POST https://sms.arkesel.com/api/v2/sms/send \
  -H "Content-Type: application/json" \
  -H "api-key: YOUR_API_KEY" \
  -d '{
    "sender": "TestSender",
    "message": "Test message",
    "recipients": ["233241234567"]
  }'
```

### Step 2: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Network tab
3. Try sending an SMS
4. Look for the `/api/sms` request
5. Check the request payload and response

### Step 3: Check Server Logs

```bash
# If running locally
npm run dev

# Check console output for:
# - "API: Sending bulk SMS to recipients:"
# - "API: Message content:"
# - "API: SMS response:"
# - "Sending SMS with data:"
```

### Step 4: Verify Account Status

1. Login to your Arkesel dashboard
2. Check your SMS balance
3. Verify your sender ID is approved
4. Check if your account is active

## Quick Fix Checklist

- [ ] API key is correctly set in `.env` file
- [ ] Sender ID is approved and correctly spelled
- [ ] Phone numbers are in correct format (233XXXXXXXXX)
- [ ] Account has sufficient SMS credits
- [ ] API key has proper permissions
- [ ] No firewall blocking the requests

## Testing with Minimal Data

Try sending a test with just one recipient:

```javascript
// In browser console
fetch('/api/sms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'send_single',
    to: '233241234567', // Replace with test number
    message: 'Test message from Telepastoring Platform'
  })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
```

## Alternative SMS Providers

If Arkesel continues to have issues, consider these alternatives:

1. **Twilio** - More reliable, global coverage
2. **Infobip** - Good for Africa
3. **MessageBird** - Competitive pricing
4. **Africa's Talking** - Kenya-based, good for Africa

The code can be easily adapted to work with any of these providers.

## Support

If you're still having issues:

1. **Arkesel Support**: support@arkesel.com
2. **Check their documentation**: https://arkesel.com/docs
3. **API Status**: Check if Arkesel services are operational

Remember to never expose your API key in client-side code or commit it to version control!
