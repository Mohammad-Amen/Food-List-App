import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nManager, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors, font, Loading } from '../components/ui';
import { AuthProvider, useAuth } from '../lib/auth';
import { isFirebaseConfigured } from '../lib/firebase';
import { t } from '../lib/strings';

// Arabic-only app: always right-to-left. Native builds get this from app.json
// (expo-localization forcesRTL); in Expo Go it applies after one app restart.
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {isFirebaseConfigured ? (
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: colors.bg }}>
          <Text style={{ fontSize: font.lg, textAlign: 'center', color: colors.danger }}>{t.errNotConfigured}</Text>
        </View>
      )}
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  const { loading, profile } = useAuth();
  if (loading) return <Loading />;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Protected guard={!!profile}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!profile}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}
