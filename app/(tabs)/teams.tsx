import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, Plus, Swords, Users } from 'lucide-react-native';
import { AppText, Avatar, Button, Card, EmptyState, Field, IconButton, Screen, ScreenHeader, Sheet } from '@/src/components/ui';
import { ColorPicker } from '@/src/components/ColorPicker';
import { useStore, makeShort } from '@/src/store';
import { TEAM_COLORS, useTheme } from '@/src/theme';

export default function Teams() {
  const router = useRouter();
  const { colors } = useTheme();
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [short, setShort] = useState('');
  const [color, setColor] = useState(TEAM_COLORS[0]);

  const submit = () => {
    if (!name.trim()) return;
    const t = store.addTeam(name, short || makeShort(name), color);
    setOpen(false);
    setName('');
    setShort('');
    router.push(`/team/${t.id}` as any);
  };

  return (
    <Screen>
      <ScreenHeader
        title="Teams"
        subtitle={store.teams.length ? `${store.teams.length} team${store.teams.length === 1 ? '' : 's'} · ${store.players.length} players` : 'Build your squads'}
        right={<IconButton icon={Plus} label="New team" tone="primary" onPress={() => setOpen(true)} />}
      />
      {store.teams.length === 0 ? (
        <EmptyState icon={Users} title="No teams yet" text="Create a team, add your players, then pick two sides to start scoring.">
          <Button label="Create a team" icon={Plus} onPress={() => setOpen(true)} />
          <Button label="Load demo teams" variant="secondary" icon={Swords} onPress={() => store.seedDemo()} />
        </EmptyState>
      ) : (
        <View style={{ gap: 12 }}>
          {store.teams.map((t, i) => {
            const count = store.players.filter((p) => p.teamId === t.id).length;
            return (
              <Card key={t.id} index={i} onPress={() => router.push(`/team/${t.id}` as any)} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <Avatar name={t.short} color={t.color} size={52} />
                <View style={{ flex: 1 }}>
                  <AppText variant="heading" numberOfLines={1}>
                    {t.name}
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    {count} player{count === 1 ? '' : 's'}
                    {count < 2 ? ' · needs at least 2' : ''}
                  </AppText>
                </View>
                <ChevronRight size={20} color={colors.textFaint} />
              </Card>
            );
          })}
        </View>
      )}

      <Sheet
        visible={open}
        onClose={() => setOpen(false)}
        title="New team"
        footer={<Button label="Create team" disabled={!name.trim()} onPress={submit} />}
      >
        <Field label="Team name" value={name} onChangeText={setName} placeholder="e.g. Pakistan" autoFocus returnKeyType="done" />
        <Field
          label="Short code"
          value={short}
          onChangeText={(v) => setShort(v.slice(0, 3).toUpperCase())}
          placeholder={name ? makeShort(name) : 'PAK'}
          autoCapitalize="characters"
          maxLength={3}
        />
        <View style={{ gap: 8 }}>
          <AppText variant="label" color="textMuted">
            Team colour
          </AppText>
          <ColorPicker value={color} onChange={setColor} />
        </View>
      </Sheet>
    </Screen>
  );
}
