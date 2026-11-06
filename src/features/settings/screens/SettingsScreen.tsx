import React from 'react';
import { Screen, ScreenHeader, SectionHeader } from '@/src/components/ui';
import { useSettingsController } from '../hooks/useSettingsController';
import { AppColorPicker } from '../components/AppColorPicker';
import { MatchExperienceSettings } from '../components/MatchExperienceSettings';
import { ScoringPreferences } from '../components/ScoringPreferences';
import { DataSettings } from '../components/DataSettings';
import { ContactSettings } from '../components/ContactSettings';
import { DangerZoneSettings } from '../components/DangerZoneSettings';
import { ResetDataConfirmation } from '../components/ResetDataConfirmation';
import { ImportDataConfirmation } from '../components/ImportDataConfirmation';
import { AppearanceTabs } from '../components/AppearanceTabs';

export default function SettingsScreen() {
  const controller = useSettingsController();
  const { colors, mode, setMode } = controller;
  return (<Screen>
    <ScreenHeader title="Settings" subtitle="Appearance, backup and data" />

    <SectionHeader title="Appearance" />
    <AppearanceTabs colors={colors} mode={mode} setMode={setMode} />
    <AppColorPicker controller={controller} />

    <SectionHeader title="Match experience" />
    <MatchExperienceSettings controller={controller} />

    <ScoringPreferences controller={controller} />

    <SectionHeader title="Data" />
    <DataSettings controller={controller} />

    <SectionHeader title="Contact us" />
    <ContactSettings controller={controller} />

    <SectionHeader title="Danger zone" />
    <DangerZoneSettings controller={controller} />

    <ResetDataConfirmation controller={controller} />
    <ImportDataConfirmation controller={controller} />
  </Screen>);
}
