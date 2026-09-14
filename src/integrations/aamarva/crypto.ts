/**
 * AAMARVA × A2A Integration — Zero-Knowledge E2EE Cryptography
 *
 * Implements local client-side encryption and decryption conforming to
 * AAMARVA's strict Zero-Knowledge E2EE Architecture:
 *
 * 1. The Server is Blind:
 *    - The AAMARVA API acts solely as a cryptographic relay.
 *    - Database content column is strictly enforced to `null`.
 *    - Any attempt to send plaintext to private endpoints is rejected with PLAINTEXT_REJECTED.
 *
 * 2. Cryptographic Envelopes:
 *    - Format: { ciphertext, nonce, version: 1, keyEpoch: 1 }
 *    - Algorithm: AES-256-GCM authenticated encryption.
 *    - 96-bit random nonce generated for every message.
 */

import type { AamarvaEncryptedPayload } from './types.ts';

export class AamarvaCryptoError extends Error {
  public code: string;

  constructor(message: string, code: string = 'CRYPTO_ERROR') {
    super(message);
    this.code = code;
    this.name = 'AamarvaCryptoError';
  }
}

/**
 * Validates that an outbound private message is an encrypted envelope
 * and strictly prevents accidental plaintext transmission over the wire.
 */
export function assertEncryptedPayload(payload: unknown): asserts payload is AamarvaEncryptedPayload {
  if (!payload || typeof payload !== 'object') {
    throw new AamarvaCryptoError(
      'PLAINTEXT_REJECTED: Private messages must be transmitted as an encrypted envelope with ciphertext and nonce.',
      'PLAINTEXT_REJECTED'
    );
  }

  const p = payload as Record<string, unknown>;

  if (typeof p.content === 'string' && p.content.trim().length > 0) {
    throw new AamarvaCryptoError(
      'PLAINTEXT_REJECTED: Plaintext content is forbidden on private channels. Encrypt before sending.',
      'PLAINTEXT_REJECTED'
    );
  }

  if (typeof p.ciphertext !== 'string' || !p.ciphertext) {
    throw new AamarvaCryptoError(
      'PLAINTEXT_REJECTED: Missing required "ciphertext" field in encrypted envelope.',
      'PLAINTEXT_REJECTED'
    );
  }

  if (typeof p.nonce !== 'string' || !p.nonce) {
    throw new AamarvaCryptoError(
      'PLAINTEXT_REJECTED: Missing required "nonce" field in encrypted envelope.',
      'PLAINTEXT_REJECTED'
    );
  }
}

/**
 * Generates a high-entropy 256-bit symmetric encryption key for direct agent-to-agent sessions.
 */
export async function generateSessionKey(): Promise<CryptoKey> {
  return await globalThis.crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Imports a raw 32-byte key (Buffer/Uint8Array) as an AES-GCM CryptoKey.
 */
export async function importRawKey(rawKey: Uint8Array): Promise<CryptoKey> {
  if (rawKey.byteLength !== 32) {
    throw new AamarvaCryptoError('Key must be exactly 32 bytes (256 bits) for AES-256-GCM', 'INVALID_KEY_LENGTH');
  }
  return await globalThis.crypto.subtle.importKey(
    'raw',
    rawKey as unknown as BufferSource,
    { name: 'AES-GCM' },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Exports a CryptoKey to raw 32-byte Uint8Array.
 */
export async function exportRawKey(key: CryptoKey): Promise<Uint8Array> {
  const exported = await globalThis.crypto.subtle.exportKey('raw', key);
  return new Uint8Array(exported);
}

/**
 * Encrypts a plaintext message locally on the agent device using AES-256-GCM.
 * Produces an authoritative AAMARVA encrypted payload envelope.
 */
export async function encryptMessage(
  plaintext: string,
  key: CryptoKey,
  keyEpoch: number = 1
): Promise<AamarvaEncryptedPayload> {
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(plaintext);

  // Generate 12-byte (96-bit) cryptographic nonce for AES-GCM
  const nonceBytes = new Uint8Array(12);
  globalThis.crypto.getRandomValues(nonceBytes);

  const ciphertextBuffer = await globalThis.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonceBytes as unknown as BufferSource,
    },
    key,
    plaintextBytes as unknown as BufferSource
  );

  const ciphertext = uint8ArrayToBase64(new Uint8Array(ciphertextBuffer));
  const nonce = uint8ArrayToBase64(nonceBytes);

  const payload: AamarvaEncryptedPayload = {
    ciphertext,
    nonce,
    version: 1,
    keyEpoch,
  };

  assertEncryptedPayload(payload);
  return payload;
}

/**
 * Decrypts an AAMARVA encrypted payload envelope locally on the agent device using AES-256-GCM.
 */
export async function decryptMessage(
  payload: AamarvaEncryptedPayload,
  key: CryptoKey
): Promise<string> {
  assertEncryptedPayload(payload);

  const ciphertextBytes = base64ToUint8Array(payload.ciphertext);
  const nonceBytes = base64ToUint8Array(payload.nonce);

  try {
    const decryptedBuffer = await globalThis.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: nonceBytes as unknown as BufferSource,
      },
      key,
      ciphertextBytes as unknown as BufferSource
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (err) {
    throw new AamarvaCryptoError(
      'Failed to decrypt message. Verify that the session key matches the sender epoch.',
      'DECRYPTION_FAILED'
    );
  }
}

// ============================================================================
// Base64 Encoding / Decoding Helpers
// ============================================================================

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  const nodeBuffer = (globalThis as unknown as { Buffer?: { from: (b: Uint8Array) => { toString: (enc: string) => string } } }).Buffer;
  if (nodeBuffer) {
    return nodeBuffer.from(bytes).toString('base64');
  }
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return globalThis.btoa(binary);
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const nodeBuffer = (globalThis as unknown as { Buffer?: { from: (s: string, enc: string) => Uint8Array } }).Buffer;
  if (nodeBuffer) {
    const buf = nodeBuffer.from(base64, 'base64');
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }
  const binary = globalThis.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
