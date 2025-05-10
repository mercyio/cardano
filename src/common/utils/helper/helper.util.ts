import * as bcrypt from 'bcryptjs';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import * as fs from 'fs';
// import { customAlphabet, nanoid } from 'nanoid';
import { ENVIRONMENT } from '../../configs/environment';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../logger';
import { WALLET_CONSTANT } from 'src/common/constants/walletConstant';
import { ethers } from 'ethers';

const encryptionKeyFromEnv = ENVIRONMENT.APP.ENCRYPTION_KEY;

export class BaseHelper {
  static generateRandomString(length = 8) {
    return randomBytes(length).toString('hex');
  }

  static async hashData(data: string) {
    return await bcrypt.hash(data, 12);
  }

  static async compareHashedData(data: string, hashed: string) {
    return await bcrypt.compare(data, hashed);
  }

  static encryptData(
    data: string,
    encryptionKey: string = encryptionKeyFromEnv,
  ): string {
    const iv = randomBytes(16); // Generate a 16-byte IV
    const cipher = createCipheriv(
      'aes-256-ctr',
      Buffer.from(encryptionKey),
      iv,
    );

    let encryptedData = cipher.update(data, 'utf8', 'hex');
    encryptedData += cipher.final('hex');
    return iv.toString('hex') + ':' + encryptedData;
  }

  static decryptData(
    encryptedData: string,
    encryptionKey: string = encryptionKeyFromEnv,
  ): string {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = parts.join(':');
    const decipher = createDecipheriv(
      'aes-256-ctr',
      Buffer.from(encryptionKey),
      iv,
    );
    let decryptedData = decipher.update(encryptedText, 'hex', 'utf8');
    decryptedData += decipher.final('utf8');
    return decryptedData;
  }

  /**
   * Generate 32 bytes (256 bits) of random data for AES-256 encryption
   *
   * @return {string} hexadecimal string representing the encryption key
   */
  static generateEncryptionKey(): string {
    const keyBytes = randomBytes(16);
    // Convert the random bytes to a hexadecimal string
    const encryptionKey = keyBytes.toString('hex');

    return encryptionKey;
  }

  static deleteFile(path: string) {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  }

  static parseStringToObject(string: string) {
    return string && typeof string === 'string' ? JSON.parse(string) : string;
  }

  static camelCaseToSpacedWords(input: string): string {
    return input.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  }

  static changeToCurrency(value: number): string {
    return value.toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    });
  }
  static generateUuid = () => {
    return uuidv4();
  };

  static createSignatureMessage = (
    walletAddress: string,
    nonce: string,
  ): string => {
    return `${WALLET_CONSTANT.walletMessagePrefix}\nWallet: ${walletAddress}\nNonce: ${nonce}`;
  };

  static verifyWalletSignature = (
    message: string,
    signature: string,
    walletAddress: string,
  ): boolean => {
    try {
      // Verify the signature using ethers.js
      const recoveredAddress = ethers.verifyMessage(message, signature);
      console.log('recoveredAddress', recoveredAddress);

      // Compare the recovered address with the provided wallet address (case-insensitive)
      return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error: unknown) {
      logger.error('Error verifying wallet signature', error, {
        walletAddress,
      });
      return false;
    }
  };

  static generateWallet() {
    const wallet = ethers.Wallet.createRandom();
    return {
      walletAddress: wallet.address,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      mnemonic: wallet.mnemonic?.phrase || '',
    };
  }
}
