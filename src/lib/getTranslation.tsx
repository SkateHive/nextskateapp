import OpenAI from 'openai';

const getTranslation = async (body: string, language: string) => {
    const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
        dangerouslyAllowBrowser: true,
    });

    const prompt = `Translate this Text to ${language}: ${body}`;
    const response = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-4o-mini',
    });
    const summary = response.choices[0]?.message?.content || 'Ops, our devs forgot to pay the AI bill, try again later. if you are the DEV, check your .env.local variables';
    return summary;
};


export default getTranslation;