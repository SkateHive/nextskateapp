// src/lib/improveWithAi.ts
import OpenAI from 'openai';

const improveWithAi = async (body: string): Promise<string> => {
    const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
        dangerouslyAllowBrowser: true,
    });

    const prompt = `Write this better, not too formal though, feel free to use skateboarding slangs but careful not to sound corny: ${body}`;
    const response = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4',
    });
    const summary = response.choices[0]?.message?.content || 'Our devs forgot to pay the AI bill';
    return summary;
};

export default improveWithAi;
