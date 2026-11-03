import React, { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { History as HistoryIcon, Plus } from 'lucide-react-native';
import { Button, EmptyState, IconButton, Screen, ScreenHeader, Segmented } from '@/src/components/ui';
import { MatchCard } from '@/src/components/MatchCard';
import { useStore } from '@/src/store';

type Filter = 'all' | 'live' | 'completed';

export default function History() {
  const router = useRouter();
  const store = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const list = store.matches.filter((m) => filter === 'all' || m.status === filter);

  return (
    <Screen>
      <ScreenHeader
        title="Matches"
        subtitle={store.matches.length ? `${store.matches.length} played or in progress` : 'Your match archive'}
        right={<IconButton icon={Plus} label="New match" tone="primary" onPress={() => router.push('/match/new' as any)} />}
      />
      <View style={{ marginBottom: 20 }}>
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { label: 'All', value: 'all' },
            { label: 'Live', value: 'live' },
            { label: 'Completed', value: 'completed' },
          ]}
        />
      </View>
      {list.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title={store.matches.length === 0 ? 'No matches yet' : `No ${filter} matches`}
          text="Every match you score is saved here with its full scorecard."
        >
          {store.matches.length === 0 ? <Button label="Start a match" icon={Plus} onPress={() => router.push('/match/new' as any)} /> : null}
        </EmptyState>
      ) : (
        <View style={{ gap: 12 }}>
          {list.map((m, i) => (
            <MatchCard key={m.id} match={m} index={i} />
          ))}
        </View>
      )}
    </Screen>
  );
}
