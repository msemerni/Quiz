
const {algorithm, key} = process.env;
import cryptoData from 'crypto';

if (!algorithm || !key) {
  throw new Error("process.env crypto error");
}

export const encrypt = (string: string): string => {
  const iv: string = cryptoData.randomBytes(8).toString('hex');
  const cipher: cryptoData.Cipher = cryptoData.createCipheriv(algorithm!, key!, iv);
  let encrypted: string = cipher.update(string, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${encrypted}:${iv}`;
}

export const decrypt = (data: string, iv: string): string => {
  const decipher: cryptoData.Decipher = cryptoData.createDecipheriv(algorithm!, key!, iv);
  let decrypted: string = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
