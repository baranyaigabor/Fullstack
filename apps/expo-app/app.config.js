/* eslint-disable @typescript-eslint/no-require-imports -- Expo loads app.config.js as CommonJS. */
const { existsSync, readFileSync } = require('node:fs')
const { resolve } = require('node:path')
const expoConfig = require('./config.cjs')

const generated = resolve(__dirname, '.generated/public-env.json')
const rootEnv = resolve(__dirname, '../../.env')
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv)
module.exports = expoConfig({
    ...(existsSync(generated) ? JSON.parse(readFileSync(generated, 'utf8')) : {}),
    ...process.env,
})
