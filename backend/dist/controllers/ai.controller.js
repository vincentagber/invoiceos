"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDescription = exports.analyzeInvoice = void 0;
const openai_1 = require("openai");
const openai = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const analyzeInvoice = async (req, res, next) => {
    try {
        const { items, total, clientName, dueDate, notes } = req.body;
        const prompt = `
      You are an expert revenue consultant and invoice psychologist for InvoiceOS.
      Analyze this invoice and provide 3-4 short, actionable insights to increase the likelihood of fast payment (conversion).
      
      Invoice Details:
      - Client: ${clientName}
      - Total: ${total}
      - Due Date: ${dueDate}
      - Items: ${JSON.stringify(items)}
      - Notes: ${notes || 'None'}

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
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" }
        });
        const result = JSON.parse(response.choices[0].message.content || '{}');
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.analyzeInvoice = analyzeInvoice;
const generateDescription = async (req, res, next) => {
    try {
        const { serviceType } = req.body;
        const prompt = `
      Generate a professional, high-end invoice line item description for a service related to: ${serviceType}.
      Keep it professional, descriptive but concise (max 20 words).
      Respond with just the description text.
    `;
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
        });
        res.json({ description: response.choices[0].message.content?.trim() });
    }
    catch (error) {
        next(error);
    }
};
exports.generateDescription = generateDescription;
