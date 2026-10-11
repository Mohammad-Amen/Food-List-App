import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Banner, Button, colors, Field, font, text } from '../../components/ui';
import { signIn } from '../../lib/api';
import { errorMessage, t } from '../../lib/strings';

export default function SignInScreen() {
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      await signIn(handle, password);
      // The auth listener switches to the app automatically.
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
        <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }} keyboardShouldPersistTaps="handled">
          <Text style={{ fontSize: 64, textAlign: 'center', marginTop: 24 }}>🛒</Text>
          <Text style={[text.title, { textAlign: 'center', fontSize: font.xxl }]}>{t.appName}</Text>
          <Text style={[text.title, { fontSize: font.lg }]}>{t.signIn}</Text>
          {error ? <Banner text={error} tone="danger" /> : null}
          <Field
            label={t.handle}
            hint={t.handleHint}
            value={handle}
            onChangeText={setHandle}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="أمي#4821"
          />
          <Field label={t.password} value={password} onChangeText={setPassword} secureTextEntry />
          <Button title={t.signIn} onPress={submit} loading={busy} disabled={!handle || !password} />
          <Button title={t.noAccount} variant="ghost" onPress={() => router.push('/sign-up')} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
