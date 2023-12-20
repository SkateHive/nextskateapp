"use server"

export async function getData(username: string, threshold: number) {
  const requestBody = {
    jsonrpc: "2.0",
    method: "bridge.account_notifications",
    params: {
      account: username,
      limit: threshold + 10,
    },
    id: new Date().getTime(),
  }

  console.log("dooing requests")

  // Make the Fetch request
  const response = await fetch("https://api.hive.blog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  })

  console.log("dooing response")
  return await response.json()
}
