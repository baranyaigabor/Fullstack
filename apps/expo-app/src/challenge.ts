import { Platform } from 'react-native'
import * as Crypto from 'expo-crypto'
import * as WebBrowser from 'expo-web-browser'
import Constants from 'expo-constants'
import { challengeReturnUrl, challengeToken, type PublicConfig } from '@fullstack-starter/shared'
import { webUrl } from './auth-client'

WebBrowser.maybeCompleteAuthSession()

export async function captchaHeaders(config: PublicConfig) {
    if (!config.captcha?.enabled) return {}
    const state = Crypto.randomUUID()
    const returnUrl =
        Platform.OS === 'web' ? `${window.location.origin}/` : `${Constants.expoConfig?.extra?.scheme}://captcha`
    challengeReturnUrl(returnUrl, config.captcha.expoReturnUrls, state)
    const url = new URL('/native/challenge', webUrl)
    url.searchParams.set('returnTo', returnUrl)
    url.searchParams.set('state', state)
    const result = await WebBrowser.openAuthSessionAsync(url.href, returnUrl)
    if (result.type !== 'success') throw new Error('Security check cancelled. Please try again.')
    return { 'x-captcha-response': challengeToken(result.url, returnUrl, state) }
}
