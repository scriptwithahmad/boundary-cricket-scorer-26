import { StyleSheet } from 'react-native';
import { MAX_W } from './layoutConstants';

export const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32, alignItems: 'center' },
  maxWidth: { width: '100%', maxWidth: MAX_W },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12, paddingBottom: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 12 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, alignItems: 'center' },
});
