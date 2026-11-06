import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { AppText } from './AppText';
import { styles } from './styles';

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="label" color="textMuted">
        {title}
      </AppText>
      {action}
    </View>
  );
}
