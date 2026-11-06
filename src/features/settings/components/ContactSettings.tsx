import React from 'react';
import { Mail, MessageCircle } from 'lucide-react-native';
import { AppText, Button, Card } from '@/src/components/ui';
import type { useSettingsController } from '../hooks/useSettingsController';
import { styles } from '../styles';

type Props = Pick<ReturnType<typeof useSettingsController>, 'openContact'>;

export function ContactSettings({ controller }: { controller: Props }) {
  const { openContact } = controller;
  return (<Card style={styles.dataCard}>
    <AppText variant="caption" color="textMuted">
      Share your reviews, report bugs, or get help with issues via WhatsApp or email.
    </AppText>
    <Button
      label="WhatsApp: 0309-9968433"
      icon={MessageCircle}
      variant="secondary"
      onPress={() => openContact('https://wa.me/923099968433', 'Contact us on WhatsApp at 0309-9968433.')}
    />
    <Button
      label="scriptwithahmad@gmail.com"
      icon={Mail}
      variant="secondary"
      onPress={() => openContact('mailto:scriptwithahmad@gmail.com?subject=Boundary%20feedback%20or%20issue', 'Email us at scriptwithahmad@gmail.com.')}
    />
  </Card>);
}
