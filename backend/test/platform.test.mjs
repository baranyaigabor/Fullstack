import 'reflect-metadata'
import assert from 'node:assert/strict'
import test from 'node:test'
import { applicationOrigin, trustedOrigins } from '@fullstack-starter/shared'
import { RateLimitGuard } from '../dist/rate-limit/rate-limit.guard.js'

test('auth and CORS share exact configurable origins', () => {
    const env = {
        APP_URL: 'http://localhost:18080',
        TRUSTED_ORIGINS: 'http://localhost:13000,http://localhost:18080',
    }
    assert.equal(applicationOrigin(env), 'http://localhost:18080')
    assert.deepEqual(trustedOrigins(env), ['http://localhost:18080', 'http://localhost:13000'])
})
test('health probes do not touch Redis or consume quotas', async () => {
    const guard = new RateLimitGuard({
        consume() {
            throw new Error('Redis unavailable')
        },
    })
    for (const path of ['/api/health', '/api/health/live']) {
        const context = {
            getType: () => 'http',
            switchToHttp: () => ({
                getRequest: () => ({ method: 'GET', path }),
                getResponse: () => ({}),
            }),
        }
        assert.equal(await guard.canActivate(context), true)
    }
})
test('ordinary routes still enforce rate limits', async () => {
    const guard = new RateLimitGuard({
        consume: async () => ({
            allowed: false,
            limit: 1,
            count: 1,
            resetSeconds: 60,
        }),
    })
    const headers = {}
    const context = {
        getType: () => 'http',
        switchToHttp: () => ({
            getRequest: () => ({
                method: 'GET',
                path: '/api/config',
                ip: '127.0.0.1',
            }),
            getResponse: () => ({
                setHeader: (k, v) => {
                    headers[k] = v
                },
            }),
        }),
    }
    await assert.rejects(() => guard.canActivate(context), /Rate limit exceeded/)
    assert.equal(headers['Retry-After'], '60')
})
