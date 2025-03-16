/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: [
            'lh3.googleusercontent.com', // Google認証用
            'avatars.githubusercontent.com' // GitHub認証用
        ],
    },
};

module.exports = nextConfig; 