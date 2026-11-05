import React, { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronRight, Pencil, Plus, Swords, Trash2, UserPlus } from 'lucide-react-native';
import {
  AppText,
  Avatar,
  Badge,
  Button,
  Card,
  Chip,
  ConfirmSheet,
  EmptyState,
  Field,
  IconButton,
  PlayerRow,
  Screen,
  ScreenHeader,
  SectionHeader,
  Sheet,
} from '@/src/components/ui';
import { ColorPicker } from '@/src/components/ColorPicker';
import { TeamBadgePicker } from '@/src/components/TeamBadgePicker';
import type { TeamBadge } from '@/src/components/TeamBadgeIcon';
import { useStore, makeShort } from '@/src/store';
import { ROLES, Role } from '@/src/types';
import { useTheme } from '@/src/theme';

export default function TeamDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const store = useStore();
  const team = store.teams.find((t) => t.id === id);
  const players = store.players.filter((p) => p.teamId === id);

  const [playerOpen, setPlayerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pName, setPName] = useState('');
  const [pRole, setPRole] = useState<Role>('Batter');
  const [added, setAdded] = useState(0);

  const [teamOpen, setTeamOpen] = useState(false);
  const [tName, setTName] = useState('');
  const [tShort, setTShort] = useState('');
  const [tColor, setTColor] = useState('');
  const [tBadge, setTBadge] = useState<TeamBadge>('initials');
  const [confirmTeam, setConfirmTeam] = useState(false);
  const [confirmPlayer, setConfirmPlayer] = useState(false);

  if (!team) {
    return (
      <Screen edges={['top', 'bottom']}>
        <ScreenHeader title="Team" back />
        <EmptyState icon={Swords} title="Team not found" text="This team may have been deleted." />
      </Screen>
    );
  }

  const openAdd = () => {
    setEditingId(null);
    setPName('');
    setPRole('Batter');
    setAdded(0);
    setPlayerOpen(true);
  };
  const openEdit = (pid: string) => {
    const p = store.players.find((x) => x.id === pid)!;
    setEditingId(pid);
    setPName(p.name);
    setPRole(p.role);
    setPlayerOpen(true);
  };
  const savePlayer = () => {
    if (!pName.trim()) return;
    if (editingId) {
      store.updatePlayer(editingId, { name: pName.trim(), role: pRole });
      setPlayerOpen(false);
    } else {
      store.addPlayer(team.id, pName, pRole);
      setAdded((n) => n + 1);
      setPName('');
    }
  };
  const openTeamEdit = () => {
    setTName(team.name);
    setTShort(team.short);
    setTColor(team.color);
    setTBadge(team.badge ?? 'initials');
    setTeamOpen(true);
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader
        title={team.name}
        subtitle={`${players.length} player${players.length === 1 ? '' : 's'}`}
        back
        right={<IconButton icon={Pencil} label="Edit team" onPress={openTeamEdit} />}
      />

      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Avatar name={team.short} color={team.color} size={64} badge={team.badge} />
        <View style={{ flex: 1, gap: 4 }}>
          <AppText variant="heading">{team.name}</AppText>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Badge label={team.short} tone="primary" />
            <Badge label={`${players.filter((p) => p.role === 'Bowler' || p.role === 'All-rounder').length} bowling options`} />
          </View>
        </View>
      </Card>

      <SectionHeader title="Squad" action={<Button label="Add player" icon={UserPlus} size="sm" variant="soft" full={false} onPress={openAdd} />} />
      {players.length === 0 ? (
        <EmptyState icon={UserPlus} title="No players yet" text="Add at least two players so this team can take the field.">
          <Button label="Add players" icon={Plus} onPress={openAdd} />
        </EmptyState>
      ) : (
        <View style={{ gap: 8 }}>
          {players.map((p) => {
            const c = store.careers[p.id];
            return (
              <PlayerRow
                key={p.id}
                name={p.name}
                sub={p.role}
                color={team.color}
                onPress={() => router.push(`/player/${p.id}` as any)}
                trailing={
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {c && c.matches > 0 ? (
                      <AppText variant="caption" color="textMuted">
                        {c.runs} r · {c.wickets} w
                      </AppText>
                    ) : null}
                    <IconButton icon={Pencil} label={`Edit ${p.name}`} size={36} onPress={() => openEdit(p.id)} />
                  </View>
                }
              />
            );
          })}
        </View>
      )}

      <View style={{ marginTop: 32, alignItems: 'center' }}>
        <Button label="Delete team" variant="ghost" icon={Trash2} size="sm" full={false} onPress={() => setConfirmTeam(true)} />
      </View>

      {/* Player sheet */}
      <Sheet
        visible={playerOpen}
        onClose={() => setPlayerOpen(false)}
        title={editingId ? 'Edit player' : 'Add player'}
        subtitle={!editingId && added ? `${added} added — keep going or tap Done` : undefined}
        footer={
          <>
            <Button label={editingId ? 'Save changes' : 'Add player'} disabled={!pName.trim()} onPress={savePlayer} />
            {editingId ? (
              <Button label="Remove player" variant="ghost" onPress={() => setConfirmPlayer(true)} />
            ) : (
              <Button label="Done" variant="secondary" onPress={() => setPlayerOpen(false)} />
            )}
          </>
        }
      >
        <Field label="Player name" value={pName} onChangeText={setPName} placeholder="e.g. Muhammad Ahmad" autoFocus returnKeyType="done" onSubmitEditing={savePlayer} />
        <View style={{ gap: 8 }}>
          <AppText variant="label" color="textMuted">
            Role
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {ROLES.map((r) => (
              <Chip key={r} label={r} selected={pRole === r} onPress={() => setPRole(r)} />
            ))}
          </View>
        </View>
      </Sheet>

      {/* Team sheet */}
      <Sheet
        visible={teamOpen}
        onClose={() => setTeamOpen(false)}
        title="Edit team"
        footer={
          <Button
            label="Save changes"
            disabled={!tName.trim()}
            onPress={() => {
              store.updateTeam(team.id, { name: tName.trim(), short: (tShort || makeShort(tName)).toUpperCase(), color: tColor, badge: tBadge });
              setTeamOpen(false);
            }}
          />
        }
      >
        <Field label="Team name" value={tName} onChangeText={setTName} />
        <Field label="Short code" value={tShort} onChangeText={(v) => setTShort(v.slice(0, 3).toUpperCase())} maxLength={3} autoCapitalize="characters" />
        <View style={{ gap: 8 }}>
          <AppText variant="label" color="textMuted">
            Team colour
          </AppText>
          <ColorPicker value={tColor} onChange={setTColor} />
        </View>
        <TeamBadgePicker value={tBadge} onChange={setTBadge} color={tColor} name={tShort || makeShort(tName)} />
      </Sheet>

      <ConfirmSheet
        visible={confirmTeam}
        title={`Delete ${team.name}?`}
        message="The team and its players will be removed. Past matches keep their scorecards."
        onCancel={() => setConfirmTeam(false)}
        onConfirm={() => {
          setConfirmTeam(false);
          router.back();
          store.deleteTeam(team.id);
        }}
      />
      <ConfirmSheet
        visible={confirmPlayer}
        title="Remove player?"
        message="This player will be removed from the squad. Their past match records stay in history."
        confirmLabel="Remove"
        onCancel={() => setConfirmPlayer(false)}
        onConfirm={() => {
          if (editingId) store.deletePlayer(editingId);
          setConfirmPlayer(false);
          setPlayerOpen(false);
        }}
      />
    </Screen>
  );
}
