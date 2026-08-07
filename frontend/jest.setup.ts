import "@testing-library/jest-dom";

// jest-environment-jsdom does not forward crypto.randomUUID from Node's Web
// Crypto API. Polyfill it so stores that call crypto.randomUUID() work in tests.
if (typeof globalThis.crypto === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  Object.defineProperty(globalThis, "crypto", { value: require("node:crypto").webcrypto });
} else if (typeof globalThis.crypto.randomUUID === "undefined") {
  Object.defineProperty(globalThis.crypto, "randomUUID", {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    value: require("node:crypto").randomUUID,
  });
}
