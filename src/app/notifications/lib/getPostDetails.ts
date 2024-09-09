export async function getPostDetails(author: string, permlink: string): Promise<any> {
    const requestBody = {
        jsonrpc: "2.0",
        method: "bridge.get_post",
        params: {
            author,
            permlink,
        },
        id: 1,
    };

    try {
        const response = await fetch('https://api.deathwing.me', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log(data)
        if (data.result) {
            return data.result;
        } else {
            console.log("Unexpected data format:", data);
            return {};
        }
    } catch (error) {
        console.error('Error fetching post details:', error);
        throw error;
    }
}