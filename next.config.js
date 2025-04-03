/** @type {import('next').NextConfig} */
module.exports = {
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        // Override with a very permissive policy
                        value: "default-src * 'unsafe-inline' 'unsafe-eval'; frame-ancestors * 'self';",
                    },
                    {
                        key: 'X-Frame-Options',
                        // Remove this header which can conflict with frame embedding
                        value: 'ALLOWALL',
                    },
                ],
            },
        ];
    },
    // Ensure images from external sources can be optimized
    images: {
        domains: ['images.hive.blog', 'cdn.discordapp.com', 'ipfs.skatehive.app'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
};
