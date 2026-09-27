import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import Constants from 'expo-constants'
import { PublicConfigSchema, type PublicConfig } from '@fullstack-starter/shared'
import { captchaHeaders } from './src/challenge'
import {
    ActivityIndicator,
    Linking,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native'
import { apiUrl, authClient, webUrl } from './src/auth-client'

export default function App() {
    const { data: session, isPending } = authClient.useSession()
    const [register, setRegister] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    const [config, setConfig] = useState<PublicConfig | null>(null)
    const [configAttempt, setConfigAttempt] = useState(0)
    useEffect(() => {
        const controller = new AbortController()
        fetch(`${apiUrl}/config`, { signal: controller.signal })
            .then(async (response) => {
                if (!response.ok) throw new Error('Configuration unavailable')
                return PublicConfigSchema.parse(await response.json())
            })
            .then((value) => {
                setConfig(value)
                setError('')
            })
            .catch(() => {
                if (!controller.signal.aborted)
                    setError('Could not load app configuration. Check your connection and retry.')
            })
        return () => controller.abort()
    }, [configAttempt])

    async function submit() {
        setBusy(true)
        setError('')
        try {
            if (!config) throw new Error('App configuration is unavailable')
            const fetchOptions = { headers: await captchaHeaders(config) }
            const result = register
                ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password, fetchOptions })
                : await authClient.signIn.email({ email: email.trim(), password, fetchOptions })
            if (result.error) setError(result.error.message || 'Authentication failed')
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : 'Could not reach the API. Check EXPO_API_URL and your network.',
            )
        } finally {
            setBusy(false)
        }
    }

    async function signOut() {
        setBusy(true)
        setError('')
        try {
            const result = await authClient.signOut()
            if (result.error) setError(result.error.message || 'Could not sign out')
        } catch {
            setError('Could not reach the API')
        } finally {
            setBusy(false)
        }
    }

    return (
        <SafeAreaView style={styles.page}>
            <StatusBar style='auto' />
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
                <Text style={styles.eyebrow}>{Constants.expoConfig?.name || 'App'}</Text>
                <Text style={styles.title}>
                    {session ? 'You are signed in' : register ? 'Create an account' : 'Welcome back'}
                </Text>
                <Text style={styles.description}>
                    {session
                        ? 'Your Expo client is connected to the same backend as the web app.'
                        : 'Use your web account on iOS, Android, and web.'}
                </Text>
                {isPending ? (
                    <ActivityIndicator accessibilityLabel='Loading session' />
                ) : session ? (
                    <View style={styles.card}>
                        <Text style={styles.name}>{session.user.name}</Text>
                        <Text style={styles.description}>{session.user.email}</Text>
                        <Pressable
                            accessibilityRole='button'
                            onPress={() => void Linking.openURL(webUrl)}
                            style={styles.secondaryButton}
                        >
                            <Text style={styles.secondaryText}>Open web app</Text>
                        </Pressable>
                        <Pressable
                            accessibilityRole='button'
                            disabled={busy}
                            onPress={() => void signOut()}
                            style={styles.primaryButton}
                        >
                            <Text style={styles.primaryText}>Sign out</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.card}>
                        {register && (
                            <TextInput
                                accessibilityLabel='Name'
                                autoComplete='name'
                                onChangeText={setName}
                                placeholder='Name'
                                style={styles.input}
                                value={name}
                            />
                        )}
                        <TextInput
                            accessibilityLabel='Email'
                            autoCapitalize='none'
                            autoComplete='email'
                            keyboardType='email-address'
                            onChangeText={setEmail}
                            placeholder='Email'
                            style={styles.input}
                            value={email}
                        />
                        <TextInput
                            accessibilityLabel='Password'
                            autoComplete={register ? 'new-password' : 'current-password'}
                            onChangeText={setPassword}
                            placeholder='Password'
                            secureTextEntry
                            style={styles.input}
                            value={password}
                        />
                        <Pressable
                            accessibilityRole='button'
                            disabled={busy || !config || !email.trim() || !password || (register && !name.trim())}
                            onPress={() => void submit()}
                            style={styles.primaryButton}
                        >
                            <Text style={styles.primaryText}>
                                {busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}
                            </Text>
                        </Pressable>
                        <Pressable
                            accessibilityRole='button'
                            onPress={() => {
                                setRegister(!register)
                                setError('')
                            }}
                            style={styles.secondaryButton}
                        >
                            <Text style={styles.secondaryText}>
                                {register ? 'Already have an account? Sign in' : 'New here? Create an account'}
                            </Text>
                        </Pressable>
                    </View>
                )}
                {!config && error ? (
                    <Pressable
                        accessibilityRole='button'
                        onPress={() => setConfigAttempt((value) => value + 1)}
                        style={styles.secondaryButton}
                    >
                        <Text style={styles.secondaryText}>Retry connection</Text>
                    </Pressable>
                ) : null}
                {error ? (
                    <Text accessibilityRole='alert' style={styles.error}>
                        {error}
                    </Text>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: '#f8fafc' },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        gap: 20,
        marginHorizontal: 'auto',
        maxWidth: 480,
        padding: 24,
        width: '100%',
    },
    eyebrow: { color: '#475569', fontSize: 14, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
    title: { color: '#0f172a', fontSize: 34, fontWeight: '700' },
    description: { color: '#475569', fontSize: 16, lineHeight: 24 },
    card: { backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: 18, borderWidth: 1, gap: 14, padding: 20 },
    name: { color: '#0f172a', fontSize: 22, fontWeight: '700' },
    input: { borderColor: '#cbd5e1', borderRadius: 10, borderWidth: 1, fontSize: 16, padding: 14 },
    primaryButton: { alignItems: 'center', backgroundColor: '#0f172a', borderRadius: 10, padding: 15 },
    primaryText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    secondaryButton: { alignItems: 'center', borderRadius: 10, padding: 10 },
    secondaryText: { color: '#334155', fontSize: 15, fontWeight: '600' },
    error: { color: '#b91c1c', fontSize: 14 },
})
