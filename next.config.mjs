/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	async headers() {
		return [
			{
				source: "/api/seats",
				headers: [
					{
						key: "Cache-Control",
						value: "no-store, max-age=0",
					},
					{
						key: "CDN-Cache-Control",
						value: "no-store",
					},
					{
						key: "Vercel-CDN-Cache-Control",
						value: "no-store",
					},
				],
			},
		];
	},
};

export default nextConfig;
