const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Performance optimizations
    experimental: {
        optimizePackageImports: [
            '@chakra-ui/react', 
            '@hiveio/dhive',
            'framer-motion',
            'react-icons',
            'lodash'
        ],
        turbo: {
            rules: {
                '*.svg': {
                    loaders: ['@svgr/webpack'],
                    as: '*.js',
                },
            },
        },
    },
    
    // Webpack optimizations
    webpack: (config, { dev, isServer }) => {
        // Production optimizations
        if (!dev && !isServer) {
            // Enable tree shaking
            config.optimization.usedExports = true;
            config.optimization.sideEffects = false;
            
            // Optimize chunks
            config.optimization.splitChunks = {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                        priority: 10,
                    },
                    common: {
                        name: 'common',
                        chunks: 'all',
                        priority: 5,
                        reuseExistingChunk: true,
                        enforce: true,
                    },
                    chakra: {
                        test: /[\\/]node_modules[\\/]@chakra-ui[\\/]/,
                        name: 'chakra',
                        chunks: 'all',
                        priority: 15,
                    },
                    hive: {
                        test: /[\\/]node_modules[\\/]@hiveio[\\/]/,
                        name: 'hive',
                        chunks: 'all',
                        priority: 15,
                    },
                },
            };
        }
        
        return config;
    },
    
    // Enable compression
    compress: true,
    
    // Optimize output
    poweredByHeader: false,
    reactStrictMode: true,
    
    images: {
        domains: [
            'gateway.pinata.cloud',
            'ipfs.skatehive.app',
            'hive.skatehive.app',
            'images.hive.blog',
            'files.peakd.com',
            'images.ecency.com',
            'ecency.com',
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
                port: '',
                pathname: '/**',
            },
        ],
        // Optimize image loading
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
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
                    // Add caching headers
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },
};

module.exports = withBundleAnalyzer(nextConfig);
