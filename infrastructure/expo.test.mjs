import assert from 'node:assert/strict'
import test from 'node:test'
import expoConfig from '../apps/expo-app/config.cjs'
import { publicExpoEnvironment } from './expo.mjs'
test('Expo cloud configuration preserves public identity and excludes secrets', () => {
    const env = {
        APP_ID: 'sample-app',
        APP_NAME: 'Sample',
        APP_URL: 'https://sample.test',
        EXPO_PROJECT_ID: 'project',
        BETTER_AUTH_SECRET: 'private',
        TURNSTILE_SECRET_KEY: 'private',
        RANDOM_SECRET: 'private',
    }
    const exported = publicExpoEnvironment(env)
    assert.equal(JSON.stringify(exported).includes('private'), false)
    assert.deepEqual(expoConfig(exported), expoConfig(env))
    assert.equal(expoConfig(exported).expo.ios.bundleIdentifier, 'com.example.sampleapp')
    assert.equal(expoConfig(exported).expo.extra.appName, 'Sample')
    assert.throws(() => expoConfig({ ...env, EXPO_VERSION_CODE: 'NaN' }), /build number/)
    assert.throws(() => expoConfig({ ...env, EXPO_APP_SCHEME: 'https' }), /scheme/)
    assert.throws(() => expoConfig({ ...env, EXPO_BUNDLE_ID: 'com.example.invalid_id' }), /reverse-DNS/)
    assert.throws(() => expoConfig({ ...env, EXPO_API_URL: 'https://user:password@example.test/api' }), /URL/)
})

test('cloud config loads the public snapshot without .env and upload rules exclude private files', async () => {
    const { mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync, rmSync } = await import('node:fs')
    const { tmpdir } = await import('node:os')
    const { join } = await import('node:path')
    const { spawnSync } = await import('node:child_process')
    const { prepareExpo } = await import('./expo.mjs')
    const root = mkdtempSync(join(tmpdir(), 'fullstack-expo-config-'))
    try {
        const env = {
            APP_ID: 'cloud-sample',
            APP_NAME: 'Cloud Sample',
            EXPO_API_URL: 'https://sample.test/api',
            BETTER_AUTH_SECRET: 'never-upload',
        }
        prepareExpo(root, env)
        const app = join(root, 'apps/expo-app')
        for (const file of ['config.cjs', 'app.config.js'])
            cpSync(new URL(`../apps/expo-app/${file}`, import.meta.url), join(app, file))
        const loaded = spawnSync(
            process.execPath,
            ['-e', "process.stdout.write(JSON.stringify(require('./app.config.js')))"],
            { cwd: app, env: { PATH: process.env.PATH }, encoding: 'utf8' },
        )
        assert.equal(loaded.status, 0, loaded.stderr)
        assert.equal(JSON.parse(loaded.stdout).expo.extra.apiUrl, env.EXPO_API_URL)
        assert.equal(JSON.parse(loaded.stdout).expo.extra.webUrl, 'https://sample.test')
        assert.equal(loaded.stdout.includes('never-upload'), false)
        cpSync(new URL('../.easignore', import.meta.url), join(root, '.easignore'))
        for (const file of [
            '.env',
            'backend/.env.local',
            'statsd/identity',
            'keys/signing.p12',
            'apps/expo-app/.expo/state.json',
        ]) {
            const { dirname } = await import('node:path')
            mkdirSync(dirname(join(root, file)), { recursive: true })
            writeFileSync(join(root, file), 'never-upload')
        }
        assert.equal(spawnSync('git', ['init', '-q'], { cwd: root }).status, 0)
        const files = spawnSync('git', ['ls-files', '--others', '--exclude-from=.easignore'], {
            cwd: root,
            encoding: 'utf8',
        })
        assert.equal(files.status, 0, files.stderr)
        const included = files.stdout.trim().split('\n')
        assert.ok(included.includes('apps/expo-app/.generated/public-env.json'))
        for (const file of included)
            assert.equal(readFileSync(join(root, file), 'utf8').includes('never-upload'), false, file)
    } finally {
        rmSync(root, { recursive: true, force: true })
    }
})
