import React from 'react';
import type { useScoringController } from '../hooks/useScoringController';

import { ScoringKeepAwake } from './ScoringKeepAwake';

type Props = Pick<NonNullable<ReturnType<typeof useScoringController>>, 'store' | 'isFocused' | 'appActive' | 'live'>;

export function KeepAwakeController({ controller }: { controller: Props }) {
  const { store, isFocused, appActive, live } = controller;
  return (<>{store.keepScreenAwake && live && isFocused && appActive ? <ScoringKeepAwake /> : null}</>);
}
