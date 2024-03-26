import { KeychainSDK } from "keychain-sdk";



export default async function sendHive(amount: string, toAddress: string, hiveMemo: string, username: string): Promise<void> {
  try {
    // Parse the amount to a float with 3 decimal places
    const parsedAmount = parseFloat(amount).toFixed(3);

    // Initialize the KeychainSDK
    const keychain = new KeychainSDK(window);

    // Define the transfer parameters
    const transferParams = {
      data: {
        username: username,
        to: toAddress,
        amount: parsedAmount, // Use the parsed amount with 3 decimal places
        memo: hiveMemo,
        enforce: false,
        currency: "HIVE",
      },
    };

    // Perform the transfer using Keychain's transfer method
    const transfer = await keychain.transfer(transferParams.data);

    // Check if the transfer was successful and handle the response
    console.log({ transfer });
    // You can handle success and show a confirmation message to the user
  } catch (error) {
    // Handle errors, such as if Keychain is not available, the user denies the transfer, etc.
    console.error("Transfer error:", error);
    // You can display an error message to the user
  }
};