import { router, Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Text } from 'react-native';

import { colors, font } from '../../../components/ui';
import { consumeJustSignedUp } from '../../../lib/api';
import { useLists } from '../../../lib/lists';
import { t } from '../../../lib/strings';

const icon = (emoji: string) => () => <Text style={{ fontSize: 24 }}>{emoji}</Text>;

export default function TabsLayout() {
  const { unseenCount } = useLists();

  useEffect(() => {
    if (consumeJustSignedUp()) router.push('/welcome');
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerTitleStyle: { fontSize: font.xl, fontWeight: '700' },
        tabBarActiveTintColor: colors.primary,
        tabBarLabelStyle: { fontSize: 14, fontWeight: '700' },
        tabBarStyle: { height: 72, paddingTop: 6 },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t.inbox, tabBarIcon: icon('📥'), tabBarBadge: unseenCount || undefined }}
      />
      <Tabs.Screen name="sent" options={{ title: t.sent, tabBarIcon: icon('📤') }} />
      <Tabs.Screen name="drafts" options={{ title: t.drafts, tabBarIcon: icon('📝') }} />
      <Tabs.Screen name="profile" options={{ title: t.profile, tabBarIcon: icon('👤') }} />
    </Tabs>
  );
}
