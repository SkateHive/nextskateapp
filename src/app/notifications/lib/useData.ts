// Assuming HiveClient is a wrapper around fetch or another HTTP client library.
import HiveClient from "@/lib/hiveclient";

/**
 * Fetches user notifications from the Hive blockchain using the bridge API.
 * @param {string} username - The Hive account username to fetch notifications for.
 * @param {number} threshold - The number of recent actions to retrieve.
 * @returns {Promise<any>} A promise that resolves with the notifications.
 */
export async function getUserNotifications(account: string, limit: number = 100): Promise<any> {
  const requestBody = {
    jsonrpc: "2.0",
    method: "bridge.account_notifications",
    params: {
      account,
      limit
    },
    id: 1
  };

  try {
    const response = await fetch('https://api.hive.blog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();


    return data.result; // Make sure this matches the actual structure of the response
  } catch (error) {
    console.error('Error fetching account notifications:', error);
    throw error;
  }
}
