import { router } from 'expo-router';
import { FlatList, View } from 'react-native';

import { t } from '../lib/strings';
import type { ShoppingList } from '../lib/types';
import { ListCard } from './ListCard';
import { Button, Empty, Loading, Screen } from './ui';

export function ListScreen({
  lists,
  mode,
  ready,
  emptyText,
}: {
  lists: ShoppingList[];
  mode: 'inbox' | 'sent' | 'draft';
  ready: boolean;
  emptyText: string;
}) {
  if (!ready) return <Loading />;
  return (
    <Screen>
      <FlatList
        data={lists}
        keyExtractor={(l) => l.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 100 }}
        renderItem={({ item }) => <ListCard list={item} mode={mode} />}
        ListEmptyComponent={<Empty text={emptyText} />}
      />
      <View style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
        <Button title={`＋ ${t.newList}`} onPress={() => router.push('/list/new')} />
      </View>
    </Screen>
  );
}
