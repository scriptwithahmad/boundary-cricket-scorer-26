# Boundary

## Project structure

```text
app/                       Expo Router layouts and thin route entry points
src/
  components/
    ui/                    Shared buttons, cards, sheets, inputs and layouts
    cricket/               Shared team icons and avatars
  features/
    home/                  Home screen
    matches/
      components/          Match cards, scorecards, awards and wagon wheel
      hooks/               Spoken score announcements
      scoring/             Scoring controller, scoreboard, controls and sheets
      setup/               Match setup controller, steps and coin toss
      screens/             Match history and match details
    navigation/            Tab icons
    onboarding/            Welcome and startup components
    players/               Player profiles and squad rows
    settings/              Settings sections, controller and backup utilities
    statistics/            Statistics screen and filters
    teams/                 Team screens and appearance pickers
  engine/                  Cricket rules and statistical calculations
  hooks/                   Shared application and animation hooks
  lib/                     Device helpers
  store/                   App state, persistence, preferences and captains
  theme/                   Theme provider, palettes and typography
  types/                   Shared domain and team badge types
assets/
  images/                  Application image assets
  store-listing/           Store icon and feature graphic
tests/                     Behavioral and architecture checks
scripts/                   Asset generation and build tooling
```

Keep route names in `app/` stable; place screen implementations in the matching
feature. Shared UI should not import feature code. Domain types and the cricket
engine should remain independent of presentation. Feature-specific components
live with their feature, while reusable cricket visuals live in
`src/components/cricket/`.

Use npm and the committed `package-lock.json`. Run `npm ci` for a reproducible
installation. Generated files and local caches are ignored.

## Checks

- `npm test`: run all behavioral and architecture checks.
- `npm run typecheck`: check TypeScript and imports.
- `npm run build:web`: verify the production browser bundle.

Checks run from the repository root and cover scoring, undo, speech, preferences,
captains, theme contrast and module boundaries. Native device checks are still
needed when changing device-specific behavior.

## Development

Run `npm install`, then `npm start` to start the LAN server for Expo Go.
Keep the phone and computer on the same Wi-Fi and scan the new terminal QR code.
This project uses Expo SDK 58; the installed Expo Go app must support SDK 58.

- `npm run dev:clear`: rebuild the Metro cache after dependency changes. The first bundle will be slower.
- `npm run dev:tunnel`: fallback when Wi-Fi isolation or Windows Firewall prevents LAN access. Tunnel reloads can be slower.
- `npm run build:web`: export the browser app.

If the phone cannot connect, open `http://<computer-Wi-Fi-IP>:8081/status`
in its browser. The expected response is `packager-status:running`.
If it does not load, check the network and Windows Firewall access for Node.js.
If it loads but Expo Go rejects the project, check the Expo Go SDK version or the
error shown in Metro. A successful web build alone does not verify Expo Go support.
