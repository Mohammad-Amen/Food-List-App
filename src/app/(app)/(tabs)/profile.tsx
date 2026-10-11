import { ScrollView, Text } from 'react-native';

import { HandleCard } from '../../../components/HandleCard';
import { Banner, Button, text } from '../../../components/ui';
import { signOut } from '../../../lib/api';
import { useMe } from '../../../lib/auth';
import { t } from '../../../lib/strings';

export default function ProfileScreen() {
  const me = useMe();
  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
      <Text style={text.body}>{t.yourHandleIs}</Text>
      <HandleCard handle={me.username} />
      <Text style={text.muted}>{t.shareHandleHint}</Text>
      <Banner text={t.forgotWarning} tone="warn" />
      <Button title={t.signOut} variant="danger" onPress={() => signOut()} />
    </ScrollView>
  );
}
