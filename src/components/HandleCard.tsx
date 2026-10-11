import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';

import { t } from '../lib/strings';
import { Button, colors, font } from './ui';

/** Shows the user's handle big, with copy + share buttons. */
export function HandleCard({ handle }: { handle: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <View style={styles.card}>
      <Text style={styles.handle} selectable>
        {handle}
      </Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button
          style={{ flex: 1 }}
          variant="secondary"
          title={copied ? t.copied : t.copy}
          onPress={async () => {
            await Clipboard.setStringAsync(handle);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
        />
        <Button style={{ flex: 1 }} title={t.share} onPress={() => Share.share({ message: t.shareMessage(handle) })} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  handle: { fontSize: font.xxl, fontWeight: '800', color: colors.primary, textAlign: 'center' },
});
