import { Akord, Auth } from "@akord/akord-js";

// TODO: move to env variables
const AKORD_VAULT_ID = "mLFyJVDGsCiqdnMxQ7m8OdrZG84nA7FUhizGWDSBzqg";
const AKORD_USER = "sxcamacho@gmail.com";
const AKORD_PASSWORD = "vx7s3Sh5DkB2NhRs";
const ARWEAVE_URI = "https://arweave.net";

export class AkordUploader {
  private akord: Akord | undefined;

  async getInstance() {
    try {
      if (this.akord) return this.akord;

      const session = await Auth.signIn(AKORD_USER, AKORD_PASSWORD);
      this.akord = new Akord(session.wallet);
      return this.akord;
    } catch (error) {
      throw new Error(`Failed to initialize Akord: ${error}`);
    }
  }

  async uploadFile(
    files: Array<{ buffer: Buffer; fileName: string; contentType: string }>
  ): Promise<string[]> {
    const akord = await this.getInstance();
    const uploadRequests = files.map(async (file) => {
      if (!akord) throw new Error("Akord not initialized");
      const { uri } = await akord.stack.create(AKORD_VAULT_ID, file.buffer, {
        name: file.fileName,
        mimeType: file.contentType || undefined,
        public: true,
      });
      return `${ARWEAVE_URI}/${uri}`;
    });
    return Promise.all(uploadRequests);
  }

  async uploadJson(fileName:string, jsonData: any): Promise<string> {
    const akord = await this.getInstance();
    if (!akord) throw new Error("Akord not initialized");
    const jsonBuffer = Buffer.from(JSON.stringify(jsonData), "utf-8");
    const { uri } = await akord.stack.create(AKORD_VAULT_ID, jsonBuffer, {
      name: fileName,
      mimeType: "application/json",
      public: true,
    });
    return `${ARWEAVE_URI}/${uri}`;
  }
}
