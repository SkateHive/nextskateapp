import getSummary from '@/lib/getSummaryAI';
import { useEffect, useState } from 'react';

const useSummary = (body: string) => {
    const [AiSummary, setAiSummary] = useState("");

    useEffect(() => {
        const summarizeBlog = async () => {
            const summary = await getSummary(body);
            setAiSummary(summary);
        };

        if (body) {
            summarizeBlog();
        }
    }, [body]);

    return AiSummary;
};

export default useSummary;
