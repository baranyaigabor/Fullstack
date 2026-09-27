import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import expoConfig from '../apps/expo-app/config.cjs'
import { loadEnvironment } from './config.mjs'
import { pnpmCommand } from './process.mjs'

const publicKeys = [
    'APP_ID',
    'APP_NAME',
    'APP_VERSION',
    'APP_URL',
    'NATIVE_API_URL',
    'EXPO_API_URL',
    'EXPO_APP_SCHEME',
    'EXPO_BUNDLE_ID',
    'EXPO_PROJECT_ID',
    'EXPO_VERSION_CODE',
]
export function publicExpoEnvironment(source) {
    return Object.fromEntries(publicKeys.filter((key) => source[key]).map((key) => [key, source[key]]))
}
export function prepareExpo(root, source) {
    const env = publicExpoEnvironment(source)
    expoConfig(env)
    const directory = resolve(root, 'apps/expo-app/.generated')
    mkdirSync(directory, { recursive: true })
    writeFileSync(resolve(directory, 'public-env.json'), `${JSON.stringify(env, null, 4)}\n`)
    return env
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const root = fileURLToPath(new URL('../', import.meta.url))
    loadEnvironment(resolve(root, process.env.ENV_FILE || '.env'))
    const [command = 'prepare', ...args] = process.argv.slice(2)
    if (!['prepare', 'android', 'ios'].includes(command)) throw new Error('Use prepare, android, or ios')
    const env = prepareExpo(root, process.env)
    if (command !== 'prepare') {
        if (!env.EXPO_PROJECT_ID) throw new Error('Set EXPO_PROJECT_ID in .env before submitting an EAS build')
        const invocation = pnpmCommand(['dlx', 'eas-cli@24.8.0', 'build', '--platform', command, ...args])
        const result = spawnSync(invocation.command, invocation.args, {
            cwd: resolve(root, 'apps/expo-app'),
            stdio: 'inherit',
            env: process.env,
        })
        if (result.error) throw result.error
        process.exitCode = result.status ?? 1
    } else console.log('Prepared public Expo configuration from .env (no backend secrets).')
}
