import CryptoJS from 'crypto-js';

/**
 * Advanced Cryptography Service
 * Handles AES encryption for medical records and hashing for integrity.
 */
export const CryptoService = {
  // Encrypt data with a secret key
  encrypt: (data: string, secretKey: string) => {
    return CryptoJS.AES.encrypt(data, secretKey).toString();
  },

  // Decrypt data with a secret key
  decrypt: (encryptedData: string, secretKey: string) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  },

  // Generate SHA-256 hash for data integrity
  hash: (data: string) => {
    return CryptoJS.SHA256(data).toString();
  },

  // Generate a random AES key
  generateKey: () => {
    return CryptoJS.lib.WordArray.random(32).toString();
  }
};
