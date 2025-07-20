/**
 * Encryption service using Web Crypto API for AES-GCM encryption
 * Provides zero-knowledge encryption for all sensitive financial data
 */
export class EncryptionService {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;
  private static readonly SALT_LENGTH = 16;
  private static readonly ITERATIONS = 100000;

  /**
   * Derives encryption key from PIN using PBKDF2
   */
  static async deriveKeyFromPin(pin: string, salt?: Uint8Array): Promise<{ key: CryptoKey; salt: Uint8Array }> {
    const encoder = new TextEncoder();
    const pinBuffer = encoder.encode(pin);
    
    const actualSalt = salt || crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
    
    const baseKey = await crypto.subtle.importKey(
      'raw',
      pinBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: actualSalt,
        iterations: this.ITERATIONS,
        hash: 'SHA-256'
      },
      baseKey,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH
      },
      false,
      ['encrypt', 'decrypt']
    );

    return { key, salt: actualSalt };
  }

  /**
   * Encrypts data using AES-GCM
   */
  static async encrypt(data: string, key: CryptoKey): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv: iv
      },
      key,
      dataBuffer
    );

    return { encrypted, iv };
  }

  /**
   * Decrypts data using AES-GCM
   */
  static async decrypt(encryptedData: ArrayBuffer, key: CryptoKey, iv: Uint8Array): Promise<string> {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv: iv
      },
      key,
      encryptedData
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  /**
   * Creates encrypted backup with checksum
   */
  static async createEncryptedBackup(data: any, pin: string): Promise<string> {
    const { key, salt } = await this.deriveKeyFromPin(pin);
    const jsonData = JSON.stringify(data);
    const { encrypted, iv } = await this.encrypt(jsonData, key);

    const backup = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      salt: Array.from(salt),
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted)),
      checksum: await this.generateChecksum(jsonData)
    };

    return JSON.stringify(backup);
  }

  /**
   * Restores data from encrypted backup
   */
  static async restoreFromEncryptedBackup(backupString: string, pin: string): Promise<any> {
    const backup = JSON.parse(backupString);
    const salt = new Uint8Array(backup.salt);
    const iv = new Uint8Array(backup.iv);
    const encryptedData = new Uint8Array(backup.data).buffer;

    const { key } = await this.deriveKeyFromPin(pin, salt);
    const decryptedData = await this.decrypt(encryptedData, key, iv);
    
    // Verify checksum
    const checksum = await this.generateChecksum(decryptedData);
    if (checksum !== backup.checksum) {
      throw new Error('Backup integrity check failed');
    }

    return JSON.parse(decryptedData);
  }

  /**
   * Generates SHA-256 checksum for data integrity
   */
  private static async generateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}