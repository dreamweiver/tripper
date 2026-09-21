import "@testing-library/jest-dom";

// jsdom does not implement ResizeObserver, which the trip map's controller uses
// to refit the viewport. A no-op stub is enough for components under test.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jest-environment-jsdom does not provide TextEncoder/TextDecoder, which
// react-router v7 relies on at import time. Polyfill from Node's util module.
if (typeof globalThis.TextEncoder === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextEncoder, TextDecoder } = require("node:util");
  Object.defineProperty(globalThis, "TextEncoder", { value: TextEncoder });
  Object.defineProperty(globalThis, "TextDecoder", { value: TextDecoder });
}

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
