module.exports = {
  preset: 'react-native',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '.*\\.d\\.ts$', // Ignore all .d.ts files
  ],
  setupFilesAfterEnv: [
    './jest.setup.ts',
    './node_modules/react-native-gesture-handler/jestSetup.js',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-button)/)',
  ],
  transform: {
    '^.+\\.(js)$': [
      'babel-jest',
      { plugins: ['babel-plugin-syntax-hermes-parser'] },
    ],
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  //   setupFilesAfterEnv: [],
  //   setupFiles: ['./node_modules/@testing-library/jest-native/extend-expect'],
};

