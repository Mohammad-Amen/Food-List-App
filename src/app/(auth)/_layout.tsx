import { Stack } from 'expo-router';

import { colors } from '../../components/ui';

export const unstable_settings = { initialRouteName: 'sign-in' };

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }} />;
}
