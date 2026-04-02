export interface ArkeselConfig {
  apiKey: string;
  senderId: string;
}

export interface SMSMessage {
  to: string[];
  message: string;
  schedule?: string; // ISO date string for scheduled sending
}

export interface SMSResponse {
  status: string;
  message: string;
  data?: {
    messageId: string;
    status: string;
    cost: number;
  };
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: 'welcome' | 'reminder' | 'followup' | 'custom';
  content: string;
  variables: string[]; // Array of variable names like {{name}}, {{service_time}}
  created_at: string;
  updated_at: string;
}

export class ArkeselSMS {
  private config: ArkeselConfig;
  private baseUrl = 'https://sms.arkesel.com/api/v2/sms';

  constructor(config: ArkeselConfig) {
    this.config = config;
  }

  private async makeRequest(endpoint: string, data: any): Promise<SMSResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.config.apiKey,
        },
        body: JSON.stringify(data),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        console.error('Arkesel API Error Response:', responseText);
        throw new Error(`Arkesel API error: ${response.status} ${response.statusText}`);
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse Arkesel response:', responseText);
        throw new Error('Invalid response from Arkesel API');
      }

      return result;
    } catch (error) {
      console.error('Arkesel SMS Error:', error);
      throw error;
    }
  }

  async sendBulkSMS(message: SMSMessage): Promise<SMSResponse> {
    // Arkesel API format for bulk SMS
    const data = {
      sender: this.config.senderId,
      message: message.message,
      recipients: message.to,
    };

    console.log('Sending SMS with data:', JSON.stringify(data, null, 2));
    
    return this.makeRequest('/send', data);
  }

  async sendSingleSMS(to: string, message: string): Promise<SMSResponse> {
    return this.sendBulkSMS({ to: [to], message });
  }

  // Template-based messaging
  async sendFromTemplate(
    template: MessageTemplate,
    recipients: Array<{ phone: string; variables: Record<string, string> }>
  ): Promise<SMSResponse[]> {
    const responses: SMSResponse[] = [];

    for (const recipient of recipients) {
      let personalizedMessage = template.content;
      
      // Replace template variables
      template.variables.forEach(variable => {
        const value = recipient.variables[variable.replace(/[{}]/g, '')] || '';
        personalizedMessage = personalizedMessage.replace(
          new RegExp(`{{${variable}}}`, 'g'),
          value
        );
      });

      try {
        const response = await this.sendSingleSMS(recipient.phone, personalizedMessage);
        responses.push(response);
      } catch (error) {
        responses.push({
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return responses;
  }

  async getDeliveryStatus(messageId: string): Promise<SMSResponse> {
    return this.makeRequest(`/status/${messageId}`, {});
  }

  async getAccountBalance(): Promise<SMSResponse> {
    return this.makeRequest('/balance', {});
  }
}

// Predefined message templates for Telepastoring Department
export const defaultMessageTemplates: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Welcome Message',
    type: 'welcome',
    content: 'Welcome {{name}} to our church family! We were blessed to have you worship with us. For any questions, call {{caller_phone}}. Looking forward to seeing you this Sunday at {{service_time}}!',
    variables: ['name', 'caller_phone', 'service_time']
  },
  {
    name: 'Sunday Reminder',
    type: 'reminder',
    content: 'Hi {{name}}, this is {{caller_name}} from the church. Just a friendly reminder about our service tomorrow at {{service_time}}. We\'re looking forward to seeing you! Need transport? Call {{transport_phone}}.',
    variables: ['name', 'caller_name', 'service_time', 'transport_phone']
  },
  {
    name: 'Follow-up Call',
    type: 'followup',
    content: 'Hi {{name}}, this is {{caller_name}} from the church. I hope you\'re doing well. I wanted to check in and see how you\'re enjoying our services. Is there anything we can pray for or help you with?',
    variables: ['name', 'caller_name']
  },
  {
    name: 'First Timer Visit Follow-up',
    type: 'followup',
    content: 'Hi {{name}}, thank you for visiting us again! It\'s wonderful to see you. We\'d love to help you get more connected. Have you thought about joining one of our cell groups? Call me at {{caller_phone}} to learn more.',
    variables: ['name', 'caller_phone']
  },
  {
    name: 'Mid-week Encouragement',
    type: 'custom',
    content: 'Hi {{name}}, {{caller_name}} here. Just wanted to send some encouragement your way this week. Remember: "The Lord is my shepherd; I shall not want." Hope you have a blessed week!',
    variables: ['name', 'caller_name']
  },
  {
    name: 'Event Invitation',
    type: 'custom',
    content: 'Hi {{name}}, we\'re having a special {{event_name}} on {{event_date}} at {{event_time}}. We\'d love for you to join us! It\'s going to be a wonderful time of {{event_description}}. Call {{caller_phone}} for more details.',
    variables: ['name', 'event_name', 'event_date', 'event_time', 'event_description', 'caller_phone']
  },
  {
    name: 'Birthday Blessing',
    type: 'custom',
    content: 'Happy Birthday {{name}}! 🎉 The Telepastoring Department celebrates you today. May God\'s blessings overflow in your life. We\'re grateful you\'re part of our church family!',
    variables: ['name']
  },
  {
    name: 'Get Well Soon',
    type: 'custom',
    content: 'Hi {{name}}, we heard you\'re not feeling well. Just wanted to let you know we\'re praying for your speedy recovery. {{church_name}} loves you and we can\'t wait to have you back with us!',
    variables: ['name', 'church_name']
  },
  {
    name: 'Cell Group Invitation',
    type: 'custom',
    content: 'Hi {{name}}, {{caller_name}} here. I\'d like to invite you to join our {{cell_name}} cell group. We meet every {{cell_day}} at {{cell_time}} at {{cell_location}}. It\'s a great way to connect and grow in faith. Interested?',
    variables: ['name', 'caller_name', 'cell_name', 'cell_day', 'cell_time', 'cell_location']
  },
  {
    name: 'New Convert Follow-up',
    type: 'followup',
    content: 'Hi {{name}}, praise God for your decision to follow Christ! {{caller_name}} here from the Telepastoring Department. I\'d love to help you take your next steps in faith. Can we meet briefly this week? Call me at {{caller_phone}}.',
    variables: ['name', 'caller_name', 'caller_phone']
  }
];

// Utility functions for template management
export const replaceTemplateVariables = (
  template: string,
  variables: Record<string, string>
): string => {
  let result = template;
  
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || `[${key}]`);
  });
  
  return result;
};

export const extractTemplateVariables = (template: string): string[] => {
  const matches = template.match(/{{([^}]+)}}/g);
  return matches ? matches.map(match => match.replace(/[{}]/g, '')) : [];
};

export const validateTemplateVariables = (
  template: MessageTemplate,
  providedVariables: Record<string, string>
): { isValid: boolean; missing: string[] } => {
  const missing = template.variables.filter(
    variable => !providedVariables[variable]
  );
  
  return {
    isValid: missing.length === 0,
    missing
  };
};
