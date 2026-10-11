import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView } from 'react-native';

import { Banner, Button, Chip, Field } from '../../../components/ui';
import { createList } from '../../../lib/api';
import { useMe } from '../../../lib/auth';
import { TITLE_MAX_LEN } from '../../../lib/catalog';
import { errorMessage, t } from '../../../lib/strings';

const TITLE_IDEAS = ['أغراض البيت', 'خضار وفواكه', 'عزومة', 'أغراض الأسبوع'];

export default function NewListScreen() {
  const me = useMe();
  const [title, setTitle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    try {
      const id = await createList(me, title || t.newList);
      router.replace(`/list/${id}`);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }} keyboardShouldPersistTaps="handled">
      {error ? <Banner text={error} tone="danger" /> : null}
      <Field
        label={t.listTitle}
        placeholder={t.listTitlePlaceholder}
        value={title}
        onChangeText={setTitle}
        maxLength={TITLE_MAX_LEN}
        autoFocus
      />
      <ScrollView horizontal contentContainerStyle={{ gap: 8 }} showsHorizontalScrollIndicator={false}>
        {TITLE_IDEAS.map((idea) => (
          <Chip key={idea} label={idea} selected={title === idea} onPress={() => setTitle(idea)} />
        ))}
      </ScrollView>
      <Button title={t.create} onPress={submit} loading={busy} />
    </ScrollView>
  );
}
