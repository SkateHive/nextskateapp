export async function GET() {
  // Hard-code the app URL to match the domain in the account association payload
  const appUrl = 'https://legacy.skatehive.app';

  const config = {
    accountAssociation: {
      header:
        'eyJmaWQiOjIwNzIxLCJ0eXBlIjoiYXV0aCIsImtleSI6IjB4MmQxODgyMzA0YzlBNkZhN0Y5ODdDMUI0MWM5ZkQ1RThDRjA1MTZlMiJ9',
      payload: 'eyJkb21haW4iOiJteS5za2F0ZWhpdmUuYXBwIn0',
      signature:
        'EpaOFcz8nqtvquUxvbncLXVjTtg5+q0Cww2qlPDQ0e5tqX5BTV1l5glt6N/ENOAjFBS0hRZib29XwgvJqPqGFhw=',
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