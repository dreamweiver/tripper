/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@tripper/shared$": "<rootDir>/../shared/src/index.ts",
    // react-leaflet ships ESM that ts-jest can't transform; stub it (jsdom has
    // no real map surface anyway).
    "^react-leaflet$": "<rootDir>/test/reactLeafletMock.tsx",
    "\\.(scss|css)$": "identity-obj-proxy",
    "\\.svg$": "<rootDir>/test/svgMock.ts",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
};
