import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'

config({
    path: fileURLToPath(new URL('../.env', import.meta.url)),
    quiet: true,
})

process.env.NEXT_PUBLIC_APP_DOMAIN ||= process.env.APP_DOMAIN
process.env.NEXT_PUBLIC_APP_ID ||= process.env.APP_ID
process.env.NEXT_PUBLIC_APP_NAME ||= process.env.APP_NAME

const backendUrl = (process.env.BACKEND_INTERNAL_URL || 'http://localhost:4000').replace(/\/$/, '')

export default {
    output: 'standalone',
    outputFileTracingRoot: fileURLToPath(new URL('..', import.meta.url)),
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: `${backendUrl}/api/:path*`,
            },
        ]
    },
}
