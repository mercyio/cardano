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

  static generateOTP(): number {
    return Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
  }

  static readonly isValidFileNameAwsUpload = (fileName: string) => {
    const regex =
      /^[a-zA-Z0-9_\-/]+\/[a-zA-Z0-9_-]+(?:-\d+)?\.(jpg|png|jpeg|webp)$/;
    return regex.test(fileName);
  };

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

  static generateFileName(folder = 'uploads', mimetype = 'image/jpg') {
    const uniqueId = crypto.randomUUID();
    const fileExtension = mimetype.split('/')[1];
    const validExtensions = ['jpg', 'png', 'jpeg', 'webp'];

    if (!validExtensions.includes(fileExtension)) {
      throw new Error('Invalid file extension');
    }

    return `${folder}/${uniqueId}.${fileExtension}`;
  }

  // static generateUniqueIdentifier(): string {
  //   const prefix = `${ENVIRONMENT.APP.NAME?.toUpperCase()}-`;
  //   const randomChars = nanoid();

  //   return `${prefix}${randomChars}`;
  // }

  static deleteFile(path: string) {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  }

  // static generateReferralCode(userId: string): string {
  //   // Generate a unique referral code for the user by combining the first 4 and last 3 digits of the user's ID
  //   const uniqueId =
  //     userId.toString().slice(0, 4) + userId.toString().slice(-3);
  //   const randomChars = nanoid(6);

  //   return `${uniqueId}${randomChars}`;
  // }

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

  // static generateReferenceCode(refPrefix?: string): string {
  //   const REF_NUMBER_LENGTH = 8;
  //   const REF_PREFIX = refPrefix || 'REF';
  //   const REF_ALPHABET = '0123456789';

  //   const date = new Date();
  //   const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');

  //   const numberGen = customAlphabet(REF_ALPHABET, REF_NUMBER_LENGTH);
  //   const uniqueNumber = numberGen();

  //   return `${REF_PREFIX}-${datePart}-${uniqueNumber}`;
  // }

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
