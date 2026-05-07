/**
 * Secure storage for API keys and secrets
 * Provides encrypted storage with key rotation support
 */

import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const SCRYPT_OPTIONS = { N: 32768, r: 8, p: 1 };

export interface EncryptedData {
  iv: string;
  salt: string;
  authTag: string;
  data: string;
}

export interface KeyRotationOptions {
  oldKey?: string;
  newKey?: string;
  reencryptAll?: boolean;
}

/**
 * Derive encryption key from password using scrypt
 */
async function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

/**
 * Encrypt data using AES-256-GCM
 */
export async function encrypt(data: string, password: string): Promise<EncryptedData> {
  const iv = randomBytes(IV_LENGTH);
  const salt = randomBytes(SALT_LENGTH);
  const key = await deriveKey(password, salt);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    salt: salt.toString('hex'),
    authTag: authTag.toString('hex'),
    data: encrypted,
  };
}

/**
 * Decrypt data using AES-256-GCM
 */
export async function decrypt(encryptedData: EncryptedData, password: string): Promise<string> {
  const iv = Buffer.from(encryptedData.iv, 'hex');
  const salt = Buffer.from(encryptedData.salt, 'hex');
  const authTag = Buffer.from(encryptedData.authTag, 'hex');
  const key = await deriveKey(password, salt);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Secure key storage class
 */
export class SecureKeyStorage {
  private storageDir: string;
  private keyFile: string;
  private cache = new Map<string, string>();

  constructor(storageDir?: string) {
    this.storageDir = storageDir || join(homedir(), '.devkit', 'secure');
    this.keyFile = join(this.storageDir, 'keys.enc');
    this.ensureStorageDir();
  }

  private ensureStorageDir(): void {
    if (!existsSync(this.storageDir)) {
      mkdirSync(this.storageDir, { recursive: true, mode: 0o700 });
    }
  }

  /**
   * Store an API key securely
   */
  async storeKey(service: string, apiKey: string, masterPassword: string): Promise<void> {
    const encrypted = await encrypt(apiKey, masterPassword);
    const keyData = JSON.stringify({ [service]: encrypted });
    
    if (existsSync(this.keyFile)) {
      const existing = JSON.parse(readFileSync(this.keyFile, 'utf8'));
      Object.assign(existing, { [service]: encrypted });
      writeFileSync(this.keyFile, JSON.stringify(existing, null, 2), { mode: 0o600 });
    } else {
      writeFileSync(this.keyFile, keyData, { mode: 0o600 });
    }

    this.cache.set(service, apiKey);
  }

  /**
   * Retrieve an API key
   */
  async getKey(service: string, masterPassword: string): Promise<string | null> {
    // Check cache first
    if (this.cache.has(service)) {
      return this.cache.get(service)!;
    }

    if (!existsSync(this.keyFile)) {
      return null;
    }

    try {
      const data = JSON.parse(readFileSync(this.keyFile, 'utf8'));
      const encrypted = data[service];
      if (!encrypted) return null;

      const apiKey = await decrypt(encrypted, masterPassword);
      this.cache.set(service, apiKey);
      return apiKey;
    } catch {
      return null;
    }
  }

  /**
   * Delete an API key
   */
  deleteKey(service: string): void {
    this.cache.delete(service);

    if (existsSync(this.keyFile)) {
      const data = JSON.parse(readFileSync(this.keyFile, 'utf8'));
      delete data[service];
      writeFileSync(this.keyFile, JSON.stringify(data, null, 2), { mode: 0o600 });
    }
  }

  /**
   * Rotate master password and re-encrypt all keys
   */
  async rotateMasterPassword(
    oldPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; rotated: number; failed: string[] }> {
    if (!existsSync(this.keyFile)) {
      return { success: true, rotated: 0, failed: [] };
    }

    const data = JSON.parse(readFileSync(this.keyFile, 'utf8'));
    const rotated: string[] = [];
    const failed: string[] = [];

    for (const [service, encrypted] of Object.entries(data)) {
      try {
        const apiKey = await decrypt(encrypted as EncryptedData, oldPassword);
        const newEncrypted = await encrypt(apiKey, newPassword);
        data[service] = newEncrypted;
        rotated.push(service);
        this.cache.set(service, apiKey);
      } catch {
        failed.push(service);
      }
    }

    writeFileSync(this.keyFile, JSON.stringify(data, null, 2), { mode: 0o600 });

    return {
      success: failed.length === 0,
      rotated: rotated.length,
      failed,
    };
  }

  /**
   * List all stored services (without revealing keys)
   */
  listServices(): string[] {
    if (!existsSync(this.keyFile)) {
      return [];
    }

    try {
      const data = JSON.parse(readFileSync(this.keyFile, 'utf8'));
      return Object.keys(data);
    } catch {
      return [];
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Create a singleton instance of secure key storage
 */
let storageInstance: SecureKeyStorage | null = null;

export function getSecureStorage(storageDir?: string): SecureKeyStorage {
  if (!storageInstance) {
    storageInstance = new SecureKeyStorage(storageDir);
  }
  return storageInstance;
}
