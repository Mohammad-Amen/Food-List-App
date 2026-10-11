import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { Banner, Button, Chip, Field, text } from '../../components/ui';
import { copyList, findUserByHandle, getItems, getList, sendList } from '../../lib/api';
import { useMe } from '../../lib/auth';
import { useLists } from '../../lib/lists';
import { errorMessage, t } from '../../lib/strings';
import type { UserProfile } from '../../lib/types';

export default function SendScreen() {
  const { listId, copy } = useLocalSearchParams<{ listId: string; copy?: string }>();
  const me = useMe();
  const { recentPeople } = useLists();
  const [handle, setHandle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendTo(to: UserProfile) {
    if (to.uid === me.uid) return setError(t.cantSendToSelf);
    setBusy(true);
    setError(null);
    try {
      if (copy) {
        const [list, items] = await Promise.all([getList(listId), getItems(listId)]);
        if (!list) throw new Error(t.listNotFound);
        await copyList(me, list, items, to);
      } else {
        await sendList(listId, to);
      }
      Alert.alert(t.sentSuccess, `${t.to}: ${to.username}`);
      router.back();
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  async function findAndSend() {
    setError(null);
    setBusy(true);
    try {
      const user = await findUserByHandle(handle);
      if (!user) {
        setError(t.userNotFound);
        setBusy(false);
        return;
      }
      setBusy(false);
      confirm(user);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  function confirm(user: UserProfile) {
    Alert.alert(t.sendTo, user.username, [
      { text: t.cancel, style: 'cancel' },
      { text: t.send, onPress: () => sendTo(user) },
    ]);
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }} keyboardShouldPersistTaps="handled">
      {error ? <Banner text={error} tone="danger" /> : null}
      <Field
        label={t.handle}
        hint={t.sendToHint}
        placeholder="أمي#4821"
        value={handle}
        onChangeText={setHandle}
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={recentPeople.length === 0}
        onSubmitEditing={findAndSend}
      />
      <Button title={t.send} onPress={findAndSend} loading={busy} disabled={!handle.trim()} />

      {recentPeople.length > 0 ? (
        <View style={{ gap: 10 }}>
          <Text style={text.body}>{t.recentPeople}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {recentPeople.map((p) => (
              <Chip
                key={p.uid}
                label={`👤 ${p.username}`}
                onPress={() =>
                  confirm({ uid: p.uid, username: p.username, usernameLower: p.username.toLowerCase(), displayName: '' })
                }
              />
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}
