// metro-obfuscator.js

const { transform } = require('@expo/metro-config/babel-transformer');
const obfuscator = require('javascript-obfuscator');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

function shouldObfuscate(filename) {
  const normalizedPath = path.normalize(filename).replace(/\\/g, '/');
  const projectRoot = process.cwd().replace(/\\/g, '/');
  
  // Only obfuscate .js and .jsx files
  if (!normalizedPath.match(/\.(js|jsx)$/)) {
    return false;
  }
  
  // Never obfuscate node_modules
  if (normalizedPath.includes('/node_modules/')) {
    return false;
  }
  
  // Never obfuscate config files
  const configFiles = [
    'index.js',
    'App.js',
    'babel.config.js',
    'metro.config.js',
    'expo.json',
    'app.json'
  ];
  
  if (configFiles.some(config => normalizedPath.endsWith(`/${config}`))) {
    return false;
  }
  
  // Only obfuscate files that are explicitly in your source directories
  // and are within your project root
  const srcDirectories = [
    '/src/',
    '/screens/',
    '/components/',
    '/services/',
    '/hooks/',
    '/utils/',
    '/constants/',
    '/context/',
    '/navigation/'
  ];
  
  // Must be within project root AND in a source directory
  const isInProject = normalizedPath.startsWith(projectRoot);
  const isInSrcDir = srcDirectories.some(dir => normalizedPath.includes(dir));
  
  return isInProject && isInSrcDir;
}

module.exports = {
  transform: async (props) => {
    try {
      // First, let Expo's default transformer handle the file
      const result = await transform(props);
      
      // Only attempt obfuscation in production and for appropriate files
      if (isProd && shouldObfuscate(props.filename)) {
        console.log(`🔒 Obfuscating: ${props.filename}`);
        
        const obfuscatedResult = obfuscator.obfuscate(result.code, {
          compact: false,
          controlFlowFlattening: false, // Disable to reduce errors
          deadCodeInjection: false, // Disable to reduce errors
          identifierNamesGenerator: 'mangled',
          renameGlobals: false, // Important: don't rename globals
          reservedNames: [
            // React/React Native essentials
            '__DEV__',
            'require',
            'module',
            'exports',
            'React',
            'ReactNative',
            'console',
            'global',
            'window',
            'document',
            'navigator',
            'process',
            // Expo specific
            'expo',
            'Expo',
            'ExpoModules',
            // Common function names that should not be obfuscated
            'render',
            'componentDidMount',
            'componentWillUnmount',
            'useState',
            'useEffect',
            'useCallback',
            'useMemo'
          ],
          reservedStrings: [
            // Keep important strings intact
            'react',
            'react-native',
            'expo'
          ],
          stringArray: true,
          stringArrayThreshold: 0.5, // Reduce threshold to minimize issues
          target: 'node', // Important for React Native
          transformObjectKeys: false, // Prevent breaking object destructuring
        });
        
        return {
          ...result,
          code: obfuscatedResult.getObfuscatedCode()
        };
      }
      
      return result;
    } catch (error) {
      console.warn(`⚠️ Obfuscation failed for ${props.filename}: ${error.message}`);
      // Always return the original result if obfuscation fails
      const originalResult = await transform(props);
      return originalResult;
    }
  },
};