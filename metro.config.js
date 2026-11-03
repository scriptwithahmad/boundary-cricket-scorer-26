// Learn more: https://docs.expo.dev/guides/customizing-metro
const fs = require('fs');
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/*
 * Since SDK 56, expo-router ships its own copy of React Navigation instead of
 * depending on @react-navigation/*. Code written the classic way
 * (`import { useNavigation } from '@react-navigation/native'`) would fail to
 * resolve — or, once the package got installed, run a SECOND navigation library
 * that expo-router's navigators never see. Point those imports at expo-router's
 * copy: same API, what Expo's sdk-56 codemod rewrites them to.
 *
 * SDK 58 (2026-10-21): expo-router now has an "exports" map whose "./build/*"
 * entry turns `expo-router/build/react-navigation/native` into `native.js`,
 * which doesn't exist — Metro then warns "invalid package.json configuration"
 * on every bundle before falling back. Asking for `<pkg>/index.js` matches the
 * map's "./build/*.js" entry exactly, and is the same file on SDK 56/57.
 */
const FORK = path.join(path.dirname(require.resolve('expo-router/package.json')), 'build', 'react-navigation');
const upstream = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = upstream || context.resolveRequest;
  const m = /^@react-navigation\/([a-z-]+)$/.exec(moduleName);

  if (m && fs.existsSync(path.join(FORK, m[1], 'index.js'))) {
    return resolve(context, `expo-router/build/react-navigation/${m[1]}/index.js`, platform);
  }

  return resolve(context, moduleName, platform);
};

module.exports = config;
