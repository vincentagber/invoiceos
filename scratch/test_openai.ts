import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

async function testKey() {
    const key = process.env.OPENAI_API_KEY;
    console.log('Testing Key:', key?.substring(0, 15) + '...');
    
    const openai = new OpenAI({ apiKey: key });
    
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: "Say hello" }],
            max_tokens: 10
        });
        console.log('Success:', response.choices[0].message.content);
    } catch (error: any) {
        console.error('Failed:', error.message);
    }
}

testKey();
