import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Banner, Button, colors, Field, text } from '../../components/ui';
import { markJustSignedUp, signUp } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { errorMessage, t } from '../../lib/strings';
import { validateName } from '../../lib/username';

const nameErrors = { tooShort: t.errNameShort, tooLong: t.errNameLong, invalidChars: t.errNameChars };

export default function SignUpScreen() {
  const { setProfile } = useAuth();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    const nameError = validateName(name);
    if (nameError) return setError(nameErrors[nameError]);
    if (password.length < 6) return setError(t.errWeakPassword);
    setError(null);
    setBusy(true);
    try {
      const profile = await signUp(name, password);
      markJustSignedUp();
      setProfile(profile);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="height">
        <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }} keyboardShouldPersistTaps="handled">
          <Text style={[text.title, { marginTop: 24 }]}>{t.signUp}</Text>
          {error ? <Banner text={error} tone="danger" /> : null}
          <Field label={t.displayName} hint={t.displayNameHint} value={name} onChangeText={setName} maxLength={12} />
          <Field
            label={t.password}
            hint={t.passwordHint}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Banner text={t.forgotWarning} tone="warn" />
          <Button title={t.signUp} onPress={submit} loading={busy} disabled={!name || !password} />
          <Button title={t.haveAccount} variant="ghost" onPress={() => router.back()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
