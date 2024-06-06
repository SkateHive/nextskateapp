import OpenAI from 'openai';

const getSummary = async (body: string) => {
    const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
        dangerouslyAllowBrowser: true,
    });

    const prompt = `Summarize this content into a tweet-friendly sentence in up to 70 caracters. Exclude emojis and special characters that might conflict with URLs. Omit any 'Support Skatehive' sections. dont use emojis Content, dont use hashtags, ignore links: ${body}`;
    const response = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-3.5-turbo',
    });
    const summary = response.choices[0]?.message?.content || 'Check my new Post on Skatehive';
    return summary;
};


export default getSummary;
