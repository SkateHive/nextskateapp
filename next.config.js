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
                      value: "frame-ancestors 'self' https://www.nounspace.com https://*.preview.ourzora.com https://*.preview.zora.co https://bridge.zora.energy https://testnet.zora.co https://zora.co https://privy.zora.co;",
                  },
              ],
          },
      ];
  },
};