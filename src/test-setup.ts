import '@testing-library/jest-dom/vitest'

// Tests never hit the network: the app falls back to the dated rate snapshot.
globalThis.fetch = (async () => {
  throw new Error('network disabled in tests')
}) as typeof fetch
