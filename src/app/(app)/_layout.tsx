import { Stack } from 'expo-router';

import { colors, font } from '../../components/ui';
import { ListsProvider } from '../../lib/lists';
import { t } from '../../lib/strings';

export const unstable_settings = { initialRouteName: '(tabs)' };

export default function AppLayout() {
  return (
    <ListsProvider>
      <Stack
        screenOptions={{
          headerTitleStyle: { fontSize: font.lg, fontWeight: '700' },
          headerTintColor: colors.primary,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="list/new" options={{ title: t.newList, presentation: 'modal' }} />
        <Stack.Screen name="list/[id]" options={{ title: '' }} />
        <Stack.Screen name="item" options={{ title: t.addItem, presentation: 'modal' }} />
        <Stack.Screen name="send" options={{ title: t.sendTo, presentation: 'modal' }} />
        <Stack.Screen name="welcome" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </ListsProvider>
  );
}
