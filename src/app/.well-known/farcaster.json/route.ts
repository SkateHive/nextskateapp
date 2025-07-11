export async function GET() {
  // Hard-code the app URL to match the domain in the account association payload
  const appUrl = 'https://legacy.skatehive.app';

  const config = {
    accountAssociation: {
      header:
        'eyJmaWQiOjIwNzIxLCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4MzVmNzA2QjY5NGFjZjllNjYxMGM3NjhiMjFDRjdiNWI4QWZhMzQ3RSJ9',
      payload: 'eyJkb21haW4iOiJza2F0ZWhpdmUuYXBwIn0',
      signature:
        'MHhhNDdlYjdmNDU0NWNlYzJmOGNhY2YyOGI0MDc2NjRjMDU1NWViMDBkMWZjZjQ3YTc0ODhlOTg4NWZiMmJjZDczMjA5Mjk0NDcyZTkxOTMyNTMyMzFlYjU1NzBkNzM1YTk2ZTEzZGEzNWQyZjM5MDU5YTY4MDliZTg5MTc4YTc2OTFi',
    },
    frame: {
      version: '1',
      name: 'SkateHive',
      buttonTitle: 'Open post',
      homeUrl: appUrl,
      imageUrl: `${appUrl}/opengraph-image`,
      webhookUrl: `${appUrl}/api/webhook`,
      iconUrl: `https://ipfs.skatehive.app/ipfs/QmXTZqirogp735AaPFcpzAjmwS57mPYsJhktJMuRuSV5Rm`,
      splashImageUrl: `https://ipfs.skatehive.app/ipfs/QmXTZqirogp735AaPFcpzAjmwS57mPYsJhktJMuRuSV5Rm`,
      splashBackgroundColor: '#000000',
    },
  };

  return Response.json(config);
}