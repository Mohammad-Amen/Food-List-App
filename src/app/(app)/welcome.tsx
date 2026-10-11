import { router } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HandleCard } from '../../components/HandleCard';
import { Banner, Button, colors, text } from '../../components/ui';
import { useMe } from '../../lib/auth';
import { t } from '../../lib/strings';

export default function WelcomeScreen() {
  const me = useMe();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }}>
        <Text style={{ fontSize: 64, textAlign: 'center' }}>🎉</Text>
        <Text style={[text.title, { textAlign: 'center' }]}>{t.welcomeTitle}</Text>
        <Text style={text.body}>{t.yourHandleIs}</Text>
        <HandleCard handle={me.username} />
        <Text style={text.body}>{t.shareHandleHint}</Text>
        <Banner text={t.forgotWarning} tone="warn" />
        <Button title={t.continue} onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  );
}
