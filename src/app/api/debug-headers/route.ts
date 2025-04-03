export async function GET(request: Request) {
    // Return the headers of the request for debugging
    const headers = Object.fromEntries(
        [...request.headers.entries()].map(([key, value]) => [key, value])
    );

    // Also check CSP by fetching your own site
    let siteHeaders = {};
    try {
        const siteResponse = await fetch('https://www.skatehive.app/');
        siteHeaders = Object.fromEntries(
            [...siteResponse.headers.entries()].map(([key, value]) => [key, value])
        );
    } catch (error) {
        console.error('Error fetching site headers:', error);
    }

    return Response.json({
        requestHeaders: headers,
        siteHeaders,
        message: 'Check the Content-Security-Policy and X-Frame-Options headers',
    });
}
