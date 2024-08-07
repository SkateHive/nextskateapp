/** @type {import('next').NextConfig} */
module.exports = {
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'ALLOW-FROM https://www.nounspace.com/',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: "frame-ancestors 'self' https://www.nounspace.com;",
                    },
                ],
            },
        ];
    },
};
