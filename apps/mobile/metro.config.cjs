const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
const resolveExpo = config.resolver.resolveRequest;
// Expo 57 pins React 19.2.3; the web workspace can have another version.
// Native dependencies and app components must share this exact singleton.
const singletonModules = new Map([
  ["react", require.resolve("react")],
  ["react/jsx-runtime", require.resolve("react/jsx-runtime")],
  ["react/jsx-dev-runtime", require.resolve("react/jsx-dev-runtime")],
]);
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const target = singletonModules.get(moduleName) ?? moduleName;
  return resolveExpo
    ? resolveExpo(context, target, platform)
    : context.resolveRequest(context, target, platform);
};
module.exports = config;
