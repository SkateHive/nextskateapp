export async function getUserNotifications(account: string, limit: number = 100): Promise<any> {
  const requestBody = {
    jsonrpc: "2.0",
    method: "bridge.account_notifications",
    params: {
      account,
      limit,
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
    console.log("DATA: ", data)
    if (Array.isArray(data.result)) {
      return data.result;
    } else {
      console.log("Unexpected data format:", data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching account notifications:', error);
    throw error;
  }
}
