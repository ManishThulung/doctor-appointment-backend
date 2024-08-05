import bcrypt from "bcryptjs";

export class EncryptDecrypt {
  async encryptData(password: string): Promise<string> {
    const hashedData = await bcrypt.hash(password, 10);
    return hashedData;
  }
  async decryptData(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }
}
