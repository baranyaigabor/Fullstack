import { expoClient } from '@better-auth/expo/client'
import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'
import { createAuthClient } from 'better-auth/react'

const extra = Constants.expoConfig?.extra
if (!extra || typeof extra.apiUrl !== 'string' || typeof extra.scheme !== 'string' || typeof extra.appId !== 'string')
    throw new Error('Expo public configuration is missing. Restart Expo after setting the project environment.')

export const apiUrl = extra.apiUrl as string
export const webUrl = extra.webUrl as string
export const authClient = createAuthClient({
    baseURL: `${apiUrl}/auth`,
    plugins: [
        // @ts-expect-error Matching Better Auth 1.6.26 packages disagree on fetch generics.
        expoClient({
            scheme: extra.scheme as string,
            storagePrefix: extra.appId as string,
            cookiePrefix: extra.appId as string,
            storage: SecureStore,
        }),
    ],
})
