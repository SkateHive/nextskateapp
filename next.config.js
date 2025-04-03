/** @type {import('next').NextConfig} */
module.exports = {
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
