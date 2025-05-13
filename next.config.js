/** @type {import('next').NextConfig} */
module.exports = {
    images: {
        domains: [
            'gateway.pinata.cloud',
            'ipfs.skatehive.app',
            'hive.skatehive.app',
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
                port: '',
                pathname: '/**',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: "frame-ancestors *;",
                    },
                ],
            },
        ];
    },
};
