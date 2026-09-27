module.exports = function expoConfig(source) {
    const appId = source.APP_ID || 'fullstack-starter'
    const scheme = source.EXPO_APP_SCHEME || appId
    const bundleId = source.EXPO_BUNDLE_ID || `com.example.${appId.replaceAll('-', '')}`
    const apiUrl =
        source.EXPO_API_URL ||
        source.NATIVE_API_URL ||
        new URL('/api', source.APP_URL || 'http://localhost:8080').toString()
    const parsedApi = new URL(apiUrl)
    if (
        !['http:', 'https:'].includes(parsedApi.protocol) ||
        parsedApi.username ||
        parsedApi.password ||
        parsedApi.search ||
        parsedApi.hash ||
        parsedApi.pathname.replace(/\/$/, '') !== '/api'
    )
        throw new Error('EXPO_API_URL or NATIVE_API_URL must be an HTTP(S) URL ending in /api')
    if (
        !/^[a-z][a-z0-9.-]{2,80}$/.test(scheme) ||
        ['http', 'https', 'file', 'javascript', 'data', 'app'].includes(scheme)
    )
        throw new Error('EXPO_APP_SCHEME must be an application URL scheme')
    if (!/^[a-zA-Z][a-zA-Z0-9]*(\.[a-zA-Z][a-zA-Z0-9]*){2,}$/.test(bundleId))
        throw new Error('EXPO_BUNDLE_ID must be a reverse-DNS identifier')

    if (!/^[1-9]\d*$/.test(source.EXPO_VERSION_CODE || '1') || Number(source.EXPO_VERSION_CODE || 1) > 2100000000)
        throw new Error('EXPO_VERSION_CODE must be a positive Android build number at most 2100000000')
    const web = new URL(source.APP_URL || parsedApi.origin)
    if (
        !['http:', 'https:'].includes(web.protocol) ||
        web.username ||
        web.password ||
        web.pathname !== '/' ||
        web.search ||
        web.hash
    )
        throw new Error('APP_URL must be an HTTP(S) origin without credentials or a path')
    return {
        expo: {
            name: source.APP_NAME || 'Fullstack Starter',
            slug: appId,
            version: source.APP_VERSION || '0.1.0',
            scheme,
            orientation: 'portrait',
            icon: './assets/icon.png',
            userInterfaceStyle: 'automatic',
            ios: {
                supportsTablet: true,
                bundleIdentifier: bundleId,
                buildNumber: String(source.EXPO_VERSION_CODE || '1'),
            },
            android: {
                package: bundleId,
                versionCode: Number(source.EXPO_VERSION_CODE || 1),
                adaptiveIcon: {
                    backgroundColor: '#e6f4fe',
                    foregroundImage: './assets/android-icon-foreground.png',
                    backgroundImage: './assets/android-icon-background.png',
                    monochromeImage: './assets/android-icon-monochrome.png',
                },
            },
            web: { bundler: 'metro', output: 'single', favicon: './assets/favicon.png' },
            plugins: ['expo-secure-store', 'expo-web-browser'],
            extra: {
                appId,
                appName: source.APP_NAME || 'Fullstack Starter',
                apiUrl: parsedApi.toString().replace(/\/$/, ''),
                webUrl: web.origin,
                scheme,
                ...(source.EXPO_PROJECT_ID ? { eas: { projectId: source.EXPO_PROJECT_ID } } : {}),
            },
        },
    }
}
