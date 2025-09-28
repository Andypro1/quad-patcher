import { writable } from "svelte/store";

const base64ToUint8Array = (base64) => {
  // Decode base64 into a binary string
  const binary = atob(base64);

  // Create a Uint8Array and fill it with char codes
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export const assetState = writable({
  linkAsset: undefined,
  samusAsset: undefined,
  base64ToUint8Array
});
