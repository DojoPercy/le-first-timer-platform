# Environment Variables Setup

## Arkesel SMS Integration

Add the following environment variables to your `.env` file:

```env
# Arkesel SMS Configuration
ARKESEL_API_KEY=your_api_key_here
ARKESEL_SENDER_ID=YourChurchName
```

## Getting Arkesel API Credentials

1. **Sign up for Arkesel**: Visit [https://arkesel.com](https://arkesel.com) and create an account
2. **Get API Key**: Navigate to Dashboard → API Settings → Generate API Key
3. **Set Sender ID**: Configure your sender ID (usually your church name)
4. **Add Credits**: Purchase SMS credits for bulk messaging

## Features Implemented

### ✅ PDF Report Generation
- **Professional PDF reports** with church branding
- **Executive summary** with key metrics
- **Top cells and inviters** analytics
- **Caller performance** tracking
- **Conversion rates** and trends
- **CSV export** option available

### ✅ Bulk SMS Messaging
- **Arkesel API integration** for reliable SMS delivery
- **10 message templates** for common communications
- **Template variables** for personalization
- **Bulk messaging** to multiple recipients
- **Message preview** before sending
- **SMS balance tracking**

### ✅ Message Templates
1. **Welcome Message** - New first timer welcome
2. **Sunday Reminder** - Weekly service reminder
3. **Follow-up Call** - Personal follow-up
4. **First Timer Visit Follow-up** - Return visit encouragement
5. **Mid-week Encouragement** - Spiritual encouragement
6. **Event Invitation** - Special church events
7. **Birthday Blessing** - Personal birthday messages
8. **Get Well Soon** - Sickness encouragement
9. **Cell Group Invitation** - Cell group integration
10. **New Convert Follow-up** - New believer support

## How to Use

### 1. Access Communication Hub
- Navigate to `/admin/communication` in your platform
- Or click "📱 Communication Hub" from admin dashboard

### 2. Send Bulk SMS
- **Select Template**: Choose from predefined templates
- **Fill Variables**: Personalize with names, times, etc.
- **Add Recipients**: Enter phone numbers (format: 233241234567)
- **Preview Message**: See personalized message before sending
- **Send SMS**: Click send to deliver to all recipients

### 3. Generate Reports
- **Set Period**: Define report period (e.g., "November 2024")
- **Choose Format**: PDF (recommended) or CSV
- **Select Content**: Include first timers, follow-ups, or both
- **Generate & Download**: Automatic download of formatted report

## Technical Implementation

### PDF Generation
- **jsPDF library** for PDF creation
- **Professional formatting** with church branding
- **Automatic data aggregation** from database
- **Executive summary** with insights
- **Charts and tables** for visual presentation

### SMS Integration
- **Arkesel REST API** integration
- **Template engine** for personalization
- **Error handling** and delivery tracking
- **Balance monitoring** for cost management
- **Bulk processing** for efficiency

### API Endpoints
- **POST /api/sms** - Send SMS messages
- **GET /api/sms** - Get templates and balance
- **POST /api/reports/generate** - Generate reports

## Security & Best Practices

### API Security
- **Environment variables** for sensitive keys
- **Request validation** with Zod schemas
- **Error handling** without exposing sensitive data
- **Rate limiting** considerations for SMS

### Data Privacy
- **Phone number validation** before sending
- **Template sanitization** for security
- **Audit logging** for message tracking
- **Consent management** for communications

## Cost Management

### SMS Costs
- **Monitor balance** through API integration
- **Track usage** per campaign
- **Optimize messages** for length efficiency
- **Schedule messages** for cost-effective timing

### Report Generation
- **On-demand generation** to save storage
- **Efficient data queries** to minimize load
- **Caching strategies** for repeated requests
- **Compression** for large reports

## Troubleshooting

### Common Issues
1. **SMS Not Sending**: Check API key and sender ID
2. **Invalid Phone Numbers**: Ensure format: 233XXXXXXXXX
3. **PDF Generation Errors**: Verify data availability
4. **Template Variables**: Fill all required variables

### Error Messages
- **"Arkesel API key not configured"**: Add environment variables
- **"Invalid phone number"**: Check phone number format
- **"Template not found"**: Select valid template
- **"Validation failed"**: Fill all required fields

## Next Steps

### Planned Enhancements
1. **Scheduled messaging** for automated reminders
2. **Message analytics** and delivery reports
3. **Advanced templates** with conditional logic
4. **Integration with contacts** from database
5. **Multi-language support** for diverse communities

### Integration Opportunities
- **WhatsApp Business API** for richer messaging
- **Email integration** for formal communications
- **Calendar integration** for automated reminders
- **Payment processing** for donation requests

This implementation significantly enhances your Telepastoring Department's communication capabilities while maintaining the platform's high standards for security, usability, and ministry effectiveness.
