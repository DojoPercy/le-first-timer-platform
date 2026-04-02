import { NextRequest, NextResponse } from 'next/server';
import { ArkeselSMS } from '@/lib/utils/arkesel-sms';
import { z } from 'zod';

const sendBulkSMSSchema = z.object({
  recipients: z.array(z.string().min(10, 'Invalid phone number')),
  message: z.string().min(1, 'Message is required'),
  template: z.object({
    name: z.string(),
    variables: z.record(z.string())
  }).optional(),
  schedule: z.string().optional(),
});

const sendSingleSMSSchema = z.object({
  to: z.string().min(10, 'Invalid phone number'),
  message: z.string().min(1, 'Message is required'),
  variables: z.record(z.string()).optional(),
});

const sendFromTemplateSchema = z.object({
  templateId: z.string(),
  recipients: z.array(z.object({
    phone: z.string().min(10, 'Invalid phone number'),
    variables: z.record(z.string())
  }))
});

// Initialize Arkesel with environment variables
const arkeselConfig = {
  apiKey: process.env.ARKESEL_API_KEY || '',
  senderId: process.env.ARKESEL_SENDER_ID || 'Church',
};

const smsService = new ArkeselSMS(arkeselConfig);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action;

    if (!arkeselConfig.apiKey) {
      return NextResponse.json(
        { error: 'Arkesel API key not configured' },
        { status: 500 }
      );
    }

    switch (action) {
      case 'send_bulk': {
        const validatedData = sendBulkSMSSchema.parse(body);
        
        console.log('API: Sending bulk SMS to recipients:', validatedData.recipients);
        console.log('API: Message content:', validatedData.message);
        
        const response = await smsService.sendBulkSMS({
          to: validatedData.recipients,
          message: validatedData.message,
          schedule: validatedData.schedule,
        });

        console.log('API: SMS response:', response);

        return NextResponse.json({
          success: true,
          data: response,
          message: `Bulk SMS sent to ${validatedData.recipients.length} recipients`
        });
      }

      case 'send_single': {
        const validatedData = sendSingleSMSSchema.parse(body);
        
        const response = await smsService.sendSingleSMS(
          validatedData.to,
          validatedData.message
        );

        return NextResponse.json({
          success: true,
          data: response,
          message: 'SMS sent successfully'
        });
      }

      case 'send_from_template': {
        const validatedData = sendFromTemplateSchema.parse(body);
        
        // For now, use default templates. In a real app, you'd fetch from database
        const { defaultMessageTemplates } = await import('@/lib/utils/arkesel-sms');
        const template = defaultMessageTemplates.find(t => t.name === validatedData.templateId);
        
        if (!template) {
          return NextResponse.json(
            { error: 'Template not found' },
            { status: 404 }
          );
        }

        const responses = await smsService.sendFromTemplate(
          { ...template, id: validatedData.templateId, created_at: '', updated_at: '' },
          validatedData.recipients
        );

        return NextResponse.json({
          success: true,
          data: responses,
          message: `Template messages sent to ${validatedData.recipients.length} recipients`
        });
      }

      case 'get_balance': {
        const response = await smsService.getAccountBalance();
        
        return NextResponse.json({
          success: true,
          data: response,
          message: 'Account balance retrieved'
        });
      }

      case 'get_status': {
        const { messageId } = body;
        
        if (!messageId) {
          return NextResponse.json(
            { error: 'Message ID is required' },
            { status: 400 }
          );
        }

        const response = await smsService.getDeliveryStatus(messageId);
        
        return NextResponse.json({
          success: true,
          data: response,
          message: 'Message status retrieved'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('SMS API Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint for retrieving templates and balance
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (!arkeselConfig.apiKey) {
      return NextResponse.json(
        { error: 'Arkesel API key not configured' },
        { status: 500 }
      );
    }

    switch (action) {
      case 'templates': {
        const { defaultMessageTemplates } = await import('@/lib/utils/arkesel-sms');
        
        return NextResponse.json({
          success: true,
          data: defaultMessageTemplates,
          message: 'Templates retrieved successfully'
        });
      }

      case 'balance': {
        const response = await smsService.getAccountBalance();
        
        return NextResponse.json({
          success: true,
          data: response,
          message: 'Account balance retrieved'
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('SMS API Error:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
