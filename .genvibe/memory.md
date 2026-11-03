<!-- genvibe-memory covers:KB4WYFezbQgdLH85 -->
## What this app is
- Boundary is a React Native cricket-scoring app requested for Expo, TypeScript, Expo Router, and NativeWind.
- The user requested local data persistence without a backend.

## Working (confirmed)
- The post-change check passed (check: check passed).
- Page `/` had no crash or failed backend request (check: crash check on `/`).

## Claimed, not yet confirmed
- The app has team and player management, T20/ODI/custom match setup, ball-by-ball scoring, scorecards, match results, history, and player statistics.
- Scoring features claimed include runs, extras, wickets, strike rotation, bowler selection, and undo.
- Local persistence, dark/light themes, animations, and Android compatibility were claimed; these have not been confirmed.
- Agent said it captured Home and Teams screens, but could not export a combined image of the full app flow; its summary says Teams showed an empty state with “Create a team” and “Load demo teams.”
- Agent said it could not save screenshots into the project or create a folder, and made no changes for that request.
- Agent said it cannot send project files directly to the user’s device. It suggested using Expo Go, requesting an Android APK build after saving an Expo access token in Cloud → Secrets, or downloading a source ZIP via GenVibe’s project export. These options have not been confirmed.

## Open bugs
—

## Design
- Agent-described look: editorial pitch-green, with a deep night-turf dark theme, chalk-and-cream light theme, ember-orange accents, and geometric typography. Not confirmed.

## Structure
- Changed files include `src/types.ts`, `src/engine/cricket.ts`, `src/theme/index.tsx`, `src/lib/haptics.ts`, `src/store/index.tsx`, `src/components/ui.tsx`, `src/components/MatchCard.tsx`, `src/components/Scorecard.tsx`, `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/teams.tsx`, `app/(tabs)/history.tsx`, `app/(tabs)/stats.tsx`, `app/team/[id].tsx`, `app/player/[id].tsx`, `app/match/new.tsx`, `app/match/[id]/score.tsx`, `app/match/[id]/index.tsx`, and `app.json`.

## User preferences & rules
- Build a complete mobile cricket-scoring app named “Boundary” using React Native, Expo, TypeScript, Expo Router, and NativeWind; generate actual React Native components.
- User requirements: premium, modern, minimal UI; dark/light themes; team and player management; T20, ODI, and custom matches; ball-by-ball scoring and live scorecard; wickets, extras, overs, strike rotation, bowler selection; match history and player statistics; local persistence without a backend; smooth animations, responsive layouts, and proper Android compatibility.
- User asked to export images of all app screens with the flow, and asked to put all screen UI images into a separate folder.
- User asked to export the code to their device.
