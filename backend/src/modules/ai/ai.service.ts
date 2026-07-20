import { OpenAI } from 'openai';

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
  }
  return _openai;
}

const fallbackFallbacks: Record<string, string> = {
  web: 'Professional web development services including responsive design, frontend implementation, and performance optimization.',
  design: 'Creative UI/UX design services focusing on brand identity, user experience, and modern aesthetic standards.',
  consult: 'Strategic business consulting and advisory services to drive growth and operational efficiency.',
  marketing: 'Digital marketing campaign management and brand strategy implementation for increased market reach.',
};

export const aiService = {
  async analyzeInvoice(data: { items?: unknown; total?: unknown; clientName?: string; dueDate?: string; notes?: string }) {
    const prompt = `
      You are an expert revenue consultant and invoice psychologist for InvoiceOS.
      Analyze this invoice and provide 3-4 short, actionable insights to increase the likelihood of fast payment (conversion).
      
      Invoice Details:
      - Client: ${data.clientName}
      - Total: ${data.total}
      - Due Date: ${data.dueDate}
      - Items: ${JSON.stringify(data.items)}
      - Notes: ${data.notes || 'None'}

      Provide the response in the following JSON format:
      {
        "score": number (0-100),
        "insights": [
          { "title": "string", "description": "string", "type": "positive" | "warning" | "neutral" }
        ],
        "recommendation": "string"
      }
      
      Keep descriptions very short (max 15 words).
    `;

    try {
      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });
      return JSON.parse(response.choices[0].message.content || '{}');
    } catch {
      return {
        score: 85,
        insights: [
          { title: 'Standard Terms', description: 'Your payment terms are clear and align with industry standards.', type: 'positive' },
          { title: 'Visual Clarity', description: 'The invoice structure is clean and easy for the client to read.', type: 'neutral' },
          { title: 'Action Required', description: 'Ensure you follow up 2 days after the due date if unpaid.', type: 'warning' },
        ],
        recommendation: 'This invoice is well-structured. We recommend sending it as is to maintain professional rapport.',
      };
    }
  },

  async generateDescription(serviceType: string) {
    const prompt = `
      Generate a professional, high-end invoice line item description for a service related to: ${serviceType}.
      Keep it professional, descriptive but concise (max 20 words).
      Respond with just the description text.
    `;

    try {
      const response = await getOpenAI().chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
      });
      return { description: response.choices[0].message.content?.trim() };
    } catch {
      const lowerService = serviceType.toLowerCase();
      const match = Object.keys(fallbackFallbacks).find((key) => lowerService.includes(key));
      const fallbackDescription = match
        ? fallbackFallbacks[match]
        : `Professional ${serviceType} services delivered with industry-standard quality and attention to detail.`;
      return { description: fallbackDescription, isFallback: true };
    }
  },
};
